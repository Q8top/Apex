#!/usr/bin/env node
import fs from 'node:fs';

const app=fs.readFileSync('src/js/inline/apex-app.js','utf8');
const route=fs.readFileSync('src/js/inline/block-10-sweet-route.js','utf8');
const demo=fs.readFileSync('src/js/sweet-demo.js','utf8');
const detail=fs.readFileSync('sweet.html','utf8');
const game=fs.readFileSync('sweet-demo.html','utf8');

function ok(v,msg){if(!v){console.error('✗ '+msg);process.exitCode=1}else console.log('✓ '+msg)}
const ids=[...app.matchAll(/\{id:'([^']+)'\s*,\s*n:'([^']+)'/g)].map(m=>m[1]);
ok(ids.length===12,'首页保留 12 个游戏槽位');
ok(ids.includes('sweet'),'Sweet Bonanza 保留');
ok((app.match(/active=g\.id==='sweet'/g)||[]).length===1,'只有 Sweet Bonanza 标记为 active');
ok(route.includes("var ACTIVE = '糖果连连爆'"),'路由只允许 Sweet Bonanza');
ok(!route.includes('olympus.html')&&!route.includes('sugar.html'),'其他游戏没有详情页跳转');
ok(demo.includes("sessionStorage.removeItem('apex.sweet.history.v1')"),'旧游戏历史数据不再继续使用');
ok(!demo.includes('Math.random'),'游戏 UI 不使用 Math.random');
ok(detail.includes('虚拟积分试玩'),'详情页明确为虚拟积分体验');
ok(game.includes('id="game-history"'),'游戏页包含记录入口');
if(process.exitCode)process.exit(1);
console.log('ALL SWEET CATALOG CHECKS PASSED');
