(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var stage = qs('[data-hero]');
    if (!stage) {
      return;
    }
    var slides = qsa('[data-hero-slide]', stage);
    var dots = qsa('[data-hero-dot]', stage);
    var prev = qs('[data-hero-prev]', stage);
    var next = qs('[data-hero-next]', stage);
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var list = qs('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var keywordInput = qs('[data-filter-keyword]', panel);
    var yearSelect = qs('[data-filter-year]', panel);
    var genreSelect = qs('[data-filter-genre]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var resetButton = qs('[data-filter-reset]', panel);
    var countNode = qs('[data-filter-count]', panel);
    var items = qsa('.movie-card, .rank-table-row', list);
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    function itemMatches(item) {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-region'),
        item.getAttribute('data-type'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-tags')
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (year && normalize(item.getAttribute('data-year')) !== year) {
        return false;
      }
      if (genre && normalize(item.getAttribute('data-genre')).indexOf(genre) === -1) {
        return false;
      }
      if (type && normalize(item.getAttribute('data-type')).indexOf(type) === -1) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      var visible = 0;
      items.forEach(function (item) {
        var matched = itemMatches(item);
        item.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = '共 ' + visible + ' 部';
      }
    }

    [keywordInput, yearSelect, genreSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (genreSelect) {
          genreSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function attachHls(video, source) {
    if (!source) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  function initPlayers() {
    qsa('.player-frame').forEach(function (frame) {
      var video = qs('video.hls-player', frame);
      var cover = qs('.player-cover', frame);
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      attachHls(video, source);

      function playVideo() {
        if (cover) {
          cover.classList.add('hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            video.controls = true;
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', playVideo);
      }
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
