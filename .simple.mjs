import fs from 'node:fs';

let h = fs.readFileSync('index.html', 'utf8');
const start = h.indexOf('<div id="apex-homepage"');
const end = h.indexOf('<div id="security-modal"');
if (start < 0 || end < 0) { console.error('锚点失败'); process.exit(1); }

const newHome = `<div id="apex-homepage" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:#ffffff; z-index:100;">
  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:#111111; font-family:'Manrope','Inter',system-ui,-apple-system,sans-serif; font-size:20px; font-weight:600; letter-spacing:3px;">正在开发中</div>
</div>

`;
h = h.slice(0, start) + newHome + h.slice(end);
fs.writeFileSync('index.html', h);
console.log('  ✅ 主页已改成白底 + "正在开发中"');
