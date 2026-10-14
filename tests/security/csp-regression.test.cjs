'use strict';
/* 2.B.4 B4-5: CSP directive regression gate. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const h = fs.readFileSync(ROOT + '/_headers', 'utf8');

// extract CSP line
let csp = '';
for (const ln of h.split('\n')) {
  const trimmed = ln.replace(/^\s+/, '');
  if (trimmed.indexOf('Content-Security-Policy:') === 0) {
    csp = trimmed.slice('Content-Security-Policy:'.length).trim();
    break;
  }
}

// strict: no /* */ or // comments inside CSP value
// Match real block comments (/* ... */) or line comments (\ /* // …). The old pattern flagged 'https://*' as a comment, false positive.
const hasComment = /\/\*[\s\S]*?\*\/|\s\/\/\s/.test(csp);

const REQUIRED = [
  'default-src','script-src','script-src-attr',
  'style-src','style-src-attr','img-src','font-src',
  'connect-src','media-src','object-src','frame-src',
  'frame-ancestors','base-uri','form-action','manifest-src',
  'worker-src','report-uri'
];

let pass = 0, fail = 0;
function t(n, c){ if (c){ console.log('  ok   ' + n); pass++; } else { console.log('  FAIL ' + n); fail++; } }

console.log('=== CSP regression gate ===');
t('CSP present', csp.length > 0);
t('no comment in CSP value', !hasComment);

for (const d of REQUIRED) {
  const re = new RegExp('(^|;\\s*)' + d + '\\s');
  t('has ' + d, re.test(csp));
}

t('upgrade-insecure-requests present', /upgrade-insecure-requests/.test(csp));
t('object-src none', /object-src 'none'/.test(csp));
t('frame-ancestors none', /frame-ancestors 'none'/.test(csp));
t('script-src-attr none', /script-src-attr 'none'/.test(csp));

console.log('');
console.log('[csp-gate] passed=' + pass + ' failed=' + fail);
process.exit(fail === 0 ? 0 : 1);
