(function(){
'use strict';
/* Apex Games Registry.
 * Single source of truth for the game catalog.
 * To add a new game: edit THIS file only.
 * apex-app.js reads from here and never hardcodes game ids.
 *
 * Entry shape:
 *   id       required, unique, [a-z0-9-]+
 *   n        required, display name (escaped Unicode OK)
 *   src      required, cover image path
 *   live     optional bool, true = clickable, opens per entry
 *   entry    optional, one of 'modal' (default) | 'page'
 *            - modal: opens ApexSweetModal with brand+subtitle+url
 *            - page:  navigates directly to url
 *            - absent: treated as 'modal'
 *   brand    optional, data-brand token passed to modal (e.g. 'sweet')
 *   subtitle optional, modal subtitle override
 *   url      optional, redirect target; when entry='page' it is required,
 *            when entry='modal' it overrides the modal's default target
 *
 * Invariants (checked by validate() below):
 *   - all ids unique
 *   - entry in {undefined,'modal','page'}
 *   - entry==='page' implies typeof url === 'string' && url.length > 0
 *
 * Consumer status (audit round-check of files 1-10):
 *   GAMES    read by apex-app.js renderCatContent
 *   getById  read by apex-app.js on card click
 *   validate TEST-ONLY: exercised by tests/config/games-registry.test.cjs;
 *            not invoked at boot. Kept as a forward-compatible guard
 *            for any future runtime that builds a catalog adapter.
 */
var GAMES = Object.freeze([
  {id:"olympus", n:"\u5965\u6797\u5339\u65af", src:"/assets/games/olympus.webp", live:true, waijaId:"waija-pragmaticslots/gates-of-olympus"},
  {id:"sweet", n:"\u7cd6\u679c\u8fde\u8fde\u7206", src:"/assets/games/sweet.webp", live:true, entry:"modal", brand:"sweet", subtitle:"\u9009\u62E9\u6E38\u620F\u6A21\u5F0F"},
  {id:"sugar-rush", n:"\u751c\u871c\u7206\u5956", src:"/assets/games/sugar.webp", live:true, entry:"modal", brand:"sugar-rush", subtitle:"\u9009\u62E9\u6E38\u620F\u6A21\u5F0F", url:"/sugar-rush.html"},
  {id:"bass", n:"\u5de8\u578b\u9c88\u9c7c", src:"/assets/games/bass.webp"},
  {id:"dog", n:"\u72d7\u72d7\u4e4b\u5bb6", src:"/assets/games/dog.webp"},
  {id:"book", n:"\u6b7b\u4ea1\u4e4b\u4e66", src:"/assets/games/book.webp"},
  {id:"starburst", n:"\u661f\u7206", src:"/assets/games/starburst.webp"},
  {id:"gonzo", n:"\u521a\u679c\u63a2\u9669", src:"/assets/games/gonzo.webp"},
  {id:"buffalo", n:"\u6c34\u725b\u4e4b\u738b", src:"/assets/games/buffalo.webp"},
  {id:"wolf", n:"\u72fc\u9ec4\u91d1", src:"/assets/games/wolf.webp"},
  {id:"fruit", n:"\u6c34\u679c\u6d3e\u5bf9", src:"/assets/games/fruit.webp"},
  {id:"megaways", n:"\u5927\u5bcc\u7fc1", src:"/assets/games/megaways.webp"},
]);

function getById(id){
  for (var i = 0; i < GAMES.length; i++){ if (GAMES[i].id === id) return GAMES[i]; }
  return null;
}

function validate(){
  var seen = Object.create(null);
  for (var i = 0; i < GAMES.length; i++){
    var g = GAMES[i];
    if (!g || typeof g.id !== 'string' || !/^[a-z0-9-]+$/.test(g.id)){
      throw new Error('GAMES_REGISTRY: invalid id at ' + i);
    }
    if (seen[g.id]) throw new Error('GAMES_REGISTRY: duplicate id ' + g.id);
    seen[g.id] = 1;
    if (typeof g.n !== 'string' || !g.n) throw new Error('GAMES_REGISTRY: missing n for ' + g.id);
    if (typeof g.src !== 'string' || !g.src) throw new Error('GAMES_REGISTRY: missing src for ' + g.id);
    if (g.entry != null && g.entry !== 'modal' && g.entry !== 'page'){
      throw new Error('GAMES_REGISTRY: invalid entry for ' + g.id + ': ' + g.entry);
    }
    if (g.entry === 'page' && (typeof g.url !== 'string' || !g.url)){
      throw new Error('GAMES_REGISTRY: entry=page requires url for ' + g.id);
    }
  }
  return true;
}

window.ApexGamesRegistry = Object.freeze({
  GAMES: GAMES,
  getById: getById,
  validate: validate
});
})();
