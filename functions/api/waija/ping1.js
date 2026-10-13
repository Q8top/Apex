// Import _md5.js only. If ping0 OK and ping1 502, _md5.js is the problem.
import { md5 } from '../../_md5.js';
export async function onRequestGet() {
  const h = md5('hello');
  return new Response(JSON.stringify({ ok: true, level: 1, h }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
