/* 通用固定线 · 音效 */
(function(){
'use strict';
var ctx=null,master=null,comp=null,dry=null,enabled=true,VOL=0.65;
function init(){if(ctx)return true;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=VOL;comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination);dry=ctx.createGain();dry.gain.value=.9;dry.connect(master);return true;}catch(e){return false;}}
function now(){return ctx?ctx.currentTime:0;}
function ping(f,d,v,w,t){if(!enabled||!ctx)return;var s=w!=null?w:now();var o=ctx.createOscillator(),g=ctx.createGain();o.type=t||'sine';o.frequency.setValueAtTime(f,s);g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(v||.2,s+.01);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g);g.connect(dry);o.start(s);o.stop(s+d+.05);}
function noise(d,v,w,c,q){if(!enabled||!ctx)return;var s=w!=null?w:now();var n=Math.floor(ctx.sampleRate*d);var b=ctx.createBuffer(1,n,ctx.sampleRate);var a=b.getChannelData(0);var r=new Uint32Array(n);crypto.getRandomValues(r);for(var i=0;i<n;i++)a[i]=(r[i]/2147483648-1)*(1-i/n);var src=ctx.createBufferSource();src.buffer=b;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=c||2400;f.Q.value=q||2;var g=ctx.createGain();g.gain.value=v||.12;src.connect(f);f.connect(g);g.connect(dry);src.start(s);}
var _fsT=null;
function fsBgStart(){if(_fsT)return;if(!ctx)init();if(!ctx)return;function c(){if(!enabled)return;var t=now();[392,523,659,784].forEach(function(f,i){ping(f,.55,.045,t+i*.02);});}c();_fsT=setInterval(c,700);}
function fsBgStop(){if(_fsT){clearInterval(_fsT);_fsT=null;}}
var API={
  init:init,
  enabled:function(v){if(v===undefined)return enabled;enabled=!!v;if(master&&ctx)master.gain.setTargetAtTime(enabled?VOL:0,ctx.currentTime,.03);return enabled;},
  click:function(){if(!ctx)init();ping(3200,.04,.12);},
  spinStart:function(){if(!ctx)init();var t=now();noise(.3,.07,t,800,1.5);ping(600,.4,.1,t);},
  reelStop:function(i){if(!ctx)init();var t=now();ping(2000+i*200,.08,.14,t);ping(120,.1,.08,t,'triangle');},
  lineWin:function(){if(!ctx)init();var t=now();[784,988,1175].forEach(function(f,i){ping(f,.18,.1,t+i*.06,'sine');});},
  freeSpin:function(){if(!ctx)init();var t=now();noise(.5,.15,t,1000,1);[523,659,784,1047,1319,1568].forEach(function(f,i){ping(f,.45,.09,t+i*.08);});},
  fsBgStart:fsBgStart,fsBgStop:fsBgStop,
  fsSummary:function(){if(!ctx)init();var t=now();noise(.7,.16,t,800,1);[523,659,784,1047,1319,1568].forEach(function(f,i){ping(f,.5,.09,t+i*.07);});},
  winSmall:function(){if(!ctx)init();var t=now();ping(880,.3,.09,t);ping(1100,.4,.08,t+.1);},
  winMedium:function(){if(!ctx)init();var t=now();[880,1100,1320,1760].forEach(function(f,i){ping(f,.35,.09,t+i*.08);});},
  winBig:function(){if(!ctx)init();var t=now();noise(.6,.16,t,800,1);[523,659,784,1047,1319,1568,2093].forEach(function(f,i){ping(f,.45,.1,t+i*.06);});},
  lose:function(){if(!ctx)init();var t=now();ping(440,.1,.07,t);ping(330,.15,.06,t+.1);}
};
window.LinesAudio=API;
})();
