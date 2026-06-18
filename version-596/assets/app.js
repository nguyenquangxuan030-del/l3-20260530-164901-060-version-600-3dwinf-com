(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var playerShell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('video[data-player]');
  var playButton = document.querySelector('[data-play-button]');

  function bindAndPlay() {
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (!video.getAttribute('data-bound')) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        window.__movieHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        window.__movieHls.loadSource(source);
        window.__movieHls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-bound', 'true');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          if (playerShell) {
            playerShell.classList.add('is-playing');
          }
        })
        .catch(function () {
          if (playerShell) {
            playerShell.classList.remove('is-playing');
          }
        });
    }
  }

  if (playButton) {
    playButton.addEventListener('click', bindAndPlay);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (playerShell) {
        playerShell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (playerShell) {
        playerShell.classList.remove('is-playing');
      }
    });
  }

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchSummary = document.getElementById('search-summary');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function imageForId(id) {
    return ((Number(id) - 1) % 150) + 1 + '.jpg';
  }

  function renderSearch(query) {
    if (!searchResults || !window.MOVIE_INDEX) {
      return;
    }

    var keyword = String(query || '').trim().toLowerCase();

    if (!keyword) {
      searchResults.innerHTML = '';
      if (searchSummary) {
        searchSummary.textContent = '输入关键词后显示匹配内容。';
      }
      return;
    }

    var matched = window.MOVIE_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) !== -1;
    }).slice(0, 80);

    if (searchSummary) {
      searchSummary.textContent = matched.length ? '已显示匹配内容。' : '没有找到匹配内容。';
    }

    searchResults.innerHTML = matched.map(function (movie) {
      var title = escapeHtml(movie.title);
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + title + '">' +
        '<span class="poster-frame">' +
        '<img src="' + imageForId(movie.id) + '" alt="' + title + '" loading="lazy">' +
        '<span class="poster-glow"></span>' +
        '<span class="card-badge">' + escapeHtml(movie.year) + '</span>' +
        '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + title + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
        '<div class="mini-tags"><span>' + escapeHtml(movie.genre || '精选') + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    renderSearch(initialQuery);

    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
})();
