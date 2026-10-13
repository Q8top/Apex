// ping5: full handler signature with context.request + URL, plain Response.
export async function onRequestGet(context) {
  const { request } = context;
  const requestId = context.data && context.data.requestId ? context.data.requestId : '';
  try {
    const url = new URL(request.url);
    return new Response(JSON.stringify({
      ok: true, level: 5,
      url: url.pathname,
      hasReq: !!request,
      reqId: requestId
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, level: 5,
      err: String(e && e.message || e) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
}
