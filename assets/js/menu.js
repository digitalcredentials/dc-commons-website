/* Digital Credentials Commons: the header menu, shared by every page */
/* Phones: the "Menu" button shows the section links under the header. */
(function(){
  var btn = document.getElementById("menuBtn"), menu = document.getElementById("mobileMenu");
  function set(open){ menu.hidden = !open; btn.setAttribute("aria-expanded", open); btn.textContent = open ? "Close" : "Menu"; }
  btn.addEventListener("click", function(){ set(menu.hidden); });
  menu.addEventListener("click", function(e){ if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
  document.addEventListener("click", function(e){ if (!menu.hidden && !e.target.closest("#mobileMenu, #menuBtn")) set(false); });
  var wide = window.matchMedia("(max-width: 960px)"), onWide = function(m){ if (!m.matches) set(false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide); else wide.addListener(onWide);
})();
