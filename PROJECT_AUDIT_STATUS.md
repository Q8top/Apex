# PROJECT AUDIT STATUS

Mode: per-file freeze audit
Rule: no batch / no skip / no push until all FROZEN + global gate PASS

## Legend

| Flag | Meaning |
|---|---|
| NA  | NOT_AUDITED |
| IP  | IN_PROGRESS |
| FX  | FIXED (edit applied, not verified) |
| VF  | VERIFIED (tests green) |
| FZ  | FROZEN (final) |
| FN  | FROZEN_NO_CHANGE |
| FAIL| FAIL (blocker) |

## Totals

| cat | count |
|---|---|
| config | 5 |
| config-root | 4 |
| engine | 36 |
| server | 90 |
| css | 15 |
| js | 63 |
| html | 9 |
| audio | 15 |
| font | 3 |
| image | 16 |
| migration | 36 |
| test | 79 |
| script | 26 |
| ci | 8 |
| doc | 32 |
| other | 10 |
| **total** | **447** |

## Files by audit order


### [config] (5 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `src/config/math-profile.js` | 6083 | `3be708ae` | - | **FROZEN** |
| 2 | `src/config/paytable.locked.js` | 3312 | `bf535a8a` | - | **FROZEN** |
| 3 | `src/config/public-rules.js` | 1419 | `1a22e5a9` | - | **FROZEN** |
| 4 | `src/config/symbols.locked.js` | 4517 | `c65fdc47` | - | **FROZEN** |
| 5 | `src/config/version.js` | 1302 | `06c860f9` | - | **FROZEN** |

### [config-root] (4 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `_routes.json` | 492 | `6366c00b` | - | NOT_AUDITED |
| 2 | `package-lock.json` | 49486 | `fd883be0` | - | NOT_AUDITED |
| 3 | `package.json` | 3639 | `135e0992` | - | NOT_AUDITED |
| 4 | `wrangler.toml` | 1262 | `37de5c70` | - | NOT_AUDITED |

### [engine] (36 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `src/engine/bonus.js` | 2282 | `3d76fd82` | - | NOT_AUDITED |
| 2 | `src/engine/errors.js` | 3395 | `c91641a4` | - | **FROZEN** |
| 3 | `src/engine/evaluator.js` | 2061 | `6267b608` | - | NOT_AUDITED |
| 4 | `src/engine/game-engine.js` | 7403 | `27fe4d0a` | - | NOT_AUDITED |
| 5 | `src/engine/grid.js` | 2605 | `21db1e1d` | - | **FROZEN** |
| 6 | `src/engine/multiplier.js` | 1013 | `165b7590` | - | NOT_AUDITED |
| 7 | `src/engine/payout.js` | 3831 | `8ed5d5bb` | - | **FROZEN** |
| 8 | `src/engine/rng.js` | 4447 | `c38059c6` | - | **FROZEN** |
| 9 | `src/engine/tumble.js` | 1369 | `57bd0d12` | - | NOT_AUDITED |
| 10 | `src/games/registry.js` | 3780 | `ac5f8fdf` | - | **FROZEN** |
| 11 | `src/games/sugar-rush/config/math-profile.js` | 2464 | `a8d0a0ca` | - | NOT_AUDITED |
| 12 | `src/games/sugar-rush/config/paytable.locked.js` | 1517 | `785deb55` | - | NOT_AUDITED |
| 13 | `src/games/sugar-rush/config/symbols.locked.js` | 2117 | `a816be33` | - | NOT_AUDITED |
| 14 | `src/games/sugar-rush/css/game-v2.css` | 39718 | `70114311` | - | NOT_AUDITED |
| 15 | `src/games/sugar-rush/engine/bonus.js` | 2709 | `bada87a5` | - | NOT_AUDITED |
| 16 | `src/games/sugar-rush/engine/cap.js` | 1651 | `333588a6` | - | NOT_AUDITED |
| 17 | `src/games/sugar-rush/engine/errors.js` | 555 | `b8b82dc2` | - | NOT_AUDITED |
| 18 | `src/games/sugar-rush/engine/evaluator.js` | 3038 | `f24e4d7f` | - | NOT_AUDITED |
| 19 | `src/games/sugar-rush/engine/game-engine.js` | 9347 | `1df07515` | - | NOT_AUDITED |
| 20 | `src/games/sugar-rush/engine/grid.js` | 600 | `1ef33746` | - | NOT_AUDITED |
| 21 | `src/games/sugar-rush/engine/multiplier.js` | 4894 | `f8091f2e` | - | NOT_AUDITED |
| 22 | `src/games/sugar-rush/engine/payout.js` | 1462 | `bc894580` | - | NOT_AUDITED |
| 23 | `src/games/sugar-rush/engine/rng.js` | 1882 | `6fce66dd` | - | NOT_AUDITED |
| 24 | `src/games/sugar-rush/engine/tumble.js` | 1411 | `6bf02daf` | - | NOT_AUDITED |
| 25 | `src/games/sugar-rush/js/audio-v2.js` | 8072 | `64bdf7fe` | - | NOT_AUDITED |
| 26 | `src/games/sugar-rush/js/main-v2.js` | 40904 | `d0ed3121` | - | NOT_AUDITED |
| 27 | `src/games/sugar-rush/js/real-gateway.js` | 2187 | `0896244a` | - | NOT_AUDITED |
| 28 | `src/games/sugar-rush/js/symbols-v3.js` | 16609 | `c435cb1c` | - | NOT_AUDITED |
| 29 | `src/games/sugar-rush/js/ui/history-v2.js` | 4266 | `0f67ebad` | - | NOT_AUDITED |
| 30 | `src/games/sugar-rush/js/ui/i18n-bind.js` | 1695 | `e6c75622` | - | NOT_AUDITED |
| 31 | `src/games/sugar-rush/js/ui/rules-v2.js` | 8044 | `3d53f552` | - | NOT_AUDITED |
| 32 | `src/games/sugar-rush/js/ui/settings-v2.js` | 3598 | `5d1f4856` | - | NOT_AUDITED |
| 33 | `src/games/sugar-rush/js/ui/sheet-v2.js` | 3599 | `b8bce387` | - | NOT_AUDITED |
| 34 | `src/games/sugar-rush/symbols-preview.html` | 1772 | `22d81419` | - | NOT_AUDITED |
| 35 | `src/js/engine/symbols-v2.js` | 18553 | `f0a50792` | - | NOT_AUDITED |
| 36 | `tests/engine/all.test.cjs` | 12813 | `8ec43030` | - | NOT_AUDITED |

