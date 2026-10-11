'use strict';
require('./_loader.cjs').loadAll();
var passed=0, failed=0;
function ok(c,n){if(c)passed++;else{failed++;console.log('FAIL: '+n);}}
var L=window.ApexSugarRushSymbolsLocked;
var PTL=window.ApexSugarRushPaytableLocked;

// 1. 全部 9 个符号均有 LABEL
var ids=L.list();
ok(ids.length===9,'9 symbols total, got '+ids.length);
for(var i=0;i<ids.length;i++){
  var id=ids[i];
  var lbl=L.labelOf(id);
  ok(lbl&&lbl!==id,'label of '+id+' is defined ('+lbl+')');
}

// 2. 9 个符号均有 kind
for(var j=0;j<ids.length;j++){
  var k=L.kindOf(ids[j]);
  ok(k&&(k==='regular'||k==='scatter'||k==='multiplier'),'kind of '+ids[j]+' is valid: '+k);
}

// 3. regular 符号有 paytableKey，且都在 paytable 里
var regCount=0, scCount=0, muCount=0;
var LOCKED=L.LOCKED;
for(var m=0;m<ids.length;m++){
  var id=ids[m];
  var k=L.kindOf(id);
  if(k==='regular'){
    regCount++;
    var pk=LOCKED[id].paytableKey;
    ok(pk&&PTL.PAYTABLE_SNAPSHOT[pk],'paytable entry for '+id+' ('+pk+')');
  } else if(k==='scatter'){ scCount++; }
  else if(k==='multiplier'){ muCount++; }
}
ok(regCount===7,'7 regular symbols, got '+regCount);
ok(scCount===1,'1 scatter symbol, got '+scCount);
ok(muCount===1,'1 multiplier symbol, got '+muCount);

// 4. LABELS 里所有 key 对应有效 id
var keys=Object.keys(L.LABELS);
for(var n=0;n<keys.length;n++){
  ok(L.isLocked(keys[n]),'LABELS key '+keys[n]+' is a locked id');
}

console.log('[symbols-audit] passed='+passed+' failed='+failed);
process.exit(failed>0?1:0);
