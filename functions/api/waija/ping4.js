// ping4: import both, actually call getGameList (should hit waija).
import { getGameList, isConfigured } from '../../_waija.js';
export async function onRequestGet({ env }) {
  try {
    const r = await getGameList(env, { currency: 'USD' });
    return new Response(JSON.stringify({ ok: true, level: 4,
      r_ok: r.ok, count: (r.data && Array.isArray(r.data)) ? r.data.length : -1,
      err: r.error || null, waijaErr: r.waijaError || null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, level: 4,
      err: String(e && e.message || e) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
