/* MosLab · Aesthetic particles (namespaced) */
(function () {
  function generate(containerId, count) {
    var el = document.getElementById(containerId);
    if (!el) return;
    for (var i = 0; i < (count || 30); i++) {
      var p = document.createElement('div');
      p.className = 'aes-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDuration = (10 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      var size = (1 + Math.random() * 2) + 'px';
      p.style.width = size;
      p.style.height = size;
      el.appendChild(p);
    }
  }
  function init() {
    document.querySelectorAll('.aes-particles').forEach(function (el) {
      if (!el.id) el.id = 'aes-particles-' + Math.random().toString(36).slice(2, 8);
      if (el.dataset.aesInit) return;
      el.dataset.aesInit = '1';
      generate(el.id, 30);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
