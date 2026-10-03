/* Crash 系列 · 音效（上升气浪 + 爆炸 + 提现铃） */
(function(){
'use strict';
var ctx=null,master=null,comp=null,dryGain=null,enabled=true,VOL=0.7;
function init(){
  if(ctx)return true;
  try{
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
    ctx=new AC();
    master=ctx.createGain();master.gain.value=VOL;
    comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.003;comp.release.value=.25;
    master.connect(comp);comp.connect(ctx.destination);
    dryGain=ctx.createGain();dryGain.gain.value=.9;dryGain.connect(master);
    return true;
  }catch(e){return false;}
}
function now(){return ctx?ctx.currentTime:0;}
function ping(freq,dur,vol,when,type){if(!enabled||!ctx)return;var t=when!=null?when:now();var o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.25,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(dryGain);o.start(t);o.stop(t+dur+.05);}
function fm(c,m,idx,dur,vol,when,rev){if(!enabled||!ctx)return;var t=when!=null?when:now();var co=ctx.createOscillator(),mo=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();co.type='sine';co.frequency.value=c;mo.type='sine';mo.frequency.value=m;mg.gain.value=c*idx;mo.connect(mg);mg.connect(co.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.22,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);co.connect(g);g.connect(dryGain);mo.start(t);co.start(t);mo.stop(t+dur+.03);co.stop(t+dur+.03);}
function noise(dur,vol,when,centerF,Q){if(!enabled||!ctx)return;var t=when!=null?when:now();var len=Math.floor(ctx.sampleRate*dur);var buf=ctx.createBuffer(1,len,ctx.sampleRate);var d=buf.getChannelData(0);var rnd=new Uint32Array(len);crypto.getRandomValues(rnd);for(var i=0;i<len;i++)d[i]=(rnd[i]/2147483648-1)*(1-i/len);var src=ctx.createBufferSource();src.buffer=buf;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=centerF||2400;f.Q.value=Q||2;var g=ctx.createGain();g.gain.value=vol||.15;src.connect(f);f.connect(g);g.connect(dryGain);src.start(t);}

var _riseOsc=null, _riseGain=null, _riseFilter=null, _riseNoiseSrc=null, _riseNoiseGain=null;
function startRise(){
  if(!enabled||!ctx)return;
  if(_riseOsc)return;
  try{
    // 低频正弦：180 → 420Hz（比原 sawtooth 80→900 柔和很多）
    _riseOsc=ctx.createOscillator();_riseGain=ctx.createGain();_riseFilter=ctx.createBiquadFilter();
    _riseOsc.type="sine";
    _riseOsc.frequency.setValueAtTime(180,ctx.currentTime);
    _riseOsc.frequency.linearRampToValueAtTime(420,ctx.currentTime+10);
    _riseFilter.type="lowpass";_riseFilter.frequency.value=900;_riseFilter.Q.value=.5;
    _riseGain.gain.setValueAtTime(0,ctx.currentTime);
    _riseGain.gain.linearRampToValueAtTime(.045,ctx.currentTime+1.5);
    _riseOsc.connect(_riseFilter);_riseFilter.connect(_riseGain);_riseGain.connect(dryGain);
    _riseOsc.start();
    // 加一层薄风声（带通噪声）
    var len=Math.floor(ctx.sampleRate*12);
    var buf=ctx.createBuffer(1,len,ctx.sampleRate);
    var d=buf.getChannelData(0);
    var rnd=new Uint32Array(len);crypto.getRandomValues(rnd);
    for(var i=0;i<len;i++)d[i]=(rnd[i]/2147483648-1)*.35;
    _riseNoiseSrc=ctx.createBufferSource();_riseNoiseSrc.buffer=buf;
    var nf=ctx.createBiquadFilter();nf.type="bandpass";nf.frequency.value=500;nf.Q.value=.7;
    _riseNoiseGain=ctx.createGain();_riseNoiseGain.gain.setValueAtTime(0,ctx.currentTime);
    _riseNoiseGain.gain.linearRampToValueAtTime(.03,ctx.currentTime+1.5);
    _riseNoiseSrc.connect(nf);nf.connect(_riseNoiseGain);_riseNoiseGain.connect(dryGain);
    _riseNoiseSrc.start();
  }catch(e){}
}
function stopRise(){
  try{
    if(_riseOsc){
      var now=ctx?ctx.currentTime:0;
      _riseGain.gain.cancelScheduledValues(now);
      _riseGain.gain.setValueAtTime(_riseGain.gain.value,now);
      _riseGain.gain.linearRampToValueAtTime(0,now+.15);
      _riseOsc.stop(now+.2);
    }
    if(_riseNoiseSrc){
      var now2=ctx?ctx.currentTime:0;
      _riseNoiseGain.gain.cancelScheduledValues(now2);
      _riseNoiseGain.gain.setValueAtTime(_riseNoiseGain.gain.value,now2);
      _riseNoiseGain.gain.linearRampToValueAtTime(0,now2+.15);
      _riseNoiseSrc.stop(now2+.2);
    }
  }catch(e){}
  _riseOsc=null;_riseGain=null;_riseFilter=null;_riseNoiseSrc=null;_riseNoiseGain=null;
}

var API={
  init:init,
  enabled:function(v){if(v===undefined)return enabled;enabled=!!v;if(master&&ctx)master.gain.setTargetAtTime(enabled?VOL:0,ctx.currentTime,.03);return enabled;},
  click:function(){if(!ctx)init();fm(3200,1000,3,.04,.12);},
  bet:function(){if(!ctx)init();ping(660,.1,.14);ping(990,.12,.12,now()+.05);ping(1320,.15,.1,now()+.1);},
  startRise:startRise,
  stopRise:stopRise,
  cashout:function(){if(!ctx)init();var t=now();ping(1047,.15,.14,t);ping(1319,.18,.13,t+.07);ping(1568,.22,.12,t+.14);ping(2093,.3,.1,t+.21);},
  bust:function(){if(!ctx)init();var t=now();noise(.8,.25,t,400,.8);ping(110,.4,.22,t,'sawtooth');ping(55,.6,.15,t+.05,'sine');},
  highWin:function(){if(!ctx)init();var t=now();noise(.5,.18,t,800,1);[523,659,784,1047,1319,1568,2093].forEach(function(f,i){ping(f,.4,.12,t+i*.07);});}
};
window.CrashAudio=API;
})();
