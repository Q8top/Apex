import { createHTTPProxy } from 'workers-fetch-proxy/http';

const TARGETS = [
  'https://example.com/',
  'http://ipv4.webshare.io/',
  'https://ipv4.webshare.io/',
  'https://api-eu-1.waija.com/api/'
];

async function probeOne(env, target) {
  const out = { target: target, ok: false };
  try {
    const proxy = createHTTPProxy({
      host: env.WEBSHARE_PROXY_HOST,
      port: Number(env.WEBSHARE_PROXY_PORT),
      username: env.WEBSHARE_PROXY_USERNAME,
      password: env.WEBSHARE_PROXY_PASSWORD
    });
    const res = await proxy.fetch(target, { method: 'GET' });
    out.status = res.status;
    const text = await res.text();
    out.body_head = text.slice(0, 120);
    out.ok = true;
  } catch (e) {
    out.error = String((e && e.message) || e);
  }
  return out;
}

export async function onRequestGet(context) {
  const { env } = context;
  const cfg = {
    host: env.WEBSHARE_PROXY_HOST,
    port: env.WEBSHARE_PROXY_PORT,
    user: env.WEBSHARE_PROXY_USERNAME ? 'SET' : 'MISSING',
    pass: env.WEBSHARE_PROXY_PASSWORD ? 'SET' : 'MISSING'
  };
  const results = [];
  for (const t of TARGETS) {
    results.push(await probeOne(env, t));
  }
  return new Response(JSON.stringify({ cfg: cfg, results: results }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
