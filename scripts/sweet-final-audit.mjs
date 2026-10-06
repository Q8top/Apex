import fs from 'node:fs';
import { createMathEngine } from '../src/js/engine/math-engine.js';
const config=JSON.parse(fs.readFileSync('config/game.json','utf8'));
const engine=createMathEngine(config,{seed:0x5EE37,mode:'real'});
let wager=0,win=0,hits=0,maxRatio=0,free=0,tumbles=0;
const N=50000;
for(let i=0;i<N;i++){const r=engine.playSpin(1);wager+=1;win+=r.totalWin;if(r.totalWin>0)hits++;maxRatio=Math.max(maxRatio,r.winRatio||0);tumbles+=r.tumble?.tumbleCount||0;if(r.freeSpinsAwarded)free++;}
const rtp=win/wager;
console.log(JSON.stringify({spins:N,rtp:Number(rtp.toFixed(6)),hitRate:Number((hits/N).toFixed(6)),maxWinRatio:Number(maxRatio.toFixed(2)),freeSpinTriggers:free,tumbles},{null:2}));
if(!(rtp>=0.75&&rtp<=1.1)) process.exit(1);
