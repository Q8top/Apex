import { connect } from 'cloudflare:sockets';

const CRLF = String.fromCharCode(13,10);
const DBL = CRLF + CRLF;

function timeout(ms, tag) {
  return new Promise(function(res){
    setTimeout(function(){ res({ state: tag || 'timeout' }); }, ms);
  });
}

async function testA(env) {
  var r = { name: 'A_opened' };
  var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) });
  try {
    var o = await Promise.race([
      sock.opened.then(function(v){ return { state: 'opened', remote: v && v.remoteAddress }; }),
      timeout(8000)
    ]);
    r.result = o;
    r.ok = o.state === 'opened';
  } catch (e) {
    r.ok = false;
    r.error = String((e && e.message) || e);
  } finally {
    try { await sock.close(); } catch (e) {}
  }
  return r;
}

async function testB(env) {
  var r = { name: 'B_idle_read_5s' };
  var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) });
  try {
    var o = await Promise.race([sock.opened.then(function(){ return 'opened'; }), timeout(8000)]);
    r.opened = o;
    if (o !== 'opened') return r;
    var rd = sock.readable.getReader();
    var rr = await Promise.race([
      rd.read().then(function(c){ return { state: 'read', done: c.done, bytes: c.value ? c.value.length : 0 }; }),
      timeout(5000, 'read_timeout')
    ]);
    r.read = rr;
    try { rd.releaseLock(); } catch (e) {}
  } catch (e) {
    r.error = String((e && e.message) || e);
  } finally {
    try { await sock.close(); } catch (e) {}
  }
  return r;
}

async function testC(env) {
  var r = { name: 'C_connect_handshake' };
  var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST, port: Number(env.WEBSHARE_PROXY_PORT) });
  try {
    var o = await Promise.race([sock.opened.then(function(){ return 'opened'; }), timeout(8000)]);
    r.opened = o;
    if (o !== 'opened') return r;
    var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);
    var req = 'CONNECT api-eu-1.waija.com:443 HTTP/1.1' + CRLF +
              'Host: api-eu-1.waija.com:443' + CRLF +
              'Proxy-Authorization: Basic ' + auth + CRLF + CRLF;
    var w = sock.writable.getWriter();
    await w.write(new TextEncoder().encode(req));
    var rd = sock.readable.getReader();
    var d = new TextDecoder();
    var head = '';
    var deadline = Date.now() + 8000;
    while (Date.now() < deadline && head.indexOf(DBL) === -1) {
      var c = await Promise.race([
        rd.read(),
        timeout(Math.max(200, deadline - Date.now()), 'read_timeout')
      ]);
      if (c.state === 'read_timeout') { r.last = 'read_timeout'; break; }
      if (c.done) { r.last = 'closed'; break; }
      head += d.decode(c.value, { stream: true });
    }
    r.head = head.slice(0, 400);
    r.got_crlf = head.indexOf(DBL) !== -1;
    r.status_line = head.split(CRLF)[0];
  } catch (e) {
    r.error = String((e && e.message) || e);
  } finally {
    try { await sock.close(); } catch (e) {}
  }
  return r;
}

export async function onRequestGet(context) {
  var env = context.env;
  var out = { results: [] };
  out.results.push(await testA(env));
  out.results.push(await testB(env));
  out.results.push(await testC(env));
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