### [server] (90 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `functions/_audit.js` | 1253 | `ccd03364` | - | NOT_AUDITED |
| 2 | `functions/_auth.js` | 6027 | `f70140c3` | - | NOT_AUDITED |
| 3 | `functions/_captcha.js` | 5851 | `a565673f` | - | NOT_AUDITED |
| 4 | `functions/_cbor.js` | 3225 | `915a30e4` | - | NOT_AUDITED |
| 5 | `functions/_config-bridge.js` | 683 | `f2139e43` | - | NOT_AUDITED |
| 6 | `functions/_config.js` | 2844 | `4e23a569` | - | NOT_AUDITED |
| 7 | `functions/_config/math-profile.js` | 5208 | `93342af2` | - | NOT_AUDITED |
| 8 | `functions/_config/paytable.locked.js` | 1248 | `0dc39e68` | - | NOT_AUDITED |
| 9 | `functions/_config/symbols.locked.js` | 2099 | `0b3dce6b` | - | NOT_AUDITED |
| 10 | `functions/_config/version.js` | 216 | `34dde46b` | - | NOT_AUDITED |
| 11 | `functions/_csrf.js` | 3114 | `05856a80` | - | NOT_AUDITED |
| 12 | `functions/_email.js` | 8064 | `34d3ebf1` | - | NOT_AUDITED |
| 13 | `functions/_emailVerify.js` | 491 | `e81bb613` | - | NOT_AUDITED |
| 14 | `functions/_engine/bonus.js` | 2282 | `3d76fd82` | - | NOT_AUDITED |
| 15 | `functions/_engine/errors.js` | 855 | `e37d9c51` | - | NOT_AUDITED |
| 16 | `functions/_engine/evaluator.js` | 2061 | `6267b608` | - | NOT_AUDITED |
| 17 | `functions/_engine/game-engine.js` | 6767 | `f56dd813` | - | NOT_AUDITED |
| 18 | `functions/_engine/grid.js` | 595 | `14a86440` | - | NOT_AUDITED |
| 19 | `functions/_engine/multiplier.js` | 1013 | `165b7590` | - | NOT_AUDITED |
| 20 | `functions/_engine/payout.js` | 1459 | `48dc07d6` | - | NOT_AUDITED |
| 21 | `functions/_engine/rng.js` | 1875 | `06af8aa6` | - | NOT_AUDITED |
| 22 | `functions/_engine/tumble.js` | 1369 | `57bd0d12` | - | NOT_AUDITED |
| 23 | `functions/_errors.js` | 200 | `49d21f02` | - | NOT_AUDITED |
| 24 | `functions/_game-bridge.js` | 1017 | `e5bc053f` | - | NOT_AUDITED |
| 25 | `functions/_logs.js` | 924 | `e381da62` | - | NOT_AUDITED |
| 26 | `functions/_middleware.js` | 5268 | `d04f3078` | - | NOT_AUDITED |
| 27 | `functions/_passkey.js` | 4600 | `9d286d71` | - | NOT_AUDITED |
| 28 | `functions/_password.js` | 4706 | `e7035bf1` | - | NOT_AUDITED |
| 29 | `functions/_provably-fair.js` | 1592 | `5f9bd7c5` | - | NOT_AUDITED |
| 30 | `functions/_rateLimit.js` | 2688 | `4607fc0f` | - | NOT_AUDITED |
| 31 | `functions/_response.js` | 1953 | `ffa00875` | - | NOT_AUDITED |
| 32 | `functions/_rollout.js` | 2113 | `2ba4f518` | - | NOT_AUDITED |
| 33 | `functions/_security.js` | 5230 | `300507a3` | - | NOT_AUDITED |
| 34 | `functions/_session.js` | 285 | `4d0b5dfd` | - | NOT_AUDITED |
| 35 | `functions/_sugar-rush-bridge.js` | 3433 | `58c9da2a` | - | NOT_AUDITED |
| 36 | `functions/_utils.js` | 3402 | `aced5a97` | - | NOT_AUDITED |
| 37 | `functions/_validation.js` | 9114 | `7dd12dab` | - | NOT_AUDITED |
| 38 | `functions/_webauthn.js` | 9287 | `5235aed8` | - | NOT_AUDITED |
| 39 | `functions/api/captcha/challenge.js` | 1360 | `8746c74b` | - | NOT_AUDITED |
| 40 | `functions/api/captcha/verify.js` | 2439 | `bbb53cf5` | - | NOT_AUDITED |
| 41 | `functions/api/cron/cleanup-fs.js` | 1323 | `f69bbdc9` | - | NOT_AUDITED |
| 42 | `functions/api/csp-report.js` | 5383 | `f439c317` | - | NOT_AUDITED |
| 43 | `functions/api/delete-account.js` | 3036 | `ca3e8178` | - | NOT_AUDITED |
| 44 | `functions/api/game/buy-fs.js` | 8496 | `6b84ec6f` | - | NOT_AUDITED |
| 45 | `functions/api/game/history.js` | 1959 | `06fcb552` | - | NOT_AUDITED |
| 46 | `functions/api/game/spin.js` | 17594 | `5ef73811` | - | NOT_AUDITED |
| 47 | `functions/api/game/state.js` | 1910 | `7d8b3290` | - | NOT_AUDITED |
| 48 | `functions/api/game/sugar-rush-spin-status.js` | 1274 | `3ee45844` | - | NOT_AUDITED |
| 49 | `functions/api/game/sugar-rush-spin.js` | 19842 | `24e0c965` | - | NOT_AUDITED |
| 50 | `functions/api/health.js` | 743 | `48cd10ca` | - | NOT_AUDITED |
| 51 | `functions/api/log.js` | 2273 | `5ef5b3bf` | - | NOT_AUDITED |
| 52 | `functions/api/login.js` | 5817 | `139465d4` | - | NOT_AUDITED |
| 53 | `functions/api/logout.js` | 1439 | `37caaab0` | - | NOT_AUDITED |
| 54 | `functions/api/me.js` | 1694 | `5eeb07dc` | - | NOT_AUDITED |
| 55 | `functions/api/metrics.js` | 6583 | `79d22a74` | - | NOT_AUDITED |
| 56 | `functions/api/passkey/delete.js` | 2693 | `64306939` | - | NOT_AUDITED |
| 57 | `functions/api/passkey/list.js` | 1276 | `f3a44434` | - | NOT_AUDITED |
| 58 | `functions/api/passkey/login-challenge.js` | 2237 | `302436df` | - | NOT_AUDITED |
| 59 | `functions/api/passkey/login-verify.js` | 7355 | `4c78aaf7` | - | NOT_AUDITED |
| 60 | `functions/api/passkey/recover-challenge.js` | 4776 | `a138b3fa` | - | NOT_AUDITED |
| 61 | `functions/api/passkey/recover-verify.js` | 12064 | `c33ee2d2` | - | NOT_AUDITED |
| 62 | `functions/api/passkey/register-challenge.js` | 2373 | `1907b82a` | - | NOT_AUDITED |
| 63 | `functions/api/passkey/register-verify.js` | 6481 | `882ba4d0` | - | NOT_AUDITED |
| 64 | `functions/api/passkey/signup-challenge.js` | 3827 | `575943d5` | - | NOT_AUDITED |
| 65 | `functions/api/passkey/signup-verify.js` | 8634 | `daa5a09e` | - | NOT_AUDITED |
| 66 | `functions/api/pay/deposit.js` | 2261 | `f7ea4c8d` | - | NOT_AUDITED |
| 67 | `functions/api/ready.js` | 1545 | `3265a880` | - | NOT_AUDITED |
| 68 | `functions/api/register.js` | 3748 | `4e79dfab` | - | NOT_AUDITED |
| 69 | `functions/api/reset-password.js` | 5106 | `9834d91c` | - | NOT_AUDITED |
| 70 | `functions/api/send-reset-code.js` | 3411 | `e6a1f5e8` | - | NOT_AUDITED |
| 71 | `functions/api/send-verify-email.js` | 3706 | `2b73956e` | - | NOT_AUDITED |
| 72 | `functions/api/sessions.js` | 2450 | `38a46bdd` | - | NOT_AUDITED |
| 73 | `functions/api/status.js` | 1882 | `03663c2d` | - | NOT_AUDITED |
| 74 | `functions/api/verify-email.js` | 2945 | `4a3331be` | - | NOT_AUDITED |
| 75 | `functions/api/wallet/deposit.js` | 1278 | `3635e66a` | - | NOT_AUDITED |
| 76 | `functions/api/wallet/withdraw.js` | 1139 | `24ac9957` | - | NOT_AUDITED |
| 77 | `functions/games/sugar-rush/config/math-profile.js` | 2464 | `a8d0a0ca` | - | NOT_AUDITED |
| 78 | `functions/games/sugar-rush/config/math-profile.real.js` | 883 | `985a27d5` | - | NOT_AUDITED |
| 79 | `functions/games/sugar-rush/config/paytable.locked.js` | 1517 | `785deb55` | - | NOT_AUDITED |
| 80 | `functions/games/sugar-rush/config/symbols.locked.js` | 2117 | `a816be33` | - | NOT_AUDITED |
| 81 | `functions/games/sugar-rush/engine/bonus.js` | 2709 | `bada87a5` | - | NOT_AUDITED |
| 82 | `functions/games/sugar-rush/engine/cap.js` | 1651 | `333588a6` | - | NOT_AUDITED |
| 83 | `functions/games/sugar-rush/engine/errors.js` | 555 | `b8b82dc2` | - | NOT_AUDITED |
| 84 | `functions/games/sugar-rush/engine/evaluator.js` | 3038 | `f24e4d7f` | - | NOT_AUDITED |
| 85 | `functions/games/sugar-rush/engine/game-engine.js` | 9347 | `1df07515` | - | NOT_AUDITED |
| 86 | `functions/games/sugar-rush/engine/grid.js` | 600 | `1ef33746` | - | NOT_AUDITED |
| 87 | `functions/games/sugar-rush/engine/multiplier.js` | 4894 | `f8091f2e` | - | NOT_AUDITED |
| 88 | `functions/games/sugar-rush/engine/payout.js` | 1462 | `bc894580` | - | NOT_AUDITED |
| 89 | `functions/games/sugar-rush/engine/rng.js` | 1882 | `6fce66dd` | - | NOT_AUDITED |
| 90 | `functions/games/sugar-rush/engine/tumble.js` | 1411 | `6bf02daf` | - | NOT_AUDITED |

