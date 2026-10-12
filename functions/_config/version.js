/* Apex - Global version registry (single source of truth).
 *
 * Mounted as window.ApexVersion (frozen).
 * Byte-identical mirror at functions/_config/version.js,
 * enforced by scripts/check-config-sync.sh in CI.
 *
 * Bump rules:
 *   game     - user-visible release milestone
 *              consumed by debug-boot / settings / spin.js
 *   math     - RNG/weights/paytable change that shifts RTP
 *              or hit rate; a math bump MUST be followed
 *              by a fresh rtp-gate run. Consumed by spin.js.
 *   symbols  - RESERVED. Will gate client cache when
 *              symbol renderer changes.
 *   asset    - RESERVED. Will gate CDN when icon/font/image
 *              bundles change.
 *   protocol - RESERVED. Wire format version between client
 *              and Functions. String so future values like
 *              '1.1' remain comparable without code change.
 *
 * Reserved fields MUST be annotated rather than removed; they
 * are referenced by tests/config/version.test.cjs contract.
 *
 * Semver: MAJOR.MINOR.PATCH per field.
 */
(function () {
  'use strict';
  window.ApexVersion = Object.freeze({
    VERSION: Object.freeze({
      game:     '1.0.0',
      math:     '1.0.0',
      symbols:  '1.0.0',
      asset:    '1.0.0',
      protocol: '1'
    })
  });
})();
