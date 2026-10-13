/* Apex x GGR Labs - brand-to-GGR API client.
 *
 * Authentication: brand API key via Authorization: Bearer.
 * Docs: GGR Labs Aggregator API 2026.06.14.
 *
 * When GGR_API_KEY is missing or starts with 'placeholder',
 * the client returns mock responses so the frontend can be
 * developed before onboarding is complete. Replace the key
 * in .dev.vars / Cloudflare secret to switch to real calls.
 */

const PLACEHOLDER_PREFIX = 'placeholder';

export function isConfigured(env) {
  const k = env && env.GGR_API_KEY;
  if (!k || typeof k !== 'string') return false;
  if (k.indexOf(PLACEHOLDER_PREFIX) === 0) return false;
  return true;
}

function apiHost(env) {
  const h = (env && env.GGR_API_HOST) || 'api.ggrlabs.com';
  return h.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function apiBase(env) {
  return 'https://' + apiHost(env);
}

async function request(env, method, path, body, timeoutMs) {
  const url = apiBase(env) + path;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs || 15000);
  try {
    const headers = { 'Accept': 'application/json' };
    headers['Authorization'] = 'Bearer ' + env.GGR_API_KEY;
    const init = { method, headers, signal: ctrl.signal };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const res = await fetch(url, init);
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) {}
    return { status: res.status, ok: res.ok, body: json, raw: text };
  } finally {
    clearTimeout(timer);
  }
}

// ---- Mock data (used before onboarding) ----
function mockGames() {
  return { games: [
    { identifier: 'pragmaticexternal:GatesOfOlympus', title: 'Gates of Olympus',
      provider: 'pragmaticexternal', producer: 'pragmatic', category: 'slots',
      thumbnail: '/games/thumbnail/pragmaticexternal/GatesOfOlympus.png',
      freespins: true, currencies: ['USD','EUR'] },
    { identifier: 'pragmaticexternal:SweetBonanza', title: 'Sweet Bonanza',
      provider: 'pragmaticexternal', producer: 'pragmatic', category: 'slots',
      thumbnail: '/games/thumbnail/pragmaticexternal/SweetBonanza.png',
      freespins: true, currencies: ['USD','EUR'] },
    { identifier: 'pragmaticexternal:BigBassBonanza', title: 'Big Bass Bonanza',
      provider: 'pragmaticexternal', producer: 'pragmatic', category: 'slots',
      thumbnail: '/games/thumbnail/pragmaticexternal/BigBassBonanza.png',
      freespins: true, currencies: ['USD','EUR'] },
  ] };
}

export async function listGames(env, opts) {
  if (!isConfigured(env)) {
    return { ok: true, mock: true, data: mockGames() };
  }
  const q = (opts && opts.currency) ? ('?currency=' + encodeURIComponent(opts.currency)) : '';
  const r = await request(env, 'GET', '/games' + q);
  return { ok: r.ok, mock: false, status: r.status, data: r.body, raw: r.raw };
}

export async function listProviders(env) {
  if (!isConfigured(env)) {
    return { ok: true, mock: true, data: { providers: [
      { id: 'pragmaticexternal', name: 'Pragmatic External', title: 'Pragmatic Play' }
    ] } };
  }
  const r = await request(env, 'GET', '/games/providers');
  return { ok: r.ok, mock: false, status: r.status, data: r.body, raw: r.raw };
}

export async function launchGame(env, params) {
  if (!isConfigured(env)) {
    return { ok: false, mock: true, status: 0,
      error: 'GGR_API_KEY not configured; cannot launch real game.' };
  }
  const payload = {
    game: params.game,
    player: params.player,
    mode: params.mode || 'demo',
    currency: params.currency || env.GGR_DEFAULT_CURRENCY || 'USD',
    clientType: params.clientType || 'desktop',
    deposit_url: params.deposit_url || env.GGR_DEPOSIT_URL,
    return_url: params.return_url || env.GGR_RETURN_URL,
    lobby_url: params.lobby_url || env.GGR_LOBBY_URL,
  };
  if (params.level) payload.level = params.level;
  const r = await request(env, 'POST', '/launch', payload);
  return { ok: r.ok, mock: false, status: r.status, data: r.body, raw: r.raw };
}

export async function getUsage(env) {
  if (!isConfigured(env)) {
    return { ok: false, mock: true, error: 'not configured' };
  }
  const r = await request(env, 'GET', '/usage');
  return { ok: r.ok, mock: false, status: r.status, data: r.body, raw: r.raw };
}