### [css] (15 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `src/css/404.css` | 1916 | `6b48021e` | - | NOT_AUDITED |
| 2 | `src/css/announcements.css` | 4263 | `735da00a` | - | NOT_AUDITED |
| 3 | `src/css/apex-app.css` | 26723 | `105ac3b8` | - | NOT_AUDITED |
| 4 | `src/css/apex-boot.css` | 1370 | `d40c1cf2` | - | NOT_AUDITED |
| 5 | `src/css/base.css` | 2825 | `d4ba4637` | - | NOT_AUDITED |
| 6 | `src/css/main.css` | 62677 | `fa3a92d7` | - | NOT_AUDITED |
| 7 | `src/css/privacy.css` | 2682 | `b78f247a` | - | NOT_AUDITED |
| 8 | `src/css/status.css` | 3246 | `23640f55` | - | NOT_AUDITED |
| 9 | `src/css/sweet-demo.css` | 30426 | `c415a652` | - | NOT_AUDITED |
| 10 | `src/css/sweet-modal.css` | 10064 | `259014fc` | - | NOT_AUDITED |
| 11 | `src/css/terms.css` | 2220 | `f0541c1f` | - | NOT_AUDITED |
| 12 | `src/css/tokens.css` | 3623 | `1d3eb963` | - | NOT_AUDITED |
| 13 | `src/css/ui/components.css` | 17163 | `8a0dc8df` | - | NOT_AUDITED |
| 14 | `src/css/ui/layout.css` | 7590 | `c7d447bd` | - | NOT_AUDITED |
| 15 | `src/css/ui/tokens.css` | 4852 | `97bb2908` | - | NOT_AUDITED |

