(function(){
  "use strict";

  const root=document.querySelector(".apx-home-v2");
  if(!root)return;

  const search=root.querySelector(".apx-v2-search");
  const heroBtn=root.querySelector(".apx-v2-hero button");
  const bottom=root.querySelector(".apx-v2-bottom");
  const menu=root.querySelector(".apx-v2-menu");

  if(search){
    search.setAttribute("role","search");
    search.addEventListener("click",function(){
      const q=prompt("搜索游戏 / 玩法");
      if(q) search.textContent="搜索：" + q;
    });
  }

  if(heroBtn){
    heroBtn.addEventListener("click",function(){
      const target=root.querySelector(".apx-v2-section");
      if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
    });
  }

  if(bottom){
    bottom.querySelectorAll("span").forEach(function(item){
      item.addEventListener("click",function(){
        bottom.querySelectorAll("span").forEach(x=>x.classList.remove("active"));
        item.classList.add("active");
      });
    });
  }

  if(menu){
    menu.addEventListener("click",function(){
      root.classList.toggle("menu-open");
    });
  }
})();
