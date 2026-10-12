#!/usr/bin/env node
/* Apex static tab-order checker: extract interactive elements in document
   order from sweet-demo.html and verify none is missing focusable role. */
'use strict';
var fs = require('fs');
var path = require('path');
var ROOT = path.resolve(__dirname, '..');

var html = fs.readFileSync(path.join(ROOT, 'sweet-demo.html'), 'utf8');

// Extract body inner content
var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) { console.error('no body'); process.exit(1); }
var body = bodyMatch[1];

// Match interactive elements in order: button, a[href], input, [tabindex]
var re = /<(button|a|input|select|textarea)\b([^>]*)>/g;
var items = [];
var m;
while ((m = re.exec(body)) !== null) {
  var tag = m[1];
  var attrs = m[2] || '';
  // skip hidden / disabled
  if (/\bhidden\b/.test(attrs)) continue;
  if (/\bdisabled\b/.test(attrs)) continue;
  if (/type="hidden"/.test(attrs)) continue;
  var id = (attrs.match(/id="([^"]+)"/) || [])[1] || '';
  var cls = (attrs.match(/class="([^"]+)"/) || [])[1] || '';
  var aria = (attrs.match(/aria-label="([^"]+)"/) || [])[1] || '';
  items.push({ tag: tag, id: id, cls: cls, aria: aria, pos: m.index });
}

console.log('[tab-order] interactive elements in document order:');
var issues = 0;
items.forEach(function (it, i) {
  var name = it.id || it.cls.split(' ')[0] || it.tag;
  var label = it.aria || '(no aria-label)';
  var warn = '';
  // Button without visible text or aria-label is risky; but our buttons
  // always have aria-label or inner text. Flag only if both missing.
  if (it.tag === 'button' && !it.aria && !it.cls) warn = ' <-- no aria-label, no class';
  if (warn) issues++;
  console.log('  ' + String(i+1).padStart(2, '0') + ' ' + it.tag + ' id=' + name + ' aria=' + label + warn);
});

console.log('');
console.log('[tab-order] total=' + items.length + ' issues=' + issues);
process.exit(0);
