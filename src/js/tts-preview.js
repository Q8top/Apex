(function(){
  if (!('speechSynthesis' in window)) {
    document.getElementById('grid').innerHTML =
      '<div style="color:#e5484d;padding:20px;text-align:center;">当前浏览器不支持语音合成</div>';
    return;
  }

  var voices = [];
  function loadVoices() { voices = window.speechSynthesis.getVoices() || []; }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  var CONFIGS = [
    { label: '低沉男声 · 慢速',  pitch: 0.4, rate: 0.75, vol: 1 },
    { label: '低沉男声 · 正常',  pitch: 0.4, rate: 0.95, vol: 1 },
    { label: '中性男声 · 中速',  pitch: 0.7, rate: 0.9,  vol: 1 },
    { label: '中性男声 · 快速',  pitch: 0.7, rate: 1.1,  vol: 1 },
    { label: '高亢男声 · 慢速',  pitch: 1.0, rate: 0.8,  vol: 1 },
    { label: '高亢男声 · 正常',  pitch: 1.0, rate: 1.0,  vol: 1 },
    { label: '女声 · 慢速',      pitch: 1.3, rate: 0.8,  vol: 1 },
    { label: '女声 · 正常',      pitch: 1.3, rate: 1.0,  vol: 1 },
    { label: '男声 + 拖尾',      pitch: 0.5, rate: 0.6,  vol: 1 },
    { label: '女声 · 高亢拖尾',  pitch: 1.5, rate: 0.7,  vol: 1 }
  ];

  var grid = document.getElementById('grid');

  CONFIGS.forEach(function(cfg){
    var btn = document.createElement('button');
    btn.className = 'btn';
    btn.innerHTML = '<span class="btn-label">' + cfg.label + '</span>' +
                    '<span class="btn-desc">音调 ' + cfg.pitch + ' · 语速 ' + cfg.rate + '</span>';
    btn.addEventListener('click', function(){ speak(cfg, btn); });
    grid.appendChild(btn);
  });

  function speak(cfg, btn) {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.btn.playing').forEach(function(b){ b.classList.remove('playing'); });

    var u = new SpeechSynthesisUtterance('Oh Zeus');
    u.lang = 'en-US';
    u.pitch = cfg.pitch;
    u.rate = cfg.rate;
    u.volume = cfg.vol;
    var enVoices = voices.filter(function(v){ return v.lang && v.lang.indexOf('en') === 0; });
    if (enVoices.length > 0) u.voice = enVoices[0];

    u.onstart = function(){ btn.classList.add('playing'); };
    u.onend = function(){ btn.classList.remove('playing'); };
    u.onerror = function(){ btn.classList.remove('playing'); };

    window.speechSynthesis.speak(u);
  }
})();
