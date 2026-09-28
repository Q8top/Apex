const handlers = [
  'functions/api/health.js',
  'functions/api/ready.js',
  'functions/api/me.js',
  'functions/api/login.js',
  'functions/api/logout.js',
  'functions/api/register.js',
  'functions/api/sessions.js',
  'functions/api/status.js',
  'functions/api/admin/login.js',
  'functions/api/admin/logout.js',
  'functions/api/admin/me.js',
  'functions/api/captcha/challenge.js',
  'functions/api/captcha/verify.js',
  'functions/api/send-reset-code.js',
  'functions/api/send-verify-email.js',
  'functions/api/reset-password.js',
  'functions/api/delete-account.js',
  'functions/api/i18n.js',
  'functions/api/log.js',
  'functions/api/verify-email.js',
  'functions/api/passkey/login-challenge.js',
  'functions/api/passkey/login-verify.js',
  'functions/api/passkey/register-challenge.js',
  'functions/api/passkey/register-verify.js',
  'functions/api/passkey/signup-challenge.js',
  'functions/api/passkey/signup-verify.js',
  'functions/api/passkey/delete.js',
  'functions/api/passkey/list.js',
  'functions/api/passkey/recover-challenge.js',
  'functions/api/passkey/recover-verify.js',
];
let ok = 0, fail = 0;
for (const p of handlers) {
  try {
    const mod = await import('./' + p);
    const methods = Object.keys(mod).filter(k => k.startsWith('onRequest'));
    console.log('OK   ' + p + '   [' + methods.join(', ') + ']');
    ok++;
  } catch (e) {
    console.log('FAIL ' + p + '   ' + (e && e.message ? e.message : e));
    fail++;
  }
}
console.log('');
console.log('SUMMARY ok=' + ok + ' fail=' + fail);
