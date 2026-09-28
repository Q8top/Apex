import fs from 'node:fs';
const f = 'src/js/inline/block-10-apex-homepage-logic.js';
let c = fs.readFileSync(f, 'utf8');

if (c.includes('APEX-R25-RETRY')) {
  console.log('SKIP: 已存在');
  process.exit(0);
}

// 精准匹配实际的 3 行
const re = /(list\.appendChild\(empty\);)/;
if (!re.test(c)) { console.log('❌ 未匹配'); process.exit(1); }

const inject = `$1
          // APEX-R25-RETRY
          const retryBtn = document.createElement('button');
          retryBtn.type = 'button';
          retryBtn.textContent = '重试';
          retryBtn.style.cssText = 'display:block;margin:8px auto 0;padding:8px 20px;background:rgba(212,175,55,0.08);color:#d4af37;border:1px solid rgba(212,175,55,0.3);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;min-height:36px;';
          retryBtn.onclick = function() {
            const secLink = document.getElementById('security-center-link');
            if (secLink) secLink.click();
          };
          list.appendChild(retryBtn);`;

c = c.replace(re, inject);
fs.writeFileSync(f, c);
console.log('✅ 重试按钮已加');
