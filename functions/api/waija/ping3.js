// ping3: import both _waija.js and _response.js, do nothing.
import { getGameList, isConfigured } from '../../_waija.js';
import { jsonResponse, optionsResponse } from '../../_response.js';
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, level: 3,
    hasFn: typeof getGameList === 'function',
    hasIsCfg: typeof isConfigured === 'function',
    hasJson: typeof jsonResponse === 'function',
    hasOpts: typeof optionsResponse === 'function'
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
