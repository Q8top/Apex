/* Apex Olympus - professional audio synthesis. */
(function (global) {
'use strict';
var actx = null, unlocked = false, muted = false;
var master, busDry, busWet, convolver, compressor;
var bgmEl = null, payoutEl = null;
function ensureCtx() {
if (actx) return actx;
var AC = global.AudioContext || global.webkitAudioContext;
if (!AC) return null;
actx = new AC();
master = actx.createGain();
master.gain.value = muted ? 0 : 1;
master.connect(actx.destination);
compressor = actx.createDynamicsCompressor();
compressor.threshold.value = -18;
compressor.knee.value = 12;
compressor.ratio.value = 4;
compressor.attack.value = 0.003;
compressor.release.value = 0.18;
compressor.connect(master);
busDry = actx.createGain();
busDry.gain.value = 0.9;
busDry.connect(compressor);
busWet = actx.createGain();
busWet.gain.value = 0.35;
convolver = actx.createConvolver();
convolver.buffer = impulseResponse(2.8, 2.4);
busWet.connect(convolver);
convolver.connect(compressor);
return actx;
}
function impulseResponse(duration, decay) {
var rate = actx.sampleRate;
var len = Math.floor(rate * duration);
var buf = actx.createBuffer(2, len, rate);
var r = new Uint8Array(2048), ri = 2048;
for (var ch = 0; ch < 2; ch++) {
var data = buf.getChannelData(ch);
for (var i = 0; i < len; i++) {
if (ri >= 2048) { crypto.getRandomValues(r); ri = 0; }
var n = (r[ri++] / 127.5) - 1;
var t = i / len;
data[i] = n * Math.pow(1 - t, decay);
}
}
return buf;
}
function unlock() {
var ctx = ensureCtx();
if (!ctx) return;
// iOS / Android suspend ctx when the tab goes hidden; always try.
if (ctx.state === 'suspended') {
var r = ctx.resume();
if (r && r.catch) r.catch(function () {});
}
unlocked = true;
}
function fmBell(freq, dur, vol, delay, brightness) {
var ctx = ensureCtx(); if (!ctx) return;
var t0 = ctx.currentTime + (delay || 0);
var b = brightness != null ? brightness : 2.0;
var carrier = ctx.createOscillator();
carrier.type = 'sine';
carrier.frequency.value = freq;
var mod = ctx.createOscillator();
mod.type = 'sine';
mod.frequency.value = freq * b;
var modGain = ctx.createGain();
modGain.gain.setValueAtTime(freq * 4.5, t0);
modGain.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.75);
mod.connect(modGain);
modGain.connect(carrier.frequency);
var env = ctx.createGain();
env.gain.setValueAtTime(0.0001, t0);
env.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.006);
env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
carrier.connect(env);
env.connect(busDry);
env.connect(busWet);
carrier.start(t0); mod.start(t0);
carrier.stop(t0 + dur + 0.08);
mod.stop(t0 + dur + 0.08);
}
function orchestraPad(freq, dur, vol, delay, brightness) {
var ctx = ensureCtx(); if (!ctx) return;
var t0 = ctx.currentTime + (delay || 0);
var b = brightness != null ? brightness : 0.7;
var amps = [1.0, 0.55, 0.42, 0.28, 0.18, 0.12, 0.07, 0.04];
var lfo = ctx.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 4.6;
var lfoGain = ctx.createGain();
lfoGain.gain.value = (vol || 0.3) * 0.15;
lfo.connect(lfoGain);
var env = ctx.createGain();
env.gain.setValueAtTime(0.0001, t0);
env.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + dur * 0.18);
env.gain.setValueAtTime(vol || 0.3, t0 + dur * 0.55);
env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
lfoGain.connect(env.gain);
var flt = ctx.createBiquadFilter();
flt.type = 'lowpass';
flt.frequency.setValueAtTime(freq * 5 * b, t0);
flt.frequency.exponentialRampToValueAtTime(freq * 8 * b, t0 + dur * 0.3);
flt.frequency.exponentialRampToValueAtTime(freq * 3 * b, t0 + dur);
flt.Q.value = 0.7;
for (var h = 0; h < amps.length; h++) {
var o = ctx.createOscillator();
o.type = 'sine';
o.frequency.value = freq * (h + 1);
o.detune.value = (h % 2 === 0 ? 1 : -1) * (h * 1.2);
var g = ctx.createGain();
g.gain.value = amps[h] * 0.18;
o.connect(g); g.connect(flt);
o.start(t0); o.stop(t0 + dur + 0.05);
}
flt.connect(env);
env.connect(busDry);
env.connect(busWet);
lfo.start(t0); lfo.stop(t0 + dur + 0.05);
}
function noiseHit(dur, f1, f2, Q, vol, delay, type) {
var ctx = ensureCtx(); if (!ctx) return;
var t0 = ctx.currentTime + (delay || 0);
var n = Math.floor(ctx.sampleRate * dur);
var buf = ctx.createBuffer(1, n, ctx.sampleRate);
var d = buf.getChannelData(0);
var r = new Uint8Array(2048), ri = 2048;
for (var i = 0; i < n; i++) {
if (ri >= 2048) { crypto.getRandomValues(r); ri = 0; }
d[i] = (r[ri++] / 127.5) - 1;
}
var src = ctx.createBufferSource(); src.buffer = buf;
var flt = ctx.createBiquadFilter();
flt.type = type || 'bandpass';
flt.frequency.setValueAtTime(f1, t0);
flt.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
flt.Q.value = Q || 1.0;
var g = ctx.createGain();
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.012);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
src.connect(flt); flt.connect(g);
g.connect(busDry); g.connect(busWet);
src.start(t0); src.stop(t0 + dur + 0.05);
}
function sfxSpin() {
noiseHit(0.5, 400, 2400, 0.9, 0.22, 0, 'bandpass');
var ctx = ensureCtx(); if (!ctx) return;
var t0 = ctx.currentTime;
var o = ctx.createOscillator(); o.type = 'sawtooth';
o.frequency.setValueAtTime(55, t0);
o.frequency.exponentialRampToValueAtTime(95, t0 + 0.35);
var f = ctx.createBiquadFilter(); f.type = 'lowpass';
f.frequency.value = 260;
var g = ctx.createGain();
g.gain.setValueAtTime(0.0001, t0);
g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
o.connect(f); f.connect(g); g.connect(busDry); g.connect(busWet);
o.start(t0); o.stop(t0 + 0.55);
}
function sfxStop() {
for (var i = 0; i < 6; i++) {
noiseHit(0.09, 1400, 400, 1.8, 0.24, i * 0.085, 'bandpass');
fmBell(180 - i * 12, 0.14, 0.10, i * 0.085, 1.5);
}
}
function sfxWinSmall() {
fmBell(1180, 0.55, 0.34, 0, 2.3);
fmBell(1760, 0.45, 0.18, 0.04, 2.0);
}
function sfxWinMid() {
var notes = [659, 784, 988, 1319];
for (var i = 0; i < notes.length; i++) fmBell(notes[i], 0.7, 0.32, i * 0.10, 2.4);
orchestraPad(165, 1.1, 0.22, 0, 0.7);
}
function sfxWinBig() {
var arp = [523, 659, 784, 988, 1175, 1568, 2093];
for (var i = 0; i < arp.length; i++) fmBell(arp[i], 1.0, 0.30, i * 0.075, 2.6);
orchestraPad(131, 1.6, 0.24, 0, 0.8);
orchestraPad(196, 1.6, 0.20, 0, 0.8);
orchestraPad(262, 1.6, 0.18, 0, 0.8);
noiseHit(0.9, 5000, 9000, 0.7, 0.11, 0.35, 'highpass');
}
function sfxButton() {
noiseHit(0.04, 2600, 1800, 2.0, 0.14, 0, 'bandpass');
fmBell(1900, 0.05, 0.09, 0.005, 3.0);
}
function sfxScatter() {
noiseHit(0.45, 600, 3200, 1.2, 0.22, 0, 'bandpass');
fmBell(1568, 0.55, 0.22, 0.1, 2.8);
fmBell(2349, 0.45, 0.16, 0.18, 2.5);
}
function sfxFsTrigger() {
orchestraPad(130.81, 2.2, 0.26, 0, 0.9);
orchestraPad(164.81, 2.2, 0.24, 0, 0.9);
orchestraPad(196.00, 2.2, 0.22, 0, 0.9);
var arp = [1047, 1319, 1568, 2093, 2637];
for (var i = 0; i < arp.length; i++) fmBell(arp[i], 0.85, 0.26, 0.5 + i * 0.11, 2.7);
noiseHit(1.6, 200, 60, 0.7, 0.28, 0, 'lowpass');
noiseHit(1.2, 3500, 800, 0.9, 0.10, 0.2, 'bandpass');
}
function sfxMultiplier() {
noiseHit(0.12, 800, 200, 1.5, 0.30, 0, 'bandpass');
fmBell(240, 0.5, 0.22, 0.01, 1.8);
fmBell(720, 0.45, 0.14, 0.03, 2.0);
fmBell(1440, 0.35, 0.08, 0.05, 2.2);
}
function sfxTumble() {
noiseHit(0.32, 500, 2200, 1.1, 0.16, 0, 'bandpass');
}
function startBgm() {
if (bgmEl) { if (bgmEl.paused) bgmEl.play().catch(function(){}); return; }
bgmEl = new Audio('/assets/audio/olympus-bgm.mp3');
bgmEl.loop = true; bgmEl.volume = 0.45; bgmEl.preload = 'auto';
bgmEl.play().catch(function(){});
}
function stopBgm() {
if (bgmEl) { try { bgmEl.pause(); } catch (e) {} }
}
function playPayout() {
if (!payoutEl) {
payoutEl = new Audio('/assets/audio/olympus-payout.mp3');
payoutEl.volume = 0.7; payoutEl.preload = 'auto';
}
try { payoutEl.currentTime = 0; payoutEl.play().catch(function(){}); } catch (e) {}
}
function setMuted(v) {
muted = !!v;
if (master && actx) {
var target = muted ? 0.0001 : 1;
master.gain.setTargetAtTime(target, actx.currentTime, 0.06);
} else if (master) {
master.gain.value = muted ? 0 : 1;
}
if (bgmEl) bgmEl.muted = muted;
if (payoutEl) payoutEl.muted = muted;
}
function resume() {
var ctx = ensureCtx();
if (!ctx) return;
if (ctx.state === 'suspended') {
var r = ctx.resume();
if (r && r.catch) r.catch(function () {});
}
}
global.OlympusAudio = Object.freeze({
unlock: unlock,
resume: resume,
startBgm: startBgm, stopBgm: stopBgm,
playPayout: playPayout,
spin: sfxSpin, stop: sfxStop,
winSmall: sfxWinSmall, winMid: sfxWinMid, winBig: sfxWinBig,
button: sfxButton, scatter: sfxScatter,
fsTrigger: sfxFsTrigger, multiplier: sfxMultiplier,
tumble: sfxTumble,
setMuted: setMuted,
isMuted: function () { return muted; }
});
})(typeof window !== 'undefined' ? window : globalThis);
