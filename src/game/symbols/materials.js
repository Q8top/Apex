/* Apex · Symbol 材质表 v2
   每种糖果拥有独立全套色（base/light/shade/deep/outline/wrapper/wrapperLight）
   描边不再用死黑，改用主体色的深色版本
*/
(function(){
'use strict';

window.GameMaterials = {
  candy: {
    blue:   { base:'#4a9de0', light:'#b8e2ff', shade:'#205a90', deep:'#0f3a60', outline:'#0a2542', wrapper:'#3a85c8', wrapperLight:'#8ec8f0', gradId:'sw-blue' },
    green:  { base:'#4aa85a', light:'#b0e8b8', shade:'#1f6028', deep:'#0e3a18', outline:'#082410', wrapper:'#3a9048', wrapperLight:'#88d898', gradId:'sw-green' },
    purple: { base:'#9a60c8', light:'#d8b8f0', shade:'#5a3080', deep:'#3a1e58', outline:'#241238', wrapper:'#8050b0', wrapperLight:'#c8a0e0', gradId:'sw-purple' },
    red:    { base:'#e5484d', light:'#ffa8a8', shade:'#a01828', deep:'#6a0e18', outline:'#420810', wrapper:'#c83040', wrapperLight:'#f08890', gradId:'sw-red' },
    orange: { base:'#f08a3c', light:'#ffd0a0', shade:'#b85a1c', deep:'#7a3810', outline:'#4a2008', wrapper:'#d07030', wrapperLight:'#ffb878', gradId:'sw-orange' },
    yellow: { base:'#f0c33e', light:'#fff2a8', shade:'#a07020', deep:'#6a4812', outline:'#3e2a08', wrapper:'#d0a030', wrapperLight:'#ffe878', gradId:'sw-yellow' }
  },
  fruit: {
    softShadow: 0.26,
    outline: '#1a0e08',
    outlineW: 2.2,
    bananaOutline: '#5a3808',
    grapeOutline: '#2a1450',
    watermelonOutline: '#0a3818',
    appleOutline: '#5a1018',
    plumOutline: '#2a0e40'
  },
  scatter: {
    softShadow: 0.30,
    outline: '#4a1448',
    outlineW: 2.2
  }
};
})();
