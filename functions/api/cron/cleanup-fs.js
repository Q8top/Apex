// S3-4b (Day3): global FS cleanup endpoint.
// Pages does NOT support wrangler [triggers] crons.
// Trigger options:
//   1. Manual:     curl -X POST -H 'X-Cron-Token: <CRON_TOKEN>' <host>/api/cron/cleanup-fs
//   2. GitHub Actions scheduled workflow (every 15 min)
//   3. cron-job.org / similar external scheduler
// Requires env.CRON_TOKEN to match header X-Cron-Token.

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost({ request, env }) {
  const expected = env && env.CRON_TOKEN;
  const got = request.headers.get('X-Cron-Token');
  if (!expected || !got || got !== expected) {
    return json({ success: false, code: 'unauthorized' }, 401);
  }
  const nowIso = new Date().toISOString();
  try {
    const r = await env.apex_db.prepare(
      "UPDATE free_spin_sessions SET status = 'expired', updated_at = ? " +
      "WHERE status = 'active' AND game_id = 'sugar-rush' " +
      "  AND (expires_at <= ? OR remaining_spins <= 0)"
    ).bind(nowIso, nowIso).run();
    return json({ success: true, cleaned: r.meta.changes || 0, at: nowIso });
  } catch (e) {
    return json({ success: false, code: 'db_error', message: e && e.message }, 500);
  }
}
