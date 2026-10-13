// ping8: call getGameList and expose raw upstream response.
import { getGameList } from '../../_waija.js';
export async function onRequestGet({ env }) {
  try {
    const r = await getGameList(env, { currency: 'USD' });
    return new Response(JSON.stringify({
      ok: true, level: 8,
      r_ok: r.ok,
      r_status: r.status,
      r_error: r.error,
      r_waijaError: r.waijaError,
      r_raw: r.raw ? String(r.raw).slice(0, 600) : null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, level: 8,
      err_name: e && e.name, err_msg: e && e.message,
      err_stack: e && e.stack ? String(e.stack).slice(0, 400) : null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
