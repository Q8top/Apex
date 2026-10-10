(function(){
'use strict';
/* Apex Games Registry.
 * Single source of truth for the game catalog.
 * To add a new game: edit THIS file only.
 * apex-app.js reads from here and never hardcodes game ids.
 */
var GAMES = [
  {id:"olympus", n:"\u5965\u6797\u5339\u65af", src:"/assets/games/olympus.webp"},
  {id:"sweet", n:"\u7cd6\u679c\u8fde\u8fde\u7206", src:"/assets/games/sweet.webp", live:true, entry:"modal"},
  {id:"sugar-rush", n:"\u751c\u871c\u7206\u5956", src:"/assets/games/sugar.webp", live:true, entry:"page", url:"/sugar-rush.html"},
  {id:"bass", n:"\u5de8\u578b\u9c88\u9c7c", src:"/assets/games/bass.webp"},
  {id:"dog", n:"\u72d7\u72d7\u4e4b\u5bb6", src:"/assets/games/dog.webp"},
  {id:"book", n:"\u6b7b\u4ea1\u4e4b\u4e66", src:"/assets/games/book.webp"},
  {id:"starburst", n:"\u661f\u7206", src:"/assets/games/starburst.webp"},
  {id:"gonzo", n:"\u521a\u679c\u63a2\u9669", src:"/assets/games/gonzo.webp"},
  {id:"buffalo", n:"\u6c34\u725b\u4e4b\u738b", src:"/assets/games/buffalo.webp"},
  {id:"wolf", n:"\u72fc\u9ec4\u91d1", src:"/assets/games/wolf.webp"},
  {id:"fruit", n:"\u6c34\u679c\u6d3e\u5bf9", src:"/assets/games/fruit.webp"},
  {id:"megaways", n:"\u5927\u5bcc\u7fc1", src:"/assets/games/megaways.webp"},
];

function getById(id){
  for (var i = 0; i < GAMES.length; i++){ if (GAMES[i].id === id) return GAMES[i]; }
  return null;
}

window.ApexGamesRegistry = Object.freeze({
  GAMES: GAMES,
  getById: getById
});
})();
