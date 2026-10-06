/* Apex catalog artwork: the homepage intentionally keeps only the 12 supplied cover images. */
(function(){
  'use strict';
  var IMG={
    olympus:'/assets/games/olympus.webp',
    sweet:'/assets/games/sweet.webp',
    sugar:'/assets/games/sugar.webp',
    book:'/assets/games/book.webp',
    dog:'/assets/games/dog.webp',
    bass:'/assets/games/bass.webp',
    gonzo:'/assets/games/gonzo.webp',
    starburst:'/assets/games/starburst.webp',
    megaways:'/assets/games/megaways.webp',
    buffalo:'/assets/games/buffalo.webp',
    wolf:'/assets/games/wolf.webp',
    fruit:'/assets/games/fruit.webp'
  };
  function render(k){
    if(!IMG[k])return '';
    return '<span class="apex-game-img apex-game-img--'+k+'" aria-hidden="true"></span>';
  }
  window.ApexGameIcons={render:render,_keys:Object.keys(IMG)};
})();
