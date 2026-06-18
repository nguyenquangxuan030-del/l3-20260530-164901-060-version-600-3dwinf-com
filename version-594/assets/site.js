(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('.menu-toggle');
  var mobilePanel = $('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.hasAttribute('hidden');
      if (opened) {
        mobilePanel.removeAttribute('hidden');
      } else {
        mobilePanel.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var hero = $('[data-hero]');

  if (hero) {
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      timer = window.setInterval(next, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    var prevButton = $('.hero-prev', hero);
    var nextButton = $('.hero-next', hero);

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    start();
  }

  $all('[data-filter-toolbar]').forEach(function (toolbar) {
    var section = toolbar.closest('.content-section') || document;
    var list = $('[data-filter-list]', section);
    var keywordInput = $('[data-filter-keyword]', toolbar);
    var yearSelect = $('[data-filter-year]', toolbar);
    var typeSelect = $('[data-filter-type]', toolbar);

    if (!list) {
      return;
    }

    var items = $all('[data-title]', list);

    function applyFilter() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var type = typeSelect && typeSelect.value || '';

      items.forEach(function (item) {
        var searchable = [
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-type'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var yearMatch = !year || item.getAttribute('data-year') === year;
        var typeMatch = !type || item.getAttribute('data-type') === type;
        var keywordMatch = !keyword || searchable.indexOf(keyword) !== -1;
        item.hidden = !(yearMatch && typeMatch && keywordMatch);
      });
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var searchResults = $('[data-search-results]');
  var searchTitle = $('[data-search-title]');

  if (searchResults && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = $('#search-input');

    if (input) {
      input.value = query;
    }

    function card(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '    <img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="card-content">',
        '    <div class="card-meta"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.summary) + '</p>',
        '    <div class="card-tags"><span>' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    if (query) {
      var lowered = query.toLowerCase();
      var matches = window.SEARCH_DATA.filter(function (item) {
        return [item.title, item.year, item.type, item.region, item.genre, item.summary].join(' ').toLowerCase().indexOf(lowered) !== -1;
      }).slice(0, 120);

      searchTitle.innerHTML = '<h2>搜索结果</h2><p>关键词：“' + escapeHtml(query) + '”</p>';
      searchResults.innerHTML = matches.length ? matches.map(card).join('') : '<p class="empty-state">暂无匹配内容</p>';
    } else {
      searchResults.innerHTML = window.SEARCH_DATA.slice(0, 24).map(card).join('');
    }
  }
})();