### [js] (63 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `src/core/runtime.js` | 4688 | `7d9493cc` | - | NOT_AUDITED |
| 2 | `src/core/state.js` | 2886 | `a05e86ab` | - | NOT_AUDITED |
| 3 | `src/js/apiClient.js` | 4072 | `49c4529b` | - | NOT_AUDITED |
| 4 | `src/js/captcha.v2.js` | 3946 | `0ebc6a58` | - | NOT_AUDITED |
| 5 | `src/js/core/game-events.js` | 916 | `ffa262e7` | - | NOT_AUDITED |
| 6 | `src/js/core/game-runtime.js` | 1920 | `e99f7d43` | - | NOT_AUDITED |
| 7 | `src/js/core/game-state.js` | 2058 | `ef8e43c2` | - | NOT_AUDITED |
| 8 | `src/js/debug-boot.js` | 4285 | `bdb115ca` | - | NOT_AUDITED |
| 9 | `src/js/inline/announcements-boot.js` | 587 | `885fdf84` | - | NOT_AUDITED |
| 10 | `src/js/inline/announcements.js` | 1464 | `d87ef6ce` | - | NOT_AUDITED |
| 11 | `src/js/inline/apex-app.js` | 21945 | `5c251d12` | - | NOT_AUDITED |
| 12 | `src/js/inline/apex-boot.js` | 415 | `4696b8d2` | - | NOT_AUDITED |
| 13 | `src/js/inline/apex-loader.js` | 899 | `b2a2f0d0` | - | NOT_AUDITED |
| 14 | `src/js/inline/block-01.js` | 493 | `b3661fe2` | - | NOT_AUDITED |
| 15 | `src/js/inline/block-02.js` | 13081 | `8d948211` | - | NOT_AUDITED |
| 16 | `src/js/inline/block-03.js` | 6838 | `41f08991` | - | NOT_AUDITED |
| 17 | `src/js/inline/block-04.js` | 20722 | `8a604653` | - | NOT_AUDITED |
| 18 | `src/js/inline/block-05.js` | 417 | `78768e25` | - | NOT_AUDITED |
| 19 | `src/js/inline/block-06-apex-monitoring.js` | 1551 | `657254c8` | - | NOT_AUDITED |
| 20 | `src/js/inline/block-07-apex-auth.js` | 3156 | `2a1ca2f6` | - | NOT_AUDITED |
| 21 | `src/js/inline/block-08-apex-a11y.js` | 1823 | `0636eaed` | - | NOT_AUDITED |
| 22 | `src/js/inline/block-09.js` | 632 | `4106a41b` | - | NOT_AUDITED |
| 23 | `src/js/inline/event-bindings.js` | 5201 | `5317f0b8` | - | NOT_AUDITED |
| 24 | `src/js/inline/status-01.js` | 4315 | `29d23380` | - | NOT_AUDITED |
| 25 | `src/js/inline/sweet-demo.js` | 61168 | `defe176c` | - | NOT_AUDITED |
| 26 | `src/js/inline/sweet-modal.js` | 7776 | `f893fb51` | - | NOT_AUDITED |
| 27 | `src/js/inline/sweet-symbol-renderer.js` | 6205 | `0f99e6cf` | - | NOT_AUDITED |
| 28 | `src/js/inline/sweet-symbols.js` | 7191 | `83060d6d` | - | NOT_AUDITED |
| 29 | `src/js/inline/sweet-win-feedback.js` | 5172 | `8bb8d7de` | - | NOT_AUDITED |
| 30 | `src/js/math/bonus.js` | 3477 | `8a0e98d5` | - | NOT_AUDITED |
| 31 | `src/js/math/paytable.js` | 1371 | `d841a260` | - | NOT_AUDITED |
| 32 | `src/js/passkey.js` | 23319 | `71322f65` | - | NOT_AUDITED |
| 33 | `src/js/passwordPolicy.js` | 6604 | `06131d59` | - | NOT_AUDITED |
| 34 | `src/js/pay/deposit-client.js` | 977 | `d448f938` | - | NOT_AUDITED |
| 35 | `src/js/platform/i18n.js` | 49241 | `fb8dcbb2` | - | NOT_AUDITED |
| 36 | `src/js/platform/wallet.js` | 2464 | `f3634ea1` | - | NOT_AUDITED |
| 37 | `src/js/presentation/a11y.js` | 7539 | `599792f5` | - | NOT_AUDITED |
| 38 | `src/js/presentation/animator.js` | 6491 | `1c886f63` | - | NOT_AUDITED |
| 39 | `src/js/presentation/anticipation.js` | 1565 | `eebb6ea1` | - | NOT_AUDITED |
| 40 | `src/js/presentation/audio-bridge.js` | 7932 | `ac130815` | - | NOT_AUDITED |
| 41 | `src/js/presentation/audio-lifecycle.js` | 4530 | `926add5b` | - | NOT_AUDITED |
| 42 | `src/js/presentation/audio-synth.js` | 17983 | `5ab87feb` | - | NOT_AUDITED |
| 43 | `src/js/presentation/audio.js` | 4881 | `9203c399` | - | NOT_AUDITED |
| 44 | `src/js/presentation/autospin.js` | 5380 | `a2434482` | - | NOT_AUDITED |
| 45 | `src/js/presentation/bgm.js` | 3605 | `52403b92` | - | NOT_AUDITED |
| 46 | `src/js/presentation/error-reporter.js` | 3493 | `ce17a75f` | - | NOT_AUDITED |
| 47 | `src/js/presentation/haptics.js` | 3117 | `2bb61cf3` | - | NOT_AUDITED |
| 48 | `src/js/presentation/near-miss.js` | 2511 | `2f22ef5f` | - | NOT_AUDITED |
| 49 | `src/js/presentation/perf.js` | 3770 | `05bfdf64` | - | NOT_AUDITED |
| 50 | `src/js/presentation/reconnection.js` | 1724 | `0c72f3cd` | - | NOT_AUDITED |
| 51 | `src/js/presentation/renderer.js` | 5016 | `3bbdd67b` | - | NOT_AUDITED |
| 52 | `src/js/ui/sheet-core.js` | 2823 | `da0b1493` | - | NOT_AUDITED |
| 53 | `src/js/ui/sheet-lock.js` | 1098 | `377c32c1` | - | NOT_AUDITED |
| 54 | `src/js/ui/sweet-history.js` | 10910 | `2cd96154` | - | NOT_AUDITED |
| 55 | `src/js/ui/sweet-rules.js` | 8597 | `c26b3bea` | - | NOT_AUDITED |
| 56 | `src/js/ui/sweet-settings.js` | 7592 | `ab12a82f` | - | NOT_AUDITED |
| 57 | `src/provider/demo-adapter.js` | 6104 | `bff3807b` | - | NOT_AUDITED |
| 58 | `src/provider/local-demo.js` | 791 | `4b721e02` | - | NOT_AUDITED |
| 59 | `src/provider/provider.js` | 313 | `1f7c8a09` | - | NOT_AUDITED |
| 60 | `src/provider/server-adapter.js` | 5748 | `89520b8c` | - | NOT_AUDITED |
| 61 | `src/provider/server.js` | 1632 | `b70aa0ab` | - | NOT_AUDITED |
| 62 | `src/wallet/demo-wallet.js` | 1696 | `b02a21f8` | - | NOT_AUDITED |
| 63 | `src/wallet/wallet.js` | 556 | `1e808737` | - | NOT_AUDITED |

### [html] (9 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `404.html` | 1219 | `55cb585f` | - | NOT_AUDITED |
| 2 | `announcements.html` | 1350 | `fb9faa15` | - | NOT_AUDITED |
| 3 | `index.html` | 33382 | `1dd09763` | - | NOT_AUDITED |
| 4 | `manifest.json` | 524 | `1e76c6e5` | - | NOT_AUDITED |
| 5 | `privacy.html` | 14843 | `4164e5b1` | - | NOT_AUDITED |
| 6 | `status.html` | 3047 | `1331ed35` | - | NOT_AUDITED |
| 7 | `sugar-rush.html` | 10142 | `e80a4ef0` | - | NOT_AUDITED |
| 8 | `sweet-demo.html` | 16701 | `3b8d2a09` | - | NOT_AUDITED |
| 9 | `terms.html` | 15007 | `b15440dd` | - | NOT_AUDITED |

