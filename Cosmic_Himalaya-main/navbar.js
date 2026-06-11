/* =====================================================================
   COSMIC HIMALAYA — navbar.js
   Toggles the mobile menu. Your CSS opens it via `.nav-right.active`,
   so this adds/removes `.active` (NOT `.open`). Your <button class="menu">
   has no onclick, so this binds it by class — no HTML change needed.
   Add  <script src="navbar.js"></script>  before script.js.
   ===================================================================== */
(function () {
  function init() {
    var menuBtn = document.querySelector(".menu");
    var panel = document.querySelector(".nav-right");
    if (!menuBtn || !panel) return;

    // open / close
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.classList.toggle("active");
    });

    // close when a mobile link is tapped
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("active");
      });
    });

    // close when tapping outside the panel
    document.addEventListener("click", function (e) {
      if (
        panel.classList.contains("active") &&
        !panel.contains(e.target) &&
        !menuBtn.contains(e.target)
      ) {
        panel.classList.remove("active");
      }
    });

    // close if resized back to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100) panel.classList.remove("active");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();