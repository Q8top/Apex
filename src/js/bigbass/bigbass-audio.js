/* 大鱼大亨 · 音效（水声 + 木琴 + 铃铛） */
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
    comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.003;comp.release.value=0.25;
    master.connect(comp);comp.connect(ctx.destination);
    dryGain=ctx.createGain();dryGain.gain.value=0.85;dryGain.connect(master);
    delay=ctx.createDelay(1.0);delay.delayTime.value=0.1;
    delayGain=ctx.createGain();delayGain.gain.value=0.28;
    delay.connect(delayGain);delayGain.connect(delay);delayGain.connect(master);
    return true;
  }catch(e){return false;}
}
function now(){return ctx?ctx.currentTime:0;}
function send(g,rev){g.connect(dryGain);if(rev&&delay)g.connect(delay);}
function ping(freq,dur,vol,when,type,rev){if(!enabled||!ctx)return;var t=when!=null?when:now();var o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.25,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);send(g,rev);o.start(t);o.stop(t+dur+.05);}
function fm(c,m,idx,dur,vol,when,rev){if(!enabled||!ctx)return;var t=when!=null?when:now();var co=ctx.createOscillator(),mo=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();co.type='sine';co.frequency.value=c;mo.type='sine';mo.frequency.value=m;mg.gain.value=c*idx;mo.connect(mg);mg.connect(co.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.22,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);co.connect(g);send(g,rev);mo.start(t);co.start(t);mo.stop(t+dur+.03);co.stop(t+dur+.03);}
function sweep(f1,f2,dur,vol,when,type){if(!enabled||!ctx)return;var t=when!=null?when:now();var o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.15,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);send(g,true);o.start(t);o.stop(t+dur+.05);}
function noise(dur,vol,when,centerF,Q){if(!enabled||!ctx)return;var t=when!=null?when:now();var len=Math.floor(ctx.sampleRate*dur);var buf=ctx.createBuffer(1,len,ctx.sampleRate);var d=buf.getChannelData(0);var rnd=new Uint32Array(len);crypto.getRandomValues(rnd);for(var i=0;i<len;i++)d[i]=(rnd[i]/2147483648-1)*(1-i/len);var src=ctx.createBufferSource();src.buffer=buf;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=centerF||2600;f.Q.value=Q||2;var g=ctx.createGain();g.gain.value=vol||.15;src.connect(f);f.connect(g);send(g,true);src.start(t);}

var _fsBgTimer=null;
function fsBgStart(){
  if(_fsBgTimer)return;if(!ctx)init();if(!ctx)return;
  function chord(){if(!enabled)return;var t=now();[392,494,587,784].forEach(function(f,i){ping(f,.5,.05,t+i*.03,'triangle',true);});ping(1568,.15,.04,t,'sine',true);}
  chord();_fsBgTimer=setInterval(chord,700);
}
function fsBgStop(){if(_fsBgTimer){clearInterval(_fsBgTimer);_fsBgTimer=null;}}

var API={
  init:init,
  enabled:function(v){if(v===undefined)return enabled;enabled=!!v;if(master&&ctx)master.gain.setTargetAtTime(enabled?VOL:0,ctx.currentTime,.03);return enabled;},
  click:function(){if(!ctx)init();var t=now();fm(3200,1000,3,.04,.12,t);ping(2400,.03,.08,t+.005);},
  spinStart:function(){if(!ctx)init();var t=now();noise(.3,.08,t,800,1.5);sweep(600,2400,.4,.14,t);fm(2400,800,2.5,.1,.15,t,true);},
  reelStop:function(i){if(!ctx)init();var t=now();fm(1800+i*220,700+i*50,3,.1,.22,t,true);ping(2600+i*180,.05,.12,t);},
  lineWin:function(){if(!ctx)init();var t=now();ping(1047,.15,.12,t,'sine',true);ping(1568,.2,.1,t+.08,'sine',true);ping(2093,.25,.08,t+.16,'sine',true);},
  fishDrop:function(){if(!ctx)init();var t=now();ping(1319,.15,.12,t,'triangle',true);ping(1760,.2,.1,t+.06,'triangle',true);},
  fishCollect:function(){if(!ctx)init();var t=now();noise(.35,.15,t,1200,1.5);[784,988,1175,1568].forEach(function(f,i){ping(f,.3,.11,t+i*.06,'sine',true);});},
  levelUp:function(){if(!ctx)init();var t=now();noise(.5,.15,t,800,1);[523,659,784,1047,1319].forEach(function(f,i){ping(f,.35,.12,t+i*.08,'sine',true);});},
  freeSpin:function(){if(!ctx)init();var t=now();noise(.5,.15,t,1000,1);[523,659,784,1047,1319,1568].forEach(function(f,i){ping(f,.5,.11,t+i*.09,'sine',true);});},
  fsBgStart:fsBgStart,
  fsBgStop:fsBgStop,
  fsSummary:function(){if(!ctx)init();var t=now();noise(.8,.18,t,800,1);[523,659,784,1047,1319,1568,2093].forEach(function(f,i){ping(f,.55,.11,t+i*.07,'sine',true);});},
  winSmall:function(){if(!ctx)init();var t=now();ping(880,.35,.1,t,'sine',true);ping(1100,.45,.09,t+.1,'sine',true);},
  winMedium:function(){if(!ctx)init();var t=now();[880,1100,1320,1760].forEach(function(f,i){ping(f,.4,.1,t+i*.09,'sine',true);});},
  winBig:function(){if(!ctx)init();var t=now();noise(.8,.18,t,700,1);[523,659,784,1047,1319,1568,2093,2637].forEach(function(f,i){ping(f,.5,.11,t+i*.06,'sine',true);});},
  lose:function(){if(!ctx)init();var t=now();ping(440,.1,.06,null,'sine',true);ping(330,.15,.05,t+.1,'sine',true);}
};
window.BigBassAudio=API;
})();
