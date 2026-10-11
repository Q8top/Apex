/* Apex · BGM 双轨动态音乐（合成器垫底版）
 * S1.4-4: 正式素材到位前，用 Web Audio 合成两轨 pad；
 * crossfade(to) 在 base / fs 两轨间过渡。
 * 对外契约：attach(ctx) / toBase(ms) / toFreeSpins(ms) / stop() / isOn()
 */
(function(){
'use strict';

var ctx=null, master=null, baseGain=null, fsGain=null, cur='base', started=false;
var baseOsc=[], fsOsc=[];
var baseLfo=null, fsLfo=null;
var enabled=true;

var BASE_NOTES=[196.00, 246.94, 293.66, 392.00];  // G3 B3 D4 G4
var FS_NOTES  =[261.63, 329.63, 392.00, 523.25];  // C4 E4 G4 C5

function ensureCtx(){
  if(ctx)return ctx;
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return null;
  try{ctx=new AC();}catch(e){return null;}
  master=ctx.createGain(); master.gain.value=0.35;
  master.connect(ctx.destination);
  baseGain=ctx.createGain(); baseGain.gain.value=0;
  fsGain=ctx.createGain(); fsGain.gain.value=0;
  baseGain.connect(master); fsGain.connect(master);
  buildTrack(BASE_NOTES, baseGain, baseOsc, 'base');
  buildTrack(FS_NOTES, fsGain, fsOsc, 'fs');
  return ctx;
}

function buildTrack(notes, gainBus, oscArr, tag){
  var lp=ctx.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=(tag==='fs')?2600:1800; lp.Q.value=0.6;
  var out=ctx.createGain(); out.gain.value=0.12;
  for(var i=0;i<notes.length;i++){
    var o=ctx.createOscillator();
    o.type=(tag==='fs')?'triangle':'sine';
    o.frequency.value=notes[i];
    var g=ctx.createGain(); g.gain.value=0.28/(i+1);
    o.connect(g); g.connect(lp);
    try{o.start();}catch(e){}
    oscArr.push(o);
  }
  lp.connect(out); out.connect(gainBus);
  // LFO 微幅频率调制，让 pad 有呼吸感
  var lfo=ctx.createOscillator(); lfo.type='sine';
  lfo.frequency.value=(tag==='fs')?0.5:0.22;
  var lfoGain=ctx.createGain(); lfoGain.gain.value=(tag==='fs')?3.5:2.0;
  lfo.connect(lfoGain);
  for(var k=0;k<oscArr.length;k++){ lfoGain.connect(oscArr[k].frequency); }
  try{lfo.start();}catch(e){}
  if(tag==='base')baseLfo=lfo; else fsLfo=lfo;
}

function crossfade(to, ms){
  if(!ctx)return;
  ms=ms||1500;
  var t=ctx.currentTime, d=ms/1000;
  var a=(to==='fs')?fsGain:baseGain;
  var b=(to==='fs')?baseGain:fsGain;
  var target=0.7;
  a.gain.cancelScheduledValues(t);
  a.gain.setValueAtTime(a.gain.value, t);
  a.gain.linearRampToValueAtTime(target, t+d);
  b.gain.cancelScheduledValues(t);
  b.gain.setValueAtTime(b.gain.value, t);
  b.gain.linearRampToValueAtTime(0.0001, t+d);
  cur=to;
}

function attach(c){
  if(c){ ctx=c; }
  else ensureCtx();
  started=true;
}

function toBase(ms){
  if(!enabled)return;
  if(!started)attach();
  crossfade('base', ms);
}

function toFreeSpins(ms){
  if(!enabled)return;
  if(!started)attach();
  crossfade('fs', ms);
}

function stop(){
  if(!ctx)return;
  if(baseGain){ baseGain.gain.cancelScheduledValues(ctx.currentTime); baseGain.gain.value=0; }
  if(fsGain){ fsGain.gain.cancelScheduledValues(ctx.currentTime); fsGain.gain.value=0; }
}

function setEnabled(v){
  enabled=!!v;
  if(!enabled)stop();
  else if(started && cur)crossfade(cur, 400);
}

function isOn(){ return enabled && started && ctx && ctx.state==='running' && (baseGain.gain.value>0.05 || fsGain.gain.value>0.05); }

window.ApexBgm = Object.freeze({
  attach:attach, toBase:toBase, toFreeSpins:toFreeSpins,
  stop:stop, setEnabled:setEnabled, isOn:isOn
});
})();
