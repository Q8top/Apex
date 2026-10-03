/* Apex · Symbol 材质表 v3 Final
   6 色独立材质 profile（不止换色：亮区色/深区色/饱和度都不同）
*/
(function(){
'use strict';

window.GameMaterials = {
  candy: {
    blue:   { gradId:'sw-blue',   base:'#4a9de0', topLight:'#e0f2ff', midLight:'#a8d8f8', deep:'#0a3a60', bottomDeep:'#062038', outline:'#062038', wrapper:'#3a85c8', wrapperLight:'#8ec8f0' },
    green:  { gradId:'sw-green',  base:'#4aa85a', topLight:'#d8f8e0', midLight:'#a0e8a8', deep:'#0a4a1a', bottomDeep:'#052810', outline:'#052810', wrapper:'#3a9048', wrapperLight:'#88d898' },
    purple: { gradId:'sw-purple', base:'#9a60c8', topLight:'#f0d8ff', midLight:'#d8b0f0', deep:'#3a1e58', bottomDeep:'#1e0e30', outline:'#1e0e30', wrapper:'#8050b0', wrapperLight:'#c8a0e0' },
    red:    { gradId:'sw-red',    base:'#e5484d', topLight:'#ffc8c8', midLight:'#ff8a90', deep:'#6a0e18', bottomDeep:'#3a0610', outline:'#3a0610', wrapper:'#c83040', wrapperLight:'#f08890' },
    orange: { gradId:'sw-orange', base:'#f08a3c', topLight:'#ffe0b8', midLight:'#ffb870', deep:'#7a3810', bottomDeep:'#4a1e08', outline:'#4a1e08', wrapper:'#d07030', wrapperLight:'#ffb878' },
    yellow: { gradId:'sw-yellow', base:'#f0c33e', topLight:'#fffcd8', midLight:'#fff0a0', deep:'#6a4812', bottomDeep:'#3e2808', outline:'#3e2808', wrapper:'#d0a030', wrapperLight:'#ffe878' }
  },
  fruit: {
    softShadow: 0.28,
    bananaOutline: '#5a3808',
    bananaTop: '#f8ecb0',
    grapeOutline: '#2a1450',
    watermelonOutline: '#0a3818',
    appleOutline: '#5a1018',
    plumOutline: '#2a0e40'
  },
  scatter: {
    softShadow: 0.32,
    outline: '#4a1448'
  }
};
})();
