// GET /api/waija-proxy-test
// Full POST-through-proxy test: proxy to Waija, send getGameList,
// return the real response.
import { connect } from 'cloudflare:sockets';

const CRLF = String.fromCharCode(13,10);
const DBL = CRLF + CRLF;

function timeout(ms, tag) {
  return new Promise(function(res){ setTimeout(function(){ res({ state: tag || 'timeout' }); }, ms); });
}

async function readHead(reader, deadlineMs) {
  var d = new TextDecoder();
  var head = '';
  var deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    var r = await Promise.race([
      reader.read(),
      timeout(Math.max(200, deadline - Date.now()), 'read_timeout')
    ]);
    if (r.state === 'read_timeout') return { head: head, rest: null, last: 'read_timeout' };
    if (r.done) return { head: head, rest: null, last: 'closed' };
    head += d.decode(r.value, { stream: true });
    if (head.indexOf(DBL) !== -1) {
      return { head: head, last: 'got_head' };
    }
  }
  return { head: head, last: 'deadline' };
}

async function postViaProxy(env, targetUrl, bodyObj) {
  var u = new URL(targetUrl);
  var host = u.hostname;
  var port = u.port || '443';
  var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);
  var bodyStr = JSON.stringify(bodyObj);
  var bodyBytes = new TextEncoder().encode(bodyStr);

  var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) });
  await Promise.race([sock.opened, timeout(8000, 'open_timeout')]);

  var w = sock.writable.getWriter();
  var rd = sock.readable.getReader();

  // CONNECT
  var req = 'CONNECT ' + host + ':' + port + ' HTTP/1.1' + CRLF +
            'Host: ' + host + ':' + port + CRLF +
            'Proxy-Authorization: Basic ' + auth + CRLF + CRLF;
  await w.write(new TextEncoder().encode(req));
  var cr = await readHead(rd, 8000);
  if (cr.head.indexOf(' 200 ') === -1) {
    try { await sock.close(); } catch (e) {}
    return { ok: false, stage: 'CONNECT', head: cr.head.slice(0, 200) };
  }
  var leftoverAfterHead = '';
  var idx = cr.head.indexOf(DBL);
  if (idx !== -1) leftoverAfterHead = cr.head.slice(idx + 4);
  try { rd.releaseLock(); } catch (e) {}
  try { w.releaseLock(); } catch (e) {}

  // TLS
  var tls = sock.startTls({ expectedServerHostname: host });
  var tw = tls.writable.getWriter();
  var tr = tls.readable.getReader();

  // HTTPS POST
  var path = u.pathname + (u.search || '');
  var lines = [
    'POST ' + path + ' HTTP/1.1',
    'Host: ' + host,
    'Content-Type: application/json',
    'Accept: application/json',
    'Content-Length: ' + bodyBytes.length,
    'Connection: close',
    ''
  ];
  var head = lines.join(CRLF) + CRLF;
  var payload = new Uint8Array(head.length + bodyBytes.length);
  payload.set(new TextEncoder().encode(head), 0);
  payload.set(bodyBytes, head.length);
  await tw.write(payload);
  try { await tw.close(); } catch (e) {}

  // Read all response
  var d2 = new TextDecoder();
  var all = leftoverAfterHead;
  var deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    var r = await Promise.race([
      tr.read(),
      timeout(Math.max(200, deadline - Date.now()), 'read_timeout')
    ]);
    if (r.state === 'read_timeout') break;
    if (r.done) break;
    all += d2.decode(r.value, { stream: true });
  }
  try { await tls.close(); } catch (e) {}
  try { await sock.close(); } catch (e) {}

  var sep = all.indexOf(DBL);
  var statusLine = all.split(CRLF)[0];
  var m = statusLine.match(/HTTP\/\d\.\d (\d+)/);
  var body = sep === -1 ? all : all.slice(sep + 4);
  return {
    ok: true,
    status: m ? Number(m[1]) : 0,
    status_line: statusLine,
    body_len: body.length,
    body_head: body.slice(0, 300)
  };
}

export async function onRequestGet(context) {
  var env = context.env;
  var out = { steps: [] };
  try {
    if (!env.WAIJA_API_LOGIN || !env.WAIJA_API_PASSWORD) {
      out.error = 'WAIJA_API_LOGIN / WAIJA_API_PASSWORD missing';
      return new Response(JSON.stringify(out, null, 2), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    var bodyObj = {
      api_login: env.WAIJA_API_LOGIN,
      api_password: env.WAIJA_API_PASSWORD,
      method: 'getGameList',
      show_additional: true,
      show_systems: 0,
      list_type: 1,
      currency: 'USD'
    };
    out.steps.push('POST https://api-eu-1.waija.com/api/ via Webshare proxy');
    var res = await postViaProxy(env, 'https://api-eu-1.waija.com/api/', bodyObj);
    out.result = res;
  } catch (e) {
    out.error = String((e && e.message) || e);
  }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
