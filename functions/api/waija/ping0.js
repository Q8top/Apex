// Minimal Waija ping - no imports. If this 502s, Pages Functions is
// broken for /api/waija/* entirely.
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, level: 0 }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
