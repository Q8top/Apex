// GET /api/waija-proxy-test
// Raw-byte CONNECT probe: capture exactly what the proxy sends
// after 200 OK, so we can see if ServerHello is over-read.
import { connect } from 'cloudflare:sockets';

const CRLF = String.fromCharCode(13,10);
const DBL = CRLF + CRLF;

function timeout(ms, tag) {
  return new Promise(function(res){ setTimeout(function(){ res({ state: tag }); }, ms); });
}

async function probe(env) {
  var r = { steps: [] };
  var sock = connect(
    { hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) },
    { secureTransport: 'starttls' }
  );
  await Promise.race([sock.opened, timeout(8000, 'open_to')]);
  r.steps.push('opened');

  var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);
  var req = 'CONNECT api-eu-1.waija.com:443 HTTP/1.1' + CRLF +
            'Host: api-eu-1.waija.com:443' + CRLF +
            'Proxy-Authorization: Basic ' + auth + CRLF + CRLF;
  var w = sock.writable.getWriter();
  await w.write(new TextEncoder().encode(req));
  r.steps.push('wrote CONNECT');

  var rd = sock.readable.getReader();
  var first = await Promise.race([rd.read(), timeout(8000, 'to1')]);
  if (first.state === 'to1') { r.err = 'read1 timeout'; return r; }
  if (first.done) { r.err = 'read1 closed'; return r; }
  var chunk = first.value;
  r.first_chunk_len = chunk.length;
  r.first_chunk_hex = '';
  for (var i = 0; i < Math.min(chunk.length, 80); i++) {
    r.first_chunk_hex += ('0' + chunk[i].toString(16)).slice(-2);
  }

  // find \r\n\r\n in raw bytes
  var headEnd = -1;
  for (var j = 0; j <= chunk.length - 4; j++) {
    if (chunk[j] === 13 && chunk[j+1] === 10 && chunk[j+2] === 13 && chunk[j+3] === 10) {
      headEnd = j + 4;
      break;
    }
  }
  r.head_end = headEnd;
  r.leftover_len = headEnd > 0 ? chunk.length - headEnd : 0;
  if (headEnd > 0 && chunk.length > headEnd) {
    r.leftover_hex = '';
    for (var k = headEnd; k < Math.min(chunk.length, headEnd + 30); k++) {
      r.leftover_hex += ('0' + chunk[k].toString(16)).slice(-2);
    }
  }
  r.steps.push('read first chunk');
  try { rd.releaseLock(); } catch (e) {}
  try { w.releaseLock(); } catch (e) {}

  // try startTls
  try {
    var tls = sock.startTls({ expectedServerHostname: 'api-eu-1.waija.com' });
    r.steps.push('startTls returned');
    var tw = tls.writable.getWriter();
    var tr = tls.readable.getReader();
    var body = JSON.stringify({
      api_login: env.WAIJA_API_LOGIN,
      api_password: env.WAIJA_API_PASSWORD,
      method: 'getGameList',
      show_additional: true,
      show_systems: 0,
      list_type: 1,
      currency: 'USD'
    });
    var bodyBytes = new TextEncoder().encode(body);
    var httpHead = 'POST /api/ HTTP/1.1' + CRLF +
                   'Host: api-eu-1.waija.com' + CRLF +
                   'Content-Type: application/json' + CRLF +
                   'Content-Length: ' + bodyBytes.length + CRLF +
                   'Connection: close' + CRLF + CRLF;
    var payload = new Uint8Array(httpHead.length + bodyBytes.length);
    payload.set(new TextEncoder().encode(httpHead), 0);
    payload.set(bodyBytes, httpHead.length);
    await tw.write(payload);
    try { await tw.close(); } catch (e) {}
    r.steps.push('wrote HTTPS request');

    var readRes = await Promise.race([
      tr.read().then(function(c){ return { state: 'read', done: c.done, len: c.value ? c.value.length : 0, hex: (c.value && c.value.length) ? Array.from(c.value.slice(0,30)).map(function(b){return ('0'+b.toString(16)).slice(-2);}).join('') : '' }; }),
      timeout(15000, 'read_timeout')
    ]);
    r.tls_first_read = readRes;
  } catch (e) {
    r.tls_error = String((e && e.message) || e);
    r.tls_error_name = e && e.name;
  }
  try { await sock.close(); } catch (e) {}
  return r;
}

export async function onRequestGet(context) {
  var env = context.env;
  var out = {};
  try { out = await probe(env); }
  catch (e) { out.err = String((e && e.message) || e); }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
