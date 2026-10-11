(function(){
'use strict';
/* Sugar Rush isolated audio player.
 * Uses HTMLAudioElement directly; no dependency on candy audio manager.
 * All files in /sfx/sugar-rush/ are CC0.
 */
var BASE = "/sfx/sugar-rush/";
var FILES = {
  "spin-start":  "spin-start.wav",
  "tumble-land": "tumble-land.ogg",
  "win-normal":  "win-normal.wav",
  "win-big":     "win-big.ogg",
  "scatter":     "scatter.ogg",
  "fs-enter":    "fs-enter.wav",
  "multiplier":  "multiplier.wav",
  "ui-tap":      "ui-tap.ogg"
};

var pool = {};
var enabled = true;
var volume = 0.9;

function load(){
  Object.keys(FILES).forEach(function(name){
    var a = new Audio(BASE + FILES[name]);
    a.preload = "auto";
    a.volume = volume;
    pool[name] = a;
  });
}

function play(name){
  if (!enabled) return;
  var a = pool[name];
  if (!a) return;
  try {
    var c = a.cloneNode();
    c.volume = volume;
    var p = c.play();
    if (p && typeof p.catch === "function") p.catch(function(){});
  } catch (e) {}
}

function setEnabled(v){ enabled = !!v; }
function setVolume(v){ if (Number.isFinite(v)) volume = Math.max(0, Math.min(1, v)); }
function isEnabled(){ return enabled; }

window.ApexSugarRushAudio = Object.freeze({
  load: load,
  play: play,
  setEnabled: setEnabled,
  setVolume: setVolume,
  isEnabled: isEnabled
});
})();
