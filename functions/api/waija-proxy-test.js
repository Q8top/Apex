// GET /api/waija-proxy-test
// Isolated probe: does the Webshare HTTP proxy work from
// Cloudflare Pages Functions? Returns the egress IP the
// proxy reports to the outside world.
import { createHTTPProxy } from 'workers-fetch-proxy/http';

export async function onRequestGet(context) {
  const { env } = context;
  const out = { ok: false, steps: [] };
  try {
    out.steps.push('env.host=' + (env.WEBSHARE_PROXY_HOST || 'MISSING'));
    out.steps.push('env.port=' + (env.WEBSHARE_PROXY_PORT || 'MISSING'));
    out.steps.push('env.user=' + (env.WEBSHARE_PROXY_USERNAME ? 'SET' : 'MISSING'));
    out.steps.push('env.pass=' + (env.WEBSHARE_PROXY_PASSWORD ? 'SET' : 'MISSING'));

    const proxy = createHTTPProxy({
      host: env.WEBSHARE_PROXY_HOST,
      port: Number(env.WEBSHARE_PROXY_PORT),
      username: env.WEBSHARE_PROXY_USERNAME,
      password: env.WEBSHARE_PROXY_PASSWORD
    });
    out.steps.push('proxy created');

    const res = await proxy.fetch('https://ipv4.webshare.io/');
    out.steps.push('proxy.fetch status=' + res.status);
    const text = await res.text();
    out.egress_ip = text.trim();
    out.ok = true;
  } catch (e) {
    out.error = String(e && e.message || e);
    out.error_name = e && e.name;
  }
  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
