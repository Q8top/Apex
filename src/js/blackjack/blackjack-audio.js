/* 21点 · 音效（扑克翻牌 + 筹码 + 庄家） */
(function(){
'use strict';
var ctx=null,master=null,comp=null,dryGain=null,delay=null,delayGain=null;
var enabled=true,VOL=0.7;

function init(){
  if(ctx)return true;
  try{
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=VOL;
    comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.25;
    master.connect(comp);comp.connect(ctx.destination);
    dryGain=ctx.createGain();dryGain.gain.value=.88;dryGain.connect(master);
    delay=ctx.createDelay(1);delay.delayTime.value=.08;
    delayGain=ctx.createGain();delayGain.gain.value=.22;
    delay.connect(delayGain);delayGain.connect(delay);delayGain.connect(master);
    return true;
  }catch(e){return false;}
}
function now(){return ctx?ctx.currentTime:0;}
function send(g,rev){g.connect(dryGain);if(rev&&delay)g.connect(delay);}

function ping(freq,dur,vol,when,type,rev){
  if(!enabled||!ctx)return;var t=when!=null?when:now();
  var o=ctx.createOscillator(),g=ctx.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.25,t+.01);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);send(g,rev);o.start(t);o.stop(t+dur+.05);
}
function noise(dur,vol,when,centerF,Q){
  if(!enabled||!ctx)return;var t=when!=null?when:now();
  var len=Math.floor(ctx.sampleRate*dur);
  var buf=ctx.createBuffer(1,len,ctx.sampleRate);
  var d=buf.getChannelData(0);
  var rnd=new Uint32Array(len);crypto.getRandomValues(rnd);
  for(var i=0;i<len;i++)d[i]=(rnd[i]/2147483648-1)*(1-i/len);
  var src=ctx.createBufferSource();src.buffer=buf;
  var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=centerF||2400;f.Q.value=Q||2;
  var g=ctx.createGain();g.gain.value=vol||.15;
  src.connect(f);f.connect(g);send(g,true);src.start(t);
}

var API={
  init:init,
  enabled:function(v){if(v===undefined)return enabled;enabled=!!v;if(master&&ctx)master.gain.setTargetAtTime(enabled?VOL:0,ctx.currentTime,.03);return enabled;},
  click:function(){if(!ctx)init();ping(3200,.04,.14);},
  /* 发牌：短促扑克擦过声 */
  deal:function(){if(!ctx)init();var t=now();noise(.09,.14,t,3200,1.5);ping(2800,.04,.08,t+.02,'sine',true);},
  /* 要牌（hit） */
  hit:function(){if(!ctx)init();var t=now();noise(.08,.12,t,2600,1.5);ping(2200,.05,.09,t+.01,'sine',true);},
  /* 停牌（stand） */
  stand:function(){if(!ctx)init();var t=now();ping(880,.12,.13,t);ping(660,.16,.11,t+.06);ping(440,.22,.09,t+.12);},
  /* 加倍（double）：筹码碰撞 + 上升 */
  double:function(){if(!ctx)init();var t=now();noise(.12,.15,t,1800,1.2);ping(660,.1,.14,t);ping(990,.13,.13,t+.06);ping(1320,.2,.11,t+.12);},
  /* 庄家翻牌（reveal） */
  reveal:function(){if(!ctx)init();var t=now();noise(.15,.17,t,2800,1.5);ping(560,.18,.14,t+.05);ping(840,.22,.12,t+.12);},
  /* 赢 */
  win:function(){if(!ctx)init();var t=now();[784,988,1175,1568].forEach(function(f,i){ping(f,.35,.11,t+i*.08,'sine',true);});},
  /* 21点（大奖） */
  blackjack:function(){if(!ctx)init();var t=now();noise(.4,.15,t,800,1);[523,659,784,1047,1319,1568,2093].forEach(function(f,i){ping(f,.4,.12,t+i*.07,'sine',true);});},
  /* 输 */
  lose:function(){if(!ctx)init();var t=now();ping(440,.12,.09,t);ping(330,.18,.08,t+.1);},
  /* 和局 */
  push:function(){if(!ctx)init();var t=now();ping(660,.18,.11,t);ping(660,.22,.09,t+.14);},
  /* 爆牌 */
  bust:function(){if(!ctx)init();var t=now();ping(180,.3,.12,t,'sine');ping(120,.4,.1,t+.1,'sine');}
};
window.BlackjackAudio=API;
})();
