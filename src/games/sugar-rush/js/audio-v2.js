(function(){
'use strict';
var ctx=null, master=null, sfxGain=null, musicGain=null;
var enabled=true, musicOn=false;
function ensureCtx(){
  if(ctx)return true;
  var AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try{ctx=new AC();}catch(e){return false;}
  master=ctx.createGain();master.gain.value=1;master.connect(ctx.destination);
  sfxGain=ctx.createGain();sfxGain.gain.value=0.8;sfxGain.connect(master);
  musicGain=ctx.createGain();musicGain.gain.value=0.5;musicGain.connect(master);
  return true;
}
function resume(){
  if(!ensureCtx())return;
  if(ctx.state==='suspended'){try{ctx.resume();}catch(e){}}
}
function tone(opts){
  if(!enabled||!ensureCtx())return;
  var o=ctx.createOscillator();
  var g=ctx.createGain();
  o.type=opts.type||'sine';
  var t=ctx.currentTime+(opts.delay||0);
  var f0=opts.freq||440, f1=opts.freqEnd||f0;
  o.frequency.setValueAtTime(f0,t);
  if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+(opts.dur||0.2));
  var vol=opts.vol===undefined?0.3:opts.vol;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+(opts.attack||0.008));
  g.gain.exponentialRampToValueAtTime(0.0001,t+(opts.dur||0.2));
  o.connect(g);g.connect(sfxGain);
  o.start(t);o.stop(t+(opts.dur||0.2)+0.02);
}
function noise(opts){
  if(!enabled||!ensureCtx())return;
  var dur=opts.dur||0.2;
  var sr=ctx.sampleRate;
  var buf=ctx.createBuffer(1,Math.floor(sr*dur),sr);
  var data=buf.getChannelData(0);
  for(var i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,opts.decay||1.6);
  var src=ctx.createBufferSource();src.buffer=buf;
  var g=ctx.createGain();g.gain.value=opts.vol===undefined?0.25:opts.vol;
  var f=ctx.createBiquadFilter();f.type=opts.filter||'highpass';f.frequency.value=opts.cutoff||800;
  src.connect(f);f.connect(g);g.connect(sfxGain);
  src.start(ctx.currentTime+(opts.delay||0));
}
function setEnabled(v){enabled=!!v;if(enabled)resume();}
function setSfx(v){if(sfxGain)sfxGain.gain.value=Math.max(0,Math.min(1,v));}
function setMusic(v){if(musicGain)musicGain.gain.value=Math.max(0,Math.min(1,v));}
function bindSettings(){
  var S=window.ApexSRSettings;if(!S)return;
  setEnabled(S.get('sound')!==false);
  setSfx(S.get('sfx')===undefined?0.8:S.get('sfx'));
  setMusic(S.get('music')===undefined?0.7:S.get('music'));
}
function ready(){
  ready._done=true;
  bindSettings();
  document.addEventListener('touchstart',resume,{once:true,passive:true});
  document.addEventListener('click',resume,{once:true});
}
if(document.readyState!=='loading')ready();
else document.addEventListener('DOMContentLoaded',ready);
/* ===== SFX events ===== */
function sfxTap(){tone({type:'triangle',freq:520,freqEnd:680,dur:0.06,vol:0.18});}
function sfxSpin(){
  noise({dur:0.32,vol:0.22,filter:'highpass',cutoff:1200,decay:1.8});
  tone({type:'sawtooth',freq:180,freqEnd:340,dur:0.22,vol:0.14});
  tone({type:'triangle',freq:440,freqEnd:660,dur:0.18,vol:0.10,delay:0.06});
}
function sfxLand(idx){
  var base=380+(idx%7)*40;
  tone({type:'sine',freq:base,freqEnd:base*0.7,dur:0.10,vol:0.14});
  noise({dur:0.06,vol:0.10,filter:'lowpass',cutoff:900,decay:2.2});
}
function sfxWin(tier){
  var pats=[
    {notes:[[523,0],[659,0.06],[784,0.12]],vol:0.22,dur:0.16},
    {notes:[[523,0],[659,0.07],[784,0.14],[1047,0.21]],vol:0.26,dur:0.20},
    {notes:[[523,0],[659,0.08],[784,0.16],[1047,0.24],[1319,0.32]],vol:0.30,dur:0.24},
    {notes:[[523,0],[784,0.09],[1047,0.18],[1319,0.27],[1568,0.36],[2093,0.45]],vol:0.34,dur:0.30},
    {notes:[[523,0],[659,0.08],[784,0.16],[1047,0.24],[1319,0.32],[1568,0.40],[2093,0.48],[2637,0.56]],vol:0.38,dur:0.40}
  ];
  var t=Math.max(0,Math.min(4,tier|0));
  var p=pats[t];
  for(var i=0;i<p.notes.length;i++){
    tone({type:'triangle',freq:p.notes[i][0],dur:p.dur,vol:p.vol,delay:p.notes[i][1]});
  }
  if(t>=3)noise({dur:0.45,vol:0.14,filter:'highpass',cutoff:1400,decay:1.2});
}
function sfxScatter(){
  tone({type:'sine',freq:660,freqEnd:1320,dur:0.22,vol:0.24});
  tone({type:'triangle',freq:990,freqEnd:1980,dur:0.20,vol:0.18,delay:0.04});
  noise({dur:0.28,vol:0.16,filter:'highpass',cutoff:1600,decay:1.5});
}
function sfxMultiplier(level){
  var scale=[523,659,784,1047,1319,1568,2093,2637];
  var i=Math.max(0,Math.min(scale.length-1,level|0));
  tone({type:'triangle',freq:scale[i],freqEnd:scale[i]*1.5,dur:0.24,vol:0.28});
  tone({type:'sine',freq:scale[i]*2,dur:0.18,vol:0.12,delay:0.06});
  if(i>=5)noise({dur:0.35,vol:0.14,filter:'highpass',cutoff:1800,decay:1.4});
}
function sfxFSEntry(){
  var seq=[392,494,587,784,988,1175];
  for(var i=0;i<seq.length;i++){
    tone({type:'sawtooth',freq:seq[i],dur:0.30,vol:0.20,delay:i*0.09});
    tone({type:'triangle',freq:seq[i]*2,dur:0.24,vol:0.10,delay:i*0.09+0.03});
  }
  noise({dur:0.85,vol:0.14,filter:'highpass',cutoff:900,decay:1.1});
}
function sfxFSExit(){
  tone({type:'triangle',freq:880,freqEnd:330,dur:0.55,vol:0.22});
  noise({dur:0.40,vol:0.10,filter:'lowpass',cutoff:900,decay:1.4});
}
window.ApexSRAudio=Object.freeze({
  tone:tone,noise:noise,resume:resume,
  setEnabled:setEnabled,setSfx:setSfx,setMusic:setMusic,
  sfxTap:sfxTap,sfxSpin:sfxSpin,sfxLand:sfxLand,sfxWin:sfxWin,
  sfxScatter:sfxScatter,sfxMultiplier:sfxMultiplier,
  sfxFSEntry:sfxFSEntry,sfxFSExit:sfxFSExit,
  _isReady:function(){return !!ctx;}
});
})();
