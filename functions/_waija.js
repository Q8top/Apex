/* Apex x Waija aggregator client.
 *
 * Protocol notes (from documentation.waija.com):
 *   - All brand->Waija calls are POST to base URL with JSON body:
 *       { api_login, api_password, method, ...params }
 *   - Response: { error: 0, response: ... }  (0 = OK)
 *   - Callbacks (Waija->brand) are GET, always HTTP 200,
 *     signed by md5(timestamp + salt) == key.
 *   - Amounts are integer cents ($2.50 -> 250).
 */

import { md5 } from './_md5.js';

function baseUrl(env) {
  var b = (env && env.WAIJA_API_BASE) || 'https://api-eu-1.waija.com/';
  if (b.charAt(b.length - 1) !== '/') b += '/';
  return b;
}

export function isConfigured(env) {
  return !!(env && env.WAIJA_API_LOGIN && env.WAIJA_API_PASSWORD);
}

async function post(env, method, extra) {
  if (!isConfigured(env)) {
    return { ok: false, mock: true, error: 'waija_not_configured' };
  }
  var body = Object.assign({
    api_login: env.WAIJA_API_LOGIN,
    api_password: env.WAIJA_API_PASSWORD,
    method: method
  }, extra || {});
  // Route through the Wispbyte relay (fixed egress IP, Waija-whitelisted).
  // Direct calls from Cloudflare get 'Ip not whitelisted' because CF egress
  // IPs are shared and cannot be whitelisted.
  var relay = env.WAIJA_RELAY_URL;
  if (!relay) return { ok: false, mock: false, error: 'waija_relay_not_configured' };
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, 15000);
  try {
    var res = await fetch(relay, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    var text = await res.text();
    var json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) {}
    if (!res.ok || !json) return { ok: false, status: res.status, error: 'http_error', raw: text };
    if (json.error !== 0) {
      return { ok: false, status: res.status, waijaError: json.error,
        error: json.message || ('waija_error_' + json.error), data: json };
    }
    return { ok: true, status: res.status, data: json.response };
  } finally {
    clearTimeout(timer);
  }
}

export async function getGameList(env, opts) {
  opts = opts || {};
  return post(env, 'getGameList', {
    show_additional: true,
    show_systems: 0,
    list_type: 1,
    currency: opts.currency || (env && env.WAIJA_DEFAULT_CURRENCY) || 'USD'
  });
}

export async function getGameDemo(env, opts) {
  return post(env, 'getGameDemo', {
    lang: opts.lang || 'en',
    gameid: opts.gameid,
    homeurl: opts.homeurl,
    cashierurl: opts.cashierurl || opts.homeurl,
    currency: opts.currency || (env && env.WAIJA_DEFAULT_CURRENCY) || 'USD'
  });
}

export async function getGame(env, opts) {
  return post(env, 'getGame', {
    lang: opts.lang || 'en',
    user_username: opts.username,
    user_password: opts.userPassword,
    gameid: opts.gameid,
    homeurl: opts.homeurl,
    cashierurl: opts.cashierurl || opts.homeurl,
    play_for_fun: opts.playForFun ? 1 : 0,
    currency: opts.currency || (env && env.WAIJA_DEFAULT_CURRENCY) || 'USD'
  });
}

export async function createPlayer(env, opts) {
  return post(env, 'createPlayer', {
    user_username: opts.username,
    user_password: opts.userPassword,
    currency: opts.currency || (env && env.WAIJA_DEFAULT_CURRENCY) || 'USD'
  });
}

// Verify a Waija callback URL signature.
// Waija signs: md5(timestamp + salt) == key, timestamp within 30s.
// Returns { ok: true } or { ok: false, error: 2, reason: ... }.
export function verifyCallback(env, url) {
  var salt = env && env.WAIJA_SALT;
  if (!salt) return { ok: false, error: 2, reason: 'salt_not_configured' };
  var key = url.searchParams.get('key') || '';
  var ts  = url.searchParams.get('timestamp') || '';
  if (!key || !ts) return { ok: false, error: 2, reason: 'missing_key_or_ts' };
  var n = parseInt(ts, 10);
  if (!Number.isFinite(n)) return { ok: false, error: 2, reason: 'bad_timestamp' };
  var age = Math.abs(Math.floor(Date.now() / 1000) - n);
  if (age > 30) return { ok: false, error: 2, reason: 'stale_timestamp' };
  var expected = md5(String(ts) + String(salt));
  if (expected !== key) return { ok: false, error: 2, reason: 'signature_mismatch' };
  return { ok: true };
}
