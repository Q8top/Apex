// GET /api/waija-proxy-test
// Self-contained HTTP-proxy-CONNECT client for Cloudflare Workers.
// Uses cloudflare:sockets directly to avoid the 'workers-fetch-proxy'
// library's starttls bug. Only supports HTTPS targets through a
// plaintext HTTP proxy (which is exactly what Waija needs).
import { connect } from 'cloudflare:sockets';

async function readUntil(reader, needle) {
  var decoder = new TextDecoder();
  var buf = '';
  while (true) {
    var chunk = await reader.read();
    if (chunk.done) throw new Error('proxy closed early');
    buf += decoder.decode(chunk.value, { stream: true });
    var idx = buf.indexOf(needle);
    if (idx !== -1) {
      return { head: buf.slice(0, idx + needle.length), rest: buf.slice(idx + needle.length) };
    }
  }
}

async function proxyFetch(env, targetUrl, init) {
  init = init || {};
  var u = new URL(targetUrl);
  var targetHost = u.hostname;
  var targetPort = u.port || '443';
  var targetPort = u.port || '443';
  var proxyHost = env.WEBSHARE_PROXY_HOST;
  var proxyPort = Number(env.WEBSHARE_PROXY_PORT);
  var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);

  // 1. TCP to proxy (plaintext, but allow later startTls)
  var socket = connect(
    { hostname: proxyHost, port: proxyPort },
    { secureTransport: 'starttls' }
  );

  var writer = socket.writable.getWriter();
  var reader = socket.readable.getReader();

  // 2. CONNECT handshake
  var req = 'CONNECT ' + targetHost + ':' + targetPort + ' HTTP/1.1' + String.fromCharCode(13,10)
          + 'Host: ' + targetHost + ':' + targetPort + String.fromCharCode(13,10)
          + 'Proxy-Authorization: Basic ' + auth + String.fromCharCode(13,10)
          + String.fromCharCode(13,10);
  await writer.write(new TextEncoder().encode(req));

  var resp = await readUntil(reader, String.fromCharCode(13,10,13,10));
  if (resp.head.indexOf(' 200 ') === -1) {
    try { await socket.close(); } catch (e) {}
    throw new Error('proxy CONNECT failed: ' + resp.head.slice(0, 100));
  }

  // 3. Upgrade to TLS to the TARGET
  reader.releaseLock();
  writer.releaseLock();
  var tlsSocket = socket.startTls({ expectedServerHostname: targetHost });
  var tlsWriter = tlsSocket.writable.getWriter();
  var tlsReader = tlsSocket.readable.getReader();

  // 4. Send the HTTPS request
  var method = (init.method || 'GET').toUpperCase();
  var pathAndQuery = u.pathname + (u.search || '');
  var hdrs = init.headers || {};
  var bodyStr = init.body != null ? String(init.body) : null;
  var hlines = ['Host: ' + targetHost];
  for (var k in hdrs) {
    if (Object.prototype.hasOwnProperty.call(hdrs, k)) hlines.push(k + ': ' + hdrs[k]);
  }
  if (bodyStr !== null) hlines.push('Content-Length: ' + new TextEncoder().encode(bodyStr).length);
  hlines.push('Connection: close');
  var httpReq = method + ' ' + pathAndQuery + ' HTTP/1.1' + String.fromCharCode(13,10)
              + hlines.join(String.fromCharCode(13,10))
              + String.fromCharCode(13,10,13,10)
              + (bodyStr !== null ? bodyStr : '');
  await tlsWriter.write(new TextEncoder().encode(httpReq));
  try { await tlsWriter.close(); } catch (e) {}

  // 5. Read full response
  var decoder2 = new TextDecoder();
  var all = '';
  while (true) {
    var c = await tlsReader.read();
    if (c.done) break;
    all += decoder2.decode(c.value, { stream: true });
  }
  try { await tlsSocket.close(); } catch (e) {}

  var sep = all.indexOf(String.fromCharCode(13,10,13,10));
  if (sep === -1) throw new Error('bad response');
  var statusLine = all.slice(0, all.indexOf(String.fromCharCode(13,10)));
  var m = statusLine.match(/HTTP\/\d\.\d (\d+)/);
  var status = m ? Number(m[1]) : 0;
  var body = all.slice(sep + 4);
  return { status: status, body: body, raw_head: all.slice(0, sep) };
}

export async function onRequestGet(context) {
  var env = context.env;
  var out = { cfg: {
    host: env.WEBSHARE_PROXY_HOST,
    port: env.WEBSHARE_PROXY_PORT,
    user: env.WEBSHARE_PROXY_USERNAME ? 'SET' : 'MISSING',
    pass: env.WEBSHARE_PROXY_PASSWORD ? 'SET' : 'MISSING'
  }, results: [] };

  var targets = [
    'https://ipv4.webshare.io/',
    'https://api-eu-1.waija.com/api/'
  ];
  for (var i = 0; i < targets.length; i++) {
    var r = { target: targets[i] };
    try {
      var res = await proxyFetch(env, targets[i], { method: 'GET', headers: { 'Accept': 'application/json' } });
      r.ok = true;
      r.status = res.status;
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