### [audio] (15 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `sfx/big-win.wav` | 18766 | `e0bf5a08` | Y | NOT_AUDITED |
| 2 | `sfx/bomb-explode.wav` | 4430 | `27edfbf7` | Y | NOT_AUDITED |
| 3 | `sfx/bonus.wav` | 49614 | `f5bda1aa` | Y | NOT_AUDITED |
| 4 | `sfx/epic-win.wav` | 11726 | `8299c130` | Y | NOT_AUDITED |
| 5 | `sfx/fs-enter.wav` | 11470 | `cc640d60` | Y | NOT_AUDITED |
| 6 | `sfx/mega-win.wav` | 46670 | `5d1354a5` | Y | NOT_AUDITED |
| 7 | `sfx/multiplier.wav` | 11086 | `a9cf3c92` | Y | NOT_AUDITED |
| 8 | `sfx/spin-start.wav` | 35662 | `ea35da54` | Y | NOT_AUDITED |
| 9 | `sfx/spin-stop.wav` | 4046 | `68615285` | Y | NOT_AUDITED |
| 10 | `sfx/super-win.wav` | 20174 | `fa1b3131` | Y | NOT_AUDITED |
| 11 | `sfx/tumble-land.wav` | 4942 | `141c77e6` | Y | NOT_AUDITED |
| 12 | `sfx/tumble.wav` | 2126 | `e620244c` | Y | NOT_AUDITED |
| 13 | `sfx/ui-tap.wav` | 10190 | `167d8eec` | Y | NOT_AUDITED |
| 14 | `sfx/ultra-win.wav` | 25806 | `d7cb3b5b` | Y | NOT_AUDITED |
| 15 | `sfx/win-normal.wav` | 26062 | `e1dccd0c` | Y | NOT_AUDITED |

### [font] (3 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `fonts/cinzel-latin-600.woff2` | 25904 | `e3007b72` | Y | NOT_AUDITED |
| 2 | `fonts/manrope-latin-500.woff2` | 24836 | `b4295101` | Y | NOT_AUDITED |
| 3 | `fonts/montserrat-latin-600.woff2` | 37956 | `a5ec5492` | Y | NOT_AUDITED |

### [image] (16 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `assets/games/bass.webp` | 26438 | `9fcf9d76` | Y | NOT_AUDITED |
| 2 | `assets/games/book.webp` | 25346 | `f3737dfb` | Y | NOT_AUDITED |
| 3 | `assets/games/buffalo.webp` | 14866 | `33496fd6` | Y | NOT_AUDITED |
| 4 | `assets/games/dog.webp` | 23620 | `5e2a4796` | Y | NOT_AUDITED |
| 5 | `assets/games/fruit.webp` | 23248 | `65d0d67c` | Y | NOT_AUDITED |
| 6 | `assets/games/gonzo.webp` | 22288 | `f985f209` | Y | NOT_AUDITED |
| 7 | `assets/games/megaways.webp` | 22744 | `6b2101c6` | Y | NOT_AUDITED |
| 8 | `assets/games/olympus.webp` | 30188 | `40488fd4` | Y | NOT_AUDITED |
| 9 | `assets/games/starburst.webp` | 20074 | `e294af2b` | Y | NOT_AUDITED |
| 10 | `assets/games/sugar.webp` | 19752 | `b6226a92` | Y | NOT_AUDITED |
| 11 | `assets/games/sweet.webp` | 21306 | `bfbd47c0` | Y | NOT_AUDITED |
| 12 | `assets/games/wolf.webp` | 22610 | `6c7d978c` | Y | NOT_AUDITED |
| 13 | `favicon.svg` | 253 | `e7ff76b0` | - | NOT_AUDITED |
| 14 | `login-hero.webp` | 188524 | `e117c800` | Y | NOT_AUDITED |
| 15 | `logo-192.webp` | 12672 | `c228a144` | Y | NOT_AUDITED |
| 16 | `logo.webp` | 41576 | `c1408aff` | Y | NOT_AUDITED |

### [migration] (36 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `migrations/0001_initial.sql` | 3667 | `1532cb5a` | - | NOT_AUDITED |
| 2 | `migrations/0002_email_verification.sql` | 204 | `92bb06c0` | - | NOT_AUDITED |
| 3 | `migrations/0003_security_fields.sql` | 438 | `1b270d43` | - | NOT_AUDITED |
| 4 | `migrations/0004_session_upgrade.sql` | 195 | `e8385928` | - | NOT_AUDITED |
| 5 | `migrations/0005_captcha_tokens.sql` | 532 | `c98a976b` | - | NOT_AUDITED |
| 6 | `migrations/0006_sessions_created_at.sql` | 49 | `8a1bd29f` | - | NOT_AUDITED |
| 7 | `migrations/0007_password_resets_hash.sql` | 55 | `fb1dab70` | - | NOT_AUDITED |
| 8 | `migrations/0008_password_resets_attempts.sql` | 76 | `2bd7419f` | - | NOT_AUDITED |
| 9 | `migrations/0009_password_resets_user_id.sql` | 56 | `cf197307` | - | NOT_AUDITED |
| 10 | `migrations/0010_rate_limits_index.sql` | 103 | `fea33636` | - | NOT_AUDITED |
| 11 | `migrations/0011_users_email_verified.sql` | 72 | `ecc5a09a` | - | NOT_AUDITED |
| 12 | `migrations/0012_users_email_verified_at.sql` | 53 | `b21b85c8` | - | NOT_AUDITED |
| 13 | `migrations/0013_users_password_changed_at.sql` | 55 | `f01f6fcc` | - | NOT_AUDITED |
| 14 | `migrations/0014_users_last_login_at.sql` | 49 | `0821cf65` | - | NOT_AUDITED |
| 15 | `migrations/0015_users_status.sql` | 68 | `5027d53a` | - | NOT_AUDITED |
| 16 | `migrations/0016_logs_request_id.sql` | 45 | `19a2cc1a` | - | NOT_AUDITED |
| 17 | `migrations/0017_audit_request_id.sql` | 51 | `f51ae926` | - | NOT_AUDITED |
| 18 | `migrations/0018_sessions_revoked_at_index.sql` | 179 | `3caece56` | - | NOT_AUDITED |
| 19 | `migrations/0019_email_verifications_verify.sql` | 683 | `e8cc7c1a` | - | NOT_AUDITED |
| 20 | `migrations/0021_captcha_tokens_purpose.sql` | 868 | `2a3edae1` | - | NOT_AUDITED |
| 21 | `migrations/0022_passkeys.sql` | 1638 | `e53366b4` | - | NOT_AUDITED |
| 22 | `migrations/0023_rate_limit_buckets.sql` | 1019 | `d6dec876` | - | NOT_AUDITED |
| 23 | `migrations/0024_users_wallet_balance.sql` | 854 | `4e766140` | - | NOT_AUDITED |
| 24 | `migrations/0025_spins.sql` | 1597 | `d09be70b` | - | NOT_AUDITED |
| 25 | `migrations/0026_free_spin_sessions.sql` | 1460 | `1f450670` | - | NOT_AUDITED |
| 26 | `migrations/0027_settlement_guard.sql` | 567 | `3eab0f86` | - | NOT_AUDITED |
| 27 | `migrations/0028_wallet_ledger.sql` | 1191 | `629a254b` | - | NOT_AUDITED |
| 28 | `migrations/0029_reward_chains.sql` | 1016 | `9f669cbf` | - | NOT_AUDITED |
| 29 | `migrations/0030_spins_ext.sql` | 519 | `bf8572d7` | - | NOT_AUDITED |
| 30 | `migrations/0031_free_spin_sessions_ext.sql` | 487 | `aee4de8d` | - | NOT_AUDITED |
| 31 | `migrations/0032_sessions_limit_trigger.sql` | 501 | `6ed10316` | - | NOT_AUDITED |
| 32 | `migrations/0033_users_balance_nonnegative_triggers.sql` | 905 | `68d6708d` | - | NOT_AUDITED |
| 33 | `migrations/0034_spins_max_win.sql` | 448 | `b34048e3` | - | NOT_AUDITED |
| 34 | `migrations/0035_fs_sessions_game_id.sql` | 318 | `78da7fb5` | - | NOT_AUDITED |
| 35 | `migrations/0036_fs_marks_json.sql` | 315 | `367b2c89` | - | NOT_AUDITED |
| 36 | `migrations/0037_provably_fair.sql` | 521 | `d88efff9` | - | NOT_AUDITED |

