(function(){
'use strict';
var root=null,body=null;
var SECS=[
  {t:'\u73a9\u6cd5\u8bf4\u660e',b:'7 \u00d7 7 \u68cb\u76d8\uff0c\u6bcf\u6b21\u65cb\u8f6c\u751f\u6210 49 \u4e2a\u7b26\u53f7\u3002'}
  ,{t:'\u4e2d\u5956\u89c4\u5219',b:'\u76f8\u90bb\uff08\u4e0a\u4e0b\u5de6\u53f3\uff095 \u4e2a\u6216\u4ee5\u4e0a\u76f8\u540c\u7b26\u53f7\u8fde\u6210\u4e00\u7c07\u5373\u4e2d\u5956\uff0c\u4f4d\u7f6e\u4e0d\u9700\u5728\u540c\u4e00\u76f4\u7ebf\u3002'}
  ,{t:'Tumble \u8fde\u6d88',b:'\u4e2d\u5956\u7b26\u53f7\u6d88\u5931\uff0c\u4e0a\u65b9\u7b26\u53f7\u4e0b\u843d\uff0c\u9876\u90e8\u8865\u5145\u65b0\u7b26\u53f7\uff0c\u5faa\u73af\u76f4\u5230\u65e0\u4e2d\u5956\u3002'}
  ,{t:'Scatter \u89e6\u53d1',b:'3/4/5/6 \u4e2a\u68d2\u68d2\u7cd6\u5206\u522b\u89e6\u53d1 10/12/15/20 \u6b21\u514d\u8d39\u65cb\u8f6c\uff0c\u5e76\u989d\u5916\u6d3e\u5f69 2x/5x/20x/100x\u3002'}
  ,{t:'\u500d\u7387\u70b8\u5f39',b:'\u4ec5\u514d\u8d39\u65cb\u8f6c\u671f\u95f4\u51fa\u73b0\uff0c\u4f4d\u7f6e\u6807\u8bb0\u540e\u4e0b\u6b21\u4e2d\u5956 2x\uff0c\u518d\u6b21 4x\uff0c\u5c01\u9876 128x\u3002'}
  ,{t:'\u4e0b\u6ce8\u91d1\u989d',b:'0.20 / 0.50 / 1 / 2 / 5 / 10 / 20 / 50 / 100\uff0c\u5171 9 \u6863\u3002'}
  ,{t:'\u8bd5\u73a9\u6a21\u5f0f',b:'\u4f7f\u7528\u865a\u62df\u4f59\u989d\uff0c\u4ec5\u4f9b\u4f53\u9a8c\u73a9\u6cd5\u4e0e\u89c4\u5219\uff0c\u4e0d\u6d89\u53ca\u771f\u5b9e\u8d44\u91d1\u3002'}
];
var HEADS=['\u7b26\u53f7','5','6','7','8','9','10','11','12'];
var PAY=[
  ['\u6a59\u8272\u8f6f\u7cd6\u718a','0.20','0.30','0.40','0.50','0.60','0.80','1.00','1.50'],
  ['\u7d2b\u8272\u8f6f\u7cd6\u718a','0.25','0.40','0.50','0.60','0.80','1.00','1.50','2.00'],
  ['\u7ea2\u8272\u8f6f\u7cd6\u718a','0.30','0.50','0.60','0.80','1.00','1.50','2.00','2.50'],
  ['\u7eff\u8272\u661f\u661f\u7cd6','0.40','0.60','0.80','1.00','1.50','2.00','2.50','3.00'],
  ['\u7d2b\u8272\u679c\u51bb\u8c46','0.50','1.00','1.50','2.00','3.00','5.00','10.0','15.0'],
  ['\u6a59\u8272\u7231\u5fc3\u7cd6','0.60','1.50','2.00','3.00','5.00','10.0','15.0','25.0'],
  ['\u7ea2\u8272\u7231\u5fc3\u7cd6','0.75','2.00','3.00','5.00','10.0','15.0','25.0','50.0'],
  ['\u7d2b\u8272\u5706\u5f62\u7cd6','1.00','3.00','5.00','10.0','15.0','25.0','50.0','100.0'],
  ['\u7c89\u8272\u5706\u5f62\u7cd6\u679c','2.00','5.00','10.0','25.0','50.0','100.0','250.0','500.0']
];
function buildSecs(){
  var f=document.createDocumentFragment();
  for(var i=0;i<SECS.length;i++){
    var h=document.createElement('h3');h.className='sr-sec-h';h.textContent=SECS[i].t;
    var p=document.createElement('p');p.className='sr-sec-p';p.textContent=SECS[i].b;
    f.appendChild(h);f.appendChild(p);
  }
  return f;
}
function buildPay(){
  var f=document.createDocumentFragment();
  var h=document.createElement('h3');h.className='sr-sec-h';h.textContent='\u8d54\u7387\u8868';f.appendChild(h);
  var wrap=document.createElement('div');wrap.className='sr-pay-wrap';
  var tb=document.createElement('table');tb.className='sr-pay-table sr-pay-table--wide';
  var hr=document.createElement('tr');
  for(var i=0;i<HEADS.length;i++){var th=document.createElement('th');th.textContent=HEADS[i];hr.appendChild(th);}
  tb.appendChild(hr);
  for(var r=0;r<PAY.length;r++){
    var tr=document.createElement('tr');
    var t0=document.createElement('td');t0.className='sr-pay-name';t0.textContent=PAY[r][0];tr.appendChild(t0);
    for(var c=1;c<PAY[r].length;c++){var td=document.createElement('td');td.textContent=PAY[r][c]+'\u00d7';tr.appendChild(td);}
    tb.appendChild(tr);
  }
  wrap.appendChild(tb);f.appendChild(wrap);
  return f;
}
function ensure(){
  if(root)return true;
  root=document.createElement('div');root.className='sr-sheet-root';root.hidden=true;
  var bd=document.createElement('div');bd.className='sr-sheet-backdrop';
  var sh=document.createElement('div');sh.className='sr-sheet';sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');
  var hd=document.createElement('div');hd.className='sr-sheet-handle';
  var hh=document.createElement('header');hh.className='sr-sheet-header';
  var tt=document.createElement('h2');tt.className='sr-sheet-title';tt.textContent='\u6e38\u620f\u89c4\u5219';hh.appendChild(tt);
  body=document.createElement('div');body.className='sr-sheet-nav sr-rules-fade';
  sh.appendChild(hd);sh.appendChild(hh);sh.appendChild(body);
  root.appendChild(bd);root.appendChild(sh);
  (document.getElementById('sr-app')||document.body).appendChild(root);
  bd.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!root.hidden)close();});
  return true;
}
function open(){
  if(!ensure())return;
  body.innerHTML='';body.appendChild(buildSecs());body.appendChild(buildPay());
  root.hidden=false;void root.offsetWidth;root.classList.add('is-open');
}
function close(){
  if(root.hidden)return;
  root.classList.remove('is-open');
  setTimeout(function(){root.hidden=true;},300);
}
window.ApexSRRules=Object.freeze({open:open,close:close,isOpen:function(){return root&&!root.hidden;}});
})();
