
// ApexTop - Auth Page Interaction
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有区块
  var tabLogin = document.getElementById('tab-login');
  var tabRegister = document.getElementById('tab-register');
  
  var loginPicker = document.getElementById('login-method-picker');
  var loginPasswordForm = document.getElementById('login-password-form');
  var passkeyLoginForm = document.getElementById('passkey-login-form');
  
  var registerPicker = document.getElementById('register-method-picker');
  var registerPasswordForm = document.getElementById('register-password-form');

  // Tab 切换逻辑
  if(tabLogin && tabRegister) {
    tabLogin.addEventListener('click', function() {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      
      if(loginPicker) loginPicker.style.display = 'block';
      if(loginPasswordForm) loginPasswordForm.style.display = 'none';
      if(passkeyLoginForm) passkeyLoginForm.style.display = 'none';
      
      if(registerPicker) registerPicker.style.display = 'none';
      if(registerPasswordForm) registerPasswordForm.style.display = 'none';
    });

    tabRegister.addEventListener('click', function() {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      
      if(loginPicker) loginPicker.style.display = 'none';
      if(loginPasswordForm) loginPasswordForm.style.display = 'none';
      if(passkeyLoginForm) passkeyLoginForm.style.display = 'none';
      
      if(registerPicker) registerPicker.style.display = 'block';
      if(registerPasswordForm) registerPasswordForm.style.display = 'none';
    });
  }

  // 登录方式点击
  var pickLoginPassword = document.getElementById('pick-login-password');
  var pickLoginPasskey = document.getElementById('pick-login-passkey');
  
  if(pickLoginPassword) {
    pickLoginPassword.addEventListener('click', function() {
      loginPicker.style.display = 'none';
      loginPasswordForm.style.display = 'block';
    });
  }
  
  if(pickLoginPasskey) {
    pickLoginPasskey.addEventListener('click', function() {
      loginPicker.style.display = 'none';
      passkeyLoginForm.style.display = 'block';
    });
  }

  // 注册方式点击
  var pickRegisterPassword = document.getElementById('pick-register-password');
  if(pickRegisterPassword) {
    pickRegisterPassword.addEventListener('click', function() {
      registerPicker.style.display = 'none';
      registerPasswordForm.style.display = 'block';
    });
  }

  // 所有返回按钮逻辑
  var backBtns = document.querySelectorAll('.form-back-btn');
  backBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // 根据当前 Tab 决定返回到哪里
      if(tabLogin.classList.contains('active')) {
        loginPicker.style.display = 'block';
        loginPasswordForm.style.display = 'none';
        passkeyLoginForm.style.display = 'none';
      } else {
        registerPicker.style.display = 'block';
        registerPasswordForm.style.display = 'none';
      }
    });
  });
});