### [test] (79 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `tests/api-smoke.test.js` | 7520 | `0208da37` | - | NOT_AUDITED |
| 2 | `tests/api/buy-fs.test.cjs` | 5397 | `08eeb02f` | - | NOT_AUDITED |
| 3 | `tests/api/deposit.test.cjs` | 1771 | `7280547d` | - | NOT_AUDITED |
| 4 | `tests/api/history.test.cjs` | 3997 | `df86c425` | - | NOT_AUDITED |
| 5 | `tests/api/spin.test.cjs` | 6941 | `97e70b7f` | - | NOT_AUDITED |
| 6 | `tests/api/state.test.cjs` | 2178 | `b5cdc48b` | - | NOT_AUDITED |
| 7 | `tests/cbor.test.js` | 2782 | `7cd930a8` | - | NOT_AUDITED |
| 8 | `tests/csrf-middleware.test.js` | 3401 | `bf459e84` | - | NOT_AUDITED |
| 9 | `tests/e2e/spin-api.cjs` | 10508 | `f3e07f48` | - | NOT_AUDITED |
| 10 | `tests/e2e/spin-sql.cjs` | 7051 | `faaf415a` | - | NOT_AUDITED |
| 11 | `tests/fault/concurrency-fault.cjs` | 11072 | `901be90f` | - | NOT_AUDITED |
| 12 | `tests/fault/config-fault.cjs` | 5557 | `84a27e3c` | - | NOT_AUDITED |
| 13 | `tests/fault/d1-fault.cjs` | 7599 | `9daa805e` | - | NOT_AUDITED |
| 14 | `tests/fault/rate-limit-fault.cjs` | 4609 | `6eea7df9` | - | NOT_AUDITED |
| 15 | `tests/fault/run-all.sh` | 656 | `7e5e8e00` | - | NOT_AUDITED |
| 16 | `tests/games/sugar-rush/01-errors-grid.cjs` | 1191 | `81514e14` | - | NOT_AUDITED |
| 17 | `tests/games/sugar-rush/02-rng-evaluator.cjs` | 2614 | `acda5ca1` | - | NOT_AUDITED |
| 18 | `tests/games/sugar-rush/03-payout-bonus.cjs` | 3189 | `2cad38b2` | - | NOT_AUDITED |
| 19 | `tests/games/sugar-rush/04-tumble-engine.cjs` | 3855 | `3b9d5163` | - | NOT_AUDITED |
| 20 | `tests/games/sugar-rush/05-multiplier-marks.cjs` | 3856 | `52b72370` | - | NOT_AUDITED |
| 21 | `tests/games/sugar-rush/06-spin-base-free.cjs` | 4834 | `6f02ab8f` | - | NOT_AUDITED |
| 22 | `tests/games/sugar-rush/07-grid-boundaries.cjs` | 1891 | `beb3ef95` | - | NOT_AUDITED |
| 23 | `tests/games/sugar-rush/08-payout-precision.cjs` | 2126 | `1f5302fd` | - | NOT_AUDITED |
| 24 | `tests/games/sugar-rush/09-max-win-cap.cjs` | 2365 | `b9122e4a` | - | NOT_AUDITED |
| 25 | `tests/games/sugar-rush/10-free-spin-rules.cjs` | 3127 | `c62efcd5` | - | NOT_AUDITED |
| 26 | `tests/games/sugar-rush/11-deterministic-replay.cjs` | 4542 | `cc158622` | - | NOT_AUDITED |
| 27 | `tests/games/sugar-rush/12-client-server-parity.cjs` | 4028 | `99e46844` | - | NOT_AUDITED |
| 28 | `tests/games/sugar-rush/13-long-run-stability.cjs` | 3070 | `613a83e9` | - | NOT_AUDITED |
| 29 | `tests/games/sugar-rush/14-performance-benchmark.cjs` | 3405 | `67a04d5b` | - | NOT_AUDITED |
| 30 | `tests/games/sugar-rush/15-base-marks.cjs` | 1077 | `e7cffb40` | - | NOT_AUDITED |
| 31 | `tests/games/sugar-rush/16-round-cap.cjs` | 1543 | `c4cd7583` | - | NOT_AUDITED |
| 32 | `tests/games/sugar-rush/_loader.cjs` | 1743 | `7764cc80` | - | NOT_AUDITED |
| 33 | `tests/games/sugar-rush/rtp-gate.cjs` | 1116 | `f37cc227` | - | NOT_AUDITED |
| 34 | `tests/games/sugar-rush/run-all.cjs` | 1111 | `a0c41de8` | - | NOT_AUDITED |
| 35 | `tests/games/sugar-rush/symbols-audit.cjs` | 1510 | `f65d73a1` | - | NOT_AUDITED |
| 36 | `tests/games/sweet-demo/routing.cjs` | 2335 | `0f6d1c0e` | - | NOT_AUDITED |
| 37 | `tests/json-shape.test.js` | 2556 | `9f14da98` | - | NOT_AUDITED |
| 38 | `tests/math/compare-prod-ref.cjs` | 3240 | `350f7f37` | - | NOT_AUDITED |
| 39 | `tests/math/redline-gate.cjs` | 6643 | `cb433e6a` | - | NOT_AUDITED |
| 40 | `tests/math/rtp-baseline.json` | 2388 | `df53e0cf` | - | NOT_AUDITED |
| 41 | `tests/math/rtp-gate.cjs` | 4309 | `9fb7119c` | - | NOT_AUDITED |
| 42 | `tests/math/seeded-rng.cjs` | 2388 | `5c5f7460` | - | NOT_AUDITED |
| 43 | `tests/math/simulator-v2.cjs` | 5995 | `8e63753a` | - | NOT_AUDITED |
| 44 | `tests/monitoring/error-reporter.cjs` | 5517 | `c5fbc271` | - | NOT_AUDITED |
| 45 | `tests/monitoring/metrics-window.cjs` | 5702 | `54125ef8` | - | NOT_AUDITED |
| 46 | `tests/monitoring/metrics.cjs` | 11138 | `12cafc3a` | - | NOT_AUDITED |
| 47 | `tests/monitoring/near-miss.cjs` | 4525 | `4033dd92` | - | NOT_AUDITED |
| 48 | `tests/monitoring/probes.cjs` | 6900 | `995908a9` | - | NOT_AUDITED |
| 49 | `tests/monitoring/reconnection.cjs` | 3806 | `cb48266e` | - | NOT_AUDITED |
| 50 | `tests/monitoring/wallet-stub.cjs` | 2439 | `2870f86c` | - | NOT_AUDITED |
| 51 | `tests/password-length.test.js` | 1186 | `fcdf7d14` | - | NOT_AUDITED |
| 52 | `tests/password-policy.test.js` | 3336 | `4651cbad` | - | NOT_AUDITED |
| 53 | `tests/response-headers.test.js` | 2114 | `f48dd172` | - | NOT_AUDITED |
| 54 | `tests/rollout/rollout.cjs` | 7898 | `30d4d1eb` | - | NOT_AUDITED |
| 55 | `tests/security-scan.js` | 7726 | `89e88e53` | - | NOT_AUDITED |
| 56 | `tests/settlement/a2-runtime-isolation.cjs` | 4315 | `72f11093` | - | NOT_AUDITED |
| 57 | `tests/settlement/a4-idempotency.cjs` | 9214 | `8ee24545` | - | NOT_AUDITED |
| 58 | `tests/settlement/a5-fs-concurrency.cjs` | 10727 | `a1d71d49` | - | NOT_AUDITED |
| 59 | `tests/settlement/a6-reward-chain.cjs` | 10180 | `93f3af4d` | - | NOT_AUDITED |
| 60 | `tests/settlement/a6b-cap-guard.cjs` | 5442 | `0faf9c7c` | - | NOT_AUDITED |
| 61 | `tests/settlement/a7-ledger-recon.cjs` | 10281 | `ad853e32` | - | NOT_AUDITED |
| 62 | `tests/settlement/a8-backup-restore.cjs` | 8443 | `04eeb07a` | - | NOT_AUDITED |
| 63 | `tests/settlement/a9-session-limit.cjs` | 5557 | `18d85714` | - | NOT_AUDITED |
| 64 | `tests/settlement/bootstrap.cjs` | 1826 | `67a010bb` | - | NOT_AUDITED |
| 65 | `tests/settlement/guard-10.cjs` | 11272 | `315804ad` | - | NOT_AUDITED |
| 66 | `tests/webauthn.test.js` | 7372 | `d62f80a4` | - | NOT_AUDITED |
| 67 | `tools/_eval-scale.cjs` | 1602 | `91f978b3` | - | NOT_AUDITED |
| 68 | `tools/calibrate-scale.cjs` | 2258 | `d35a9bb3` | - | NOT_AUDITED |
| 69 | `tools/cap-enforcement-gate.cjs` | 2528 | `70f7be3b` | - | NOT_AUDITED |
| 70 | `tools/reference-sim/sim.cjs` | 14680 | `f6ac9b92` | - | NOT_AUDITED |
| 71 | `tools/rtp-gate-v3.cjs` | 3896 | `2eb57ac0` | - | NOT_AUDITED |
| 72 | `tools/sugar-rush/base.cjs` | 3681 | `541dba7b` | - | NOT_AUDITED |
| 73 | `tools/sugar-rush/profiles.cjs` | 1966 | `13fd28cc` | - | NOT_AUDITED |
| 74 | `tools/sugar-rush/sim-base.cjs` | 1724 | `e6e51f06` | - | NOT_AUDITED |
| 75 | `tools/sugar-rush/sim-fs.cjs` | 4442 | `e24aa7aa` | - | NOT_AUDITED |
| 76 | `tools/sugar-rush/sim-v3.cjs` | 6222 | `b141f5f1` | - | NOT_AUDITED |
| 77 | `tools/sugar-rush/spec.cjs` | 2705 | `53cdb702` | - | NOT_AUDITED |
| 78 | `tools/sugar-rush/tumble.cjs` | 1547 | `f91176b3` | - | NOT_AUDITED |
| 79 | `tools/sweet-sim.cjs` | 4666 | `015bc9da` | - | NOT_AUDITED |

