(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroSliders() {
    $all('[data-hero-slider]').forEach(function (slider) {
      var slides = $all('[data-hero-slide]', slider);
      var dots = $all('[data-hero-dot]', slider);
      var current = 0;
      var timer = null;

      if (slides.length <= 1) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function initFilters() {
    $all('[data-filter-root]').forEach(function (root) {
      var cards = $all('[data-card]', root);
      var grid = $('[data-card-grid]', root);
      var input = $('[data-filter-input]', root);
      var yearSelect = $('[data-filter-year]', root);
      var categorySelect = $('[data-filter-category]', root);
      var sortSelect = $('[data-sort-select]', root);
      var countNode = $('[data-result-count]', root);
      var emptyState = $('[data-empty-state]', root);
      var readQuery = root.getAttribute('data-read-query');

      if (readQuery && input) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get(readQuery);
        if (value) {
          input.value = value;
        }
      }

      function matches(card) {
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var category = categorySelect ? categorySelect.value : '';
        var text = normalize(card.getAttribute('data-search'));
        var title = normalize(card.getAttribute('data-title'));
        var cardYear = card.getAttribute('data-year');
        var cardCategory = card.getAttribute('data-category');
        var keywordOk = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        var yearOk = !year || cardYear === year;
        var categoryOk = !category || cardCategory === category;
        return keywordOk && yearOk && categoryOk;
      }

      function sortCards() {
        if (!grid || !sortSelect) {
          return;
        }

        var mode = sortSelect.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'title') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
          }

          if (mode === 'year') {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          }

          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        });

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      [input, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (sortSelect) {
        sortSelect.addEventListener('change', function () {
          sortCards();
          apply();
        });
      }

      sortCards();
      apply();
    });
  }

  function initScrollToPlayer() {
    $all('[data-scroll-player]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        var player = $('[data-player]');
        if (player) {
          event.preventDefault();
          player.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSliders();
    initFilters();
    initScrollToPlayer();
  });
})();
