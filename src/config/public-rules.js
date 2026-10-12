/* Apex - Public rules feature flags (UI disclosure toggles).
 *
 * Mounted as window.ApexPublicRules (frozen). No server mirror.
 * This file lives on the client by design: it only controls what
 * the player is shown, never how outcomes are computed.
 *
 * STATUS: all five fields are RESERVED. As of this audit no
 * production consumer reads ApexPublicRules.* (verified via
 * grep across src/, functions/, tests/, tools/). They exist as
 * a contract for future UI work; keep them frozen so the shape
 * does not drift while the UI is being built.
 *
 * Field semantics (do not change values without a UI change):
 *   rules              show game rules entry in the menu
 *   paytable           show paytable tab inside rules
 *   freeSpinsRules     show free-spin rules section
 *   tumbleRules        show tumble/cascade rules section
 *   showTheoreticalRtp WARNING: turning this true does NOT by
 *                      itself display RTP anywhere. The UI must
 *                      first be wired to read this flag AND to
 *                      fetch an RTP string from a safe source.
 *                      Treating this as a live security gate is
 *                      unsafe; it is a reserved intent flag only.
 */
(function(){
'use strict';
window.ApexPublicRules = Object.freeze({
  rules: true,
  paytable: true,
  freeSpinsRules: true,
  tumbleRules: true,
  showTheoreticalRtp: false
});
})();