### [script] (26 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `scripts/_migrate_helpers.sh` | 4045 | `b452a14e` | - | NOT_AUDITED |
| 2 | `scripts/_sql_apply.cjs` | 1450 | `a5c6515c` | - | NOT_AUDITED |
| 3 | `scripts/backup-remote.sh` | 8467 | `934264c4` | - | NOT_AUDITED |
| 4 | `scripts/backup.sh` | 2929 | `9dbc51f7` | - | NOT_AUDITED |
| 5 | `scripts/build-dist.sh` | 3727 | `39170910` | - | NOT_AUDITED |
| 6 | `scripts/check-cache-refs.sh` | 878 | `09fbcf59` | - | NOT_AUDITED |
| 7 | `scripts/check-client-server-separation.sh` | 2136 | `85b78dc6` | - | NOT_AUDITED |
| 8 | `scripts/check-config-sync.sh` | 3316 | `09fe60fd` | - | NOT_AUDITED |
| 9 | `scripts/check-engine-sync.sh` | 2627 | `7dc17107` | - | NOT_AUDITED |
| 10 | `scripts/check-no-math-leak.cjs` | 5506 | `01a1c4e4` | - | NOT_AUDITED |
| 11 | `scripts/check-no-secret-leak.cjs` | 2522 | `1c24dd9b` | - | NOT_AUDITED |
| 12 | `scripts/check-tab-order.cjs` | 1896 | `30227776` | - | NOT_AUDITED |
| 13 | `scripts/cleanup.sh` | 837 | `46e2306d` | - | NOT_AUDITED |
| 14 | `scripts/final-gate.cjs` | 2584 | `5b71fa36` | - | NOT_AUDITED |
| 15 | `scripts/hash-assets.mjs` | 1562 | `507d3642` | - | NOT_AUDITED |
| 16 | `scripts/lint-sweet-rules.cjs` | 1549 | `92b021fb` | - | NOT_AUDITED |
| 17 | `scripts/migrate.sh` | 3925 | `0b61e521` | - | NOT_AUDITED |
| 18 | `scripts/migrate_status.sh` | 555 | `e5fa0826` | - | NOT_AUDITED |
| 19 | `scripts/perf-probe.js` | 1807 | `bd408526` | - | NOT_AUDITED |
| 20 | `scripts/restore-from-remote.sh` | 10780 | `a2f2206c` | - | NOT_AUDITED |
| 21 | `scripts/restore.sh` | 2886 | `90ebfca1` | - | NOT_AUDITED |
| 22 | `scripts/rewrite-refs.cjs` | 4000 | `bf679be2` | - | NOT_AUDITED |
| 23 | `scripts/run-smoke.sh` | 1907 | `86e12f9a` | - | NOT_AUDITED |
| 24 | `scripts/sync-engine.sh` | 1430 | `fcdfbb76` | - | NOT_AUDITED |
| 25 | `scripts/syntax-check.sh` | 602 | `8df68f79` | - | NOT_AUDITED |
| 26 | `scripts/verify-backup.sh` | 1008 | `b4aaf9b6` | - | NOT_AUDITED |

