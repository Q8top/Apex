// GET /api/waija-proxy-test
// Full HTTPS-via-CONNECT proxy for Cloudflare Workers, with
// leftover-bytes preservation (the fix for 'TLS Handshake Failed').
import { connect } from 'cloudflare:sockets';

const CRLF = String.fromCharCode(13,10);
const DBL_CRLF = CRLF + CRLF;

// Read raw bytes until we see \r\n\r\n; keep trailing bytes.
async function readUntilCRLFCRLF(reader) {
  var chunks = [];
  var joined = new Uint8Array(0);
  while (true) {
    var c = await reader.read();
    if (c.done) throw new Error('proxy closed early');
    var nv = new Uint8Array(joined.length + c.value.length);
    nv.set(joined, 0);
    nv.set(c.value, joined.length);
    joined = nv;
    // find \r\n\r\n byte sequence
    for (var i = 0; i <= joined.length - 4; i++) {
      if (joined[i] === 13 && joined[i+1] === 10 &&
          joined[i+2] === 13 && joined[i+3] === 10) {
        var head = joined.slice(0, i + 4);
        var leftover = joined.slice(i + 4);
        return { head: head, leftover: leftover };
      }
    }
  }
}

function bytesToText(b) { return new TextDecoder().decode(b); }

// Wrap a reader so leftover bytes come out first.
async function* prepend(leftover, reader) {
  if (leftover && leftover.length > 0) yield leftover;
  while (true) {
    var c = await reader.read();
    if (c.done) return;
    yield c.value;
  }
}

async function readAllText(asyncIter) {
  var d = new TextDecoder();
  var s = '';
  for await (var v of asyncIter) s += d.decode(v, { stream: true });
  return s;
}

async function httpsViaProxy(env, targetUrl) {
  var u = new URL(targetUrl);
  var targetHost = u.hostname;
  var targetPort = u.port || '443';
  var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);

  var sock = connect(
    { hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) },
    { secureTransport: 'starttls' }
  );

  var w = sock.writable.getWriter();
  var rd = sock.readable.getReader();

  // 1. CONNECT handshake
  var req = 'CONNECT ' + targetHost + ':' + targetPort + ' HTTP/1.1' + CRLF +
            'Host: ' + targetHost + ':' + targetPort + CRLF +
            'Proxy-Authorization: Basic ' + auth + CRLF + CRLF;
  await w.write(new TextEncoder().encode(req));

  var resp = await readUntilCRLFCRLF(rd);
  var headText = bytesToText(resp.head);
  var statusLine = headText.split(CRLF)[0];
  if (headText.indexOf(' 200 ') === -1) {
    try { await sock.close(); } catch (e) {}
    throw new Error('CONNECT failed: ' + statusLine);
  }
  var leftover = resp.leftover;
  rd.releaseLock();
  w.releaseLock();

  // 2. TLS upgrade
  var tls = sock.startTls({ expectedServerHostname: targetHost });
  var tlsW = tls.writable.getWriter();
  var tlsR = tls.readable.getReader();

  // 3. Send HTTPS request
  var method = 'GET';
  var pathAndQuery = u.pathname + (u.search || '');
  var httpReq = method + ' ' + pathAndQuery + ' HTTP/1.1' + CRLF +
                'Host: ' + targetHost + CRLF +
                'Accept: application/json' + CRLF +
                'Connection: close' + CRLF + CRLF;
  await tlsW.write(new TextEncoder().encode(httpReq));
  try { await tlsW.close(); } catch (e) {}

  // 4. Read full response -- leftover bytes first, then TLS stream
  var full = await readAllText(prepend(leftover, tlsR));
  try { await tls.close(); } catch (e) {}
  try { await sock.close(); } catch (e) {}

  var sep = full.indexOf(DBL_CRLF);
  var statusLine2 = full.split(CRLF)[0];
  var m = statusLine2.match(/HTTP\/\d\.\d (\d+)/);
  return {
    status: m ? Number(m[1]) : 0,
    head: full.slice(0, sep),
    body: sep === -1 ? full : full.slice(sep + 4),
    leftover_len: leftover.length
  };
}

export async function onRequestGet(context) {
  var env = context.env;
  var targets = [
    'https://ipv4.webshare.io/',
    'https://api-eu-1.waija.com/api/'
  ];
  var out = { results: [] };
  for (var i = 0; i < targets.length; i++) {
    var r = { target: targets[i] };
    try {
      var res = await httpsViaProxy(env, targets[i]);
      r.ok = true;
      r.status = res.status;
      r.leftover_len = res.leftover_len;
      r.body_head = String(res.body).slice(0, 200);
    } catch (e) {
      r.ok = false;
      r.error = String((e && e.message) || e);
    }
    out.results.push(r);
  }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
