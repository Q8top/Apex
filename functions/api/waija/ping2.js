// Import _waija.js only. If ping1 OK and ping2 502, _waija.js is the problem.
import { isConfigured } from '../../_waija.js';
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, level: 2, configured: isConfigured({}) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
