// GET /api/waija-proxy-test
// Final diagnostic: 3 independent tests to pin down whether
// Cloudflare Workers can do TLS at all, and whether it can do
// TLS through a CONNECT tunnel.
import { connect } from 'cloudflare:sockets';

async function readAll(reader) {
  var d = new TextDecoder();
  var s = '';
  while (true) {
    var c = await reader.read();
    if (c.done) break;
    s += d.decode(c.value, { stream: true });
  }
  return s;
}

// TEST 1: direct TLS to a public HTTPS server (no proxy)
async function test1() {
  var r = { name: 'direct_tls' };
  try {
    var sock = connect({ hostname: 'example.com', port: 443 },
                       { secureTransport: 'on' });
    var w = sock.writable.getWriter();
    await w.write(new TextEncoder().encode(
      'GET / HTTP/1.1' + String.fromCharCode(13,10) +
      'Host: example.com' + String.fromCharCode(13,10) +
      'Connection: close' + String.fromCharCode(13,10,13,10)));
    try { await w.close(); } catch (e) {}
    var text = await readAll(sock.readable.getReader());
    r.ok = true;
    r.first_line = text.split(String.fromCharCode(13,10))[0];
    try { await sock.close(); } catch (e) {}
  } catch (e) {
    r.ok = false; r.error = String((e && e.message) || e);
  }
  return r;
}

// TEST 2: plaintext connect to Webshare, no TLS upgrade
async function test2(env) {
  var r = { name: 'plaintext_to_proxy' };
  try {
    var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST,
                        port: Number(env.WEBSHARE_PROXY_PORT) },
                       { secureTransport: 'starttls' });
    var w = sock.writable.getWriter();
    await w.write(new TextEncoder().encode(
      'GET http://ipv4.webshare.io/ HTTP/1.1' + String.fromCharCode(13,10) +
      'Host: ipv4.webshare.io' + String.fromCharCode(13,10) +
      'Proxy-Authorization: Basic ' +
        btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD) +
        String.fromCharCode(13,10) +
      'Connection: close' + String.fromCharCode(13,10,13,10)));
    try { await w.close(); } catch (e) {}
    var text = await readAll(sock.readable.getReader());
    r.ok = true;
    r.first_line = text.split(String.fromCharCode(13,10))[0];
    r.has_ip = text.indexOf('45.38.107.97') !== -1;
    try { await sock.close(); } catch (e) {}
  } catch (e) {
    r.ok = false; r.error = String((e && e.message) || e);
  }
  return r;
}

// TEST 3: full CONNECT + startTls to Waija
async function test3(env) {
  var r = { name: 'connect_then_starttls' };
  try {
    var auth = btoa(env.WEBSHARE_PROXY_USERNAME + ':' + env.WEBSHARE_PROXY_PASSWORD);
    var sock = connect({ hostname: env.WEBSHARE_PROXY_HOST,
                        port: Number(env.WEBSHARE_PROXY_PORT) },
                       { secureTransport: 'starttls' });
    var w = sock.writable.getWriter();
    var rd = sock.readable.getReader();
    await w.write(new TextEncoder().encode(
      'CONNECT api-eu-1.waija.com:443 HTTP/1.1' + String.fromCharCode(13,10) +
      'Host: api-eu-1.waija.com:443' + String.fromCharCode(13,10) +
      'Proxy-Authorization: Basic ' + auth + String.fromCharCode(13,10) +
      String.fromCharCode(13,10)));
    var d = new TextDecoder();
    var head = '';
    while (head.indexOf(String.fromCharCode(13,10,13,10)) === -1) {
      var c = await rd.read();
      if (c.done) throw new Error('closed');
      head += d.decode(c.value, { stream: true });
    }
    r.connect_status = head.split(String.fromCharCode(13,10))[0];
    rd.releaseLock(); w.releaseLock();
    var tls = sock.startTls({ expectedServerHostname: 'api-eu-1.waija.com' });
    r.starttls_ok = true;
    try { await tls.close(); } catch (e) {}
    try { await sock.close(); } catch (e) {}
    r.ok = true;
  } catch (e) {
    r.ok = false; r.error = String((e && e.message) || e);
  }
  return r;
}

export async function onRequestGet(context) {
  var env = context.env;
  var out = { results: [] };
  out.results.push(await test1());
  out.results.push(await test2(env));
  out.results.push(await test3(env));
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