### [ci] (8 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `.github/codeql/codeql-config.yml` | 589 | `c1558010` | - | NOT_AUDITED |
| 2 | `.github/dependabot.yml` | 1479 | `348ed880` | - | NOT_AUDITED |
| 3 | `.github/workflows/ci.yml` | 8190 | `44d4c37d` | - | NOT_AUDITED |
| 4 | `.github/workflows/codeql-advanced.yml` | 4938 | `300c9d75` | - | NOT_AUDITED |
| 5 | `.github/workflows/d1-integration.yml` | 10238 | `af9225b6` | - | NOT_AUDITED |
| 6 | `.github/workflows/daily-backup.yml` | 4584 | `232b5e51` | - | NOT_AUDITED |
| 7 | `.github/workflows/deploy.yml` | 5155 | `ab5b4262` | - | NOT_AUDITED |
| 8 | `.github/workflows/nightly-rtp.yml` | 2921 | `5206527f` | - | NOT_AUDITED |

### [doc] (32 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `README.md` | 325 | `afeebb81` | - | NOT_AUDITED |
| 2 | `docs/C-phase-report.md` | 5017 | `f4892cf4` | - | NOT_AUDITED |
| 3 | `docs/HANDOFF.md` | 2961 | `87b40972` | - | NOT_AUDITED |
| 4 | `docs/P1f-d1-concurrency.md` | 2100 | `a5efb820` | - | NOT_AUDITED |
| 5 | `docs/P2b-csp-style-src-attr.md` | 2225 | `a0d944bc` | - | NOT_AUDITED |
| 6 | `docs/P2c-sw-pwa-strategy.md` | 2588 | `7f4165f0` | - | NOT_AUDITED |
| 7 | `docs/P2d-sr-frontend-wiring.md` | 1804 | `8c839237` | - | NOT_AUDITED |
| 8 | `docs/P2e-i18n-coverage.md` | 2757 | `1cca74f4` | - | NOT_AUDITED |
| 9 | `docs/P2f-misc-items.md` | 2326 | `713e7b84` | - | NOT_AUDITED |
| 10 | `docs/P3e-1-audio-fix.md` | 2250 | `f8e2f471` | - | NOT_AUDITED |
| 11 | `docs/csp-header-parse-fix.md` | 1763 | `5f13e8e2` | - | NOT_AUDITED |
| 12 | `docs/engine-duplication.md` | 2052 | `3482da68` | - | NOT_AUDITED |
| 13 | `docs/legacy/sugar-rush-legacy.html` | 8678 | `2d04194f` | - | NOT_AUDITED |
| 14 | `docs/legacy/sugar-rush/css/game.css` | 22882 | `5675c198` | - | NOT_AUDITED |
| 15 | `docs/legacy/sugar-rush/js/audio.js` | 1311 | `400f0dd4` | - | NOT_AUDITED |
| 16 | `docs/legacy/sugar-rush/js/main.js` | 36652 | `cb63048b` | - | NOT_AUDITED |
| 17 | `docs/legacy/sugar-rush/js/symbols-v2.js` | 16254 | `4b17de41` | - | NOT_AUDITED |
| 18 | `docs/legacy/sugar-rush/sfx/CREDITS.txt` | 692 | `b3498343` | - | NOT_AUDITED |
| 19 | `docs/legacy/sugar-rush/sfx/fs-enter.wav` | 18338 | `7ed14518` | Y | NOT_AUDITED |
| 20 | `docs/legacy/sugar-rush/sfx/multiplier.wav` | 29096 | `2d9957d5` | Y | NOT_AUDITED |
| 21 | `docs/legacy/sugar-rush/sfx/scatter.ogg` | 12111 | `0b4b11b4` | Y | NOT_AUDITED |
| 22 | `docs/legacy/sugar-rush/sfx/spin-start.wav` | 206864 | `9dfeddbf` | Y | NOT_AUDITED |
| 23 | `docs/legacy/sugar-rush/sfx/tumble-land.ogg` | 5859 | `ca174bba` | Y | NOT_AUDITED |
| 24 | `docs/legacy/sugar-rush/sfx/ui-tap.ogg` | 4876 | `3fd39a5b` | Y | NOT_AUDITED |
| 25 | `docs/legacy/sugar-rush/sfx/win-big.ogg` | 8968 | `778f174a` | Y | NOT_AUDITED |
| 26 | `docs/legacy/sugar-rush/sfx/win-normal.wav` | 29396 | `030a363c` | Y | NOT_AUDITED |
| 27 | `docs/legacy/sugar-rush/tests/anticipation.cjs` | 2091 | `1c504ca7` | - | NOT_AUDITED |
| 28 | `docs/legacy/sugar-rush/tests/audio-routing.cjs` | 1988 | `69b4731e` | - | NOT_AUDITED |
| 29 | `docs/legacy/sugar-rush/tests/rules-depth.cjs` | 1813 | `0aba9063` | - | NOT_AUDITED |
| 30 | `docs/math/B-3-report.md` | 7943 | `cbaa9c09` | - | NOT_AUDITED |
| 31 | `docs/math/theory.md` | 12331 | `367dcbf9` | - | NOT_AUDITED |
| 32 | `docs/settlement/settlement-transaction-design.md` | 23500 | `542f51be` | - | NOT_AUDITED |

### [other] (10 files)

| # | path | size | sha8 | bin | state |
|---|---|---|---|---|---|
| 1 | `.assetsignore` | 849 | `5943727d` | - | NOT_AUDITED |
| 2 | `.cfignore` | 842 | `62f50436` | - | NOT_AUDITED |
| 3 | `.env.example` | 1501 | `098b90f6` | - | NOT_AUDITED |
| 4 | `.gitignore` | 1810 | `d417f846` | - | NOT_AUDITED |
| 5 | `_headers` | 3818 | `72ed4eda` | - | NOT_AUDITED |
| 6 | `_redirects` | 2063 | `6f7ca501` | - | NOT_AUDITED |
| 7 | `fonts/fonts.css` | 1856 | `6698a4bd` | - | NOT_AUDITED |
| 8 | `robots.txt` | 280 | `49139217` | - | NOT_AUDITED |
| 9 | `sitemap.xml` | 759 | `c5bc39c8` | - | NOT_AUDITED |
| 10 | `sw.js` | 1302 | `7374f2f5` | - | NOT_AUDITED |

## Current cursor

File: (pending - first audit not yet started)
Status: NA

