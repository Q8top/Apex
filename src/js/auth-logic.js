// 多语言字典
const i18n = {
  zh: { welcome: "欢迎回来", login_desc: "登录以继续访问 ApexTop", acc: "账号 / 邮箱", pwd: "密码", no_acc: "没有账号？注册", forgot: "忘记密码？", btn_login: "登录", or: "或", passkey: "Passkey 登录", create_acc: "创建账号", reg_desc: "加入全球数字智能平台", pwd2: "确认密码", has_acc: "已有账号？去登录", btn_reg: "注册", reset_pwd: "重置密码", reset_desc: "我们将向您的邮箱发送链接", back_login: "返回登录", btn_send: "发送重置链接", err_empty: "此项不能为空", err_pwd: "密码不能少于6位", err_mismatch: "两次密码不一致", terms: "用户协议", privacy: "隐私政策", help: "帮助中心", t_terms: "用户协议", b_terms: "<h3>1. 服务条款</h3><p>欢迎使用 ApexTop...</p>", t_privacy: "隐私政策", b_privacy: "<h3>数据收集</h3><p>我们收集您的邮箱...</p>", t_help: "帮助中心", b_help: "<h3>无法登录？</h3><p>请检查账号密码...</p>" },
  en: { welcome: "Welcome Back", login_desc: "Sign in to continue", acc: "Account", pwd: "Password", no_acc: "No account? Sign up", forgot: "Forgot?", btn_login: "Sign In", or: "OR", passkey: "Passkey", create_acc: "Create Account", reg_desc: "Join the platform", pwd2: "Confirm Password", has_acc: "Have account? Sign in", btn_reg: "Sign Up", reset_pwd: "Reset Password", reset_desc: "Send link to email", back_login: "Back", btn_send: "Send Link", err_empty: "Required", err_pwd: "Min 6 chars", err_mismatch: "Mismatch", terms: "Terms", privacy: "Privacy", help: "Help", t_terms: "Terms", b_terms: "<h3>1. Terms</h3><p>Welcome...</p>", t_privacy: "Privacy", b_privacy: "<h3>Data</h3><p>Email...</p>", t_help: "Help", b_help: "<h3>Login?</h3><p>Check...</p>" },
  ja: { welcome: "おかえりなさい", login_desc: "ログイン", acc: "アカウント", pwd: "パスワード", no_acc: "新規登録", forgot: "お忘れですか？", btn_login: "ログイン", or: "または", passkey: "Passkey", create_acc: "作成", reg_desc: "参加する", pwd2: "確認", has_acc: "ログイン", btn_reg: "登録", reset_pwd: "再設定", reset_desc: "メール送信", back_login: "戻る", btn_send: "送信", err_empty: "必須", err_pwd: "6文字以上", err_mismatch: "不一致", terms: "規約", privacy: "プライバシー", help: "ヘルプ", t_terms: "規約", b_terms: "<h3>1. 規約</h3><p>ようこそ...</p>", t_privacy: "プライバシー", b_privacy: "<h3>データ</h3><p>メール...</p>", t_help: "ヘルプ", b_help: "<h3>ログイン</h3><p>確認...</p>" }
};

let currentLang = 'zh';
const $ = id => document.getElementById(id);

// 语言切换
$('langBtn').onclick = (e) => { e.stopPropagation(); $('langMenu').classList.toggle('show'); };
document.addEventListener('click', () => $('langMenu').classList.remove('show'));
document.querySelectorAll('.lang-item').forEach(item => {
  item.onclick = () => {
    const lang = item.getAttribute('data-lang');
    currentLang = lang;
    const dict = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = dict[el.getAttribute('data-i18n')]);
    document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = dict[el.getAttribute('data-i18n-ph')]);
    const meta = { zh: { f: '🇨🇳', t: '简体中文' }, en: { f: '🇺🇸', t: 'English' }, ja: { f: '🇯🇵', t: '日本語' } };
    $('curFlag').textContent = meta[lang].f; $('curText').textContent = meta[lang].t;
    $('langMenu').classList.remove('show');
  }
});

// 路由控制
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(viewId).classList.add('active');
  document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error'));
}
$('go-register').onclick = () => switchView('view-register');
$('go-login-from-reg').onclick = () => switchView('view-login');
$('go-forgot').onclick = () => switchView('view-forgot');
$('go-login-from-forgot').onclick = () => switchView('view-login');

// 表单验证与提交
function showError(id) { $(id).classList.add('error'); }
$('btn-submit-login').onclick = async function() {
  let valid = true;
  if (!$('login-acc').value.trim()) { showError('login-acc-group'); valid = false; }
  if ($('login-pwd').value.length < 6) { showError('login-pwd-group'); valid = false; }
  if (!valid) return;
  
  this.disabled = true; 
  this.querySelector('.btn-text').textContent = '...';
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: $('login-acc').value, password: $('login-pwd').value })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      window.location.href = '/old-home.html'; // 登录成功跳转到旧首页
    } else {
      alert(data.error || '登录失败，请检查账号密码');
    }
  } catch (e) {
    alert('网络请求失败');
  } finally {
    this.disabled = false; 
    this.querySelector('.btn-text').textContent = i18n[currentLang].btn_login;
  }
};

$('btn-submit-reg').onclick = async function() {
  let valid = true;
  if (!$('reg-acc').value.trim()) { showError('reg-acc-group'); valid = false; }
  if ($('reg-pwd').value.length < 6) { showError('reg-pwd-group'); valid = false; }
  if ($('reg-pwd').value !== $('reg-pwd2').value) { showError('reg-pwd2-group'); valid = false; }
  if (!valid) return;

  this.disabled = true; 
  this.querySelector('.btn-text').textContent = '...';

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: $('reg-acc').value, password: $('reg-pwd').value })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      alert('注册成功，请登录');
      switchView('view-login');
    } else {
      alert(data.error || '注册失败');
    }
  } catch (e) {
    alert('网络错误');
  } finally {
    this.disabled = false; 
    this.querySelector('.btn-text').textContent = i18n[currentLang].btn_reg;
  }
};

// 倒计时
let timer = null;
$('btn-submit-forgot').onclick = function() {
  if (this.disabled) return;
  if (!$('forgot-acc').value.trim()) { showError('forgot-acc-group'); return; }
  let count = 60, btnText = this.querySelector('.btn-text'), orig = i18n[currentLang].btn_send;
  this.disabled = true; btnText.textContent = count + 's';
  timer = setInterval(() => {
    count--; btnText.textContent = count + 's';
    if (count <= 0) { clearInterval(timer); btnText.textContent = orig; this.disabled = false; }
  }, 1000);
};

// 底部抽屉
document.querySelectorAll('.open-drawer').forEach(btn => {
  btn.onclick = () => {
    const target = btn.getAttribute('data-target');
    const dict = i18n[currentLang];
    $('drawerTitle').textContent = dict['t_' + target];
    $('drawerBody').innerHTML = dict['b_' + target];
    $('drawerOverlay').classList.add('show'); $('drawer').classList.add('show');
  }
});
function closeDrawer() { $('drawerOverlay').classList.remove('show'); $('drawer').classList.remove('show'); }
$('drawerClose').onclick = closeDrawer; $('drawerOverlay').onclick = closeDrawer;
