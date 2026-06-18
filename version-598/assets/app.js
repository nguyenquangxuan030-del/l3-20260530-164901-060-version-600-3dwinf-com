(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        } else {
          window.location.href = "./search.html";
        }
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var setSlide = function (next) {
        if (!slides.length) {
          return;
        }
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          slide.classList.toggle("is-active", index === current);
        });
        dots.forEach(function (dot, index) {
          dot.classList.toggle("is-active", index === current);
        });
      };
      var restart = function () {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          setSlide(current + 1);
        }, 5200);
      };
      hero.querySelectorAll("[data-hero-prev]").forEach(function (button) {
        button.addEventListener("click", function () {
          setSlide(current - 1);
          restart();
        });
      });
      hero.querySelectorAll("[data-hero-next]").forEach(function (button) {
        button.addEventListener("click", function () {
          setSlide(current + 1);
          restart();
        });
      });
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setSlide(index);
          restart();
        });
      });
      setSlide(0);
      restart();
    }

    var pageFilter = document.querySelector("[data-page-filter]");
    if (pageFilter) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      pageFilter.addEventListener("input", function () {
        var query = normalize(pageFilter.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          card.style.display = text.indexOf(query) !== -1 ? "" : "none";
        });
      });
    }

    var results = document.querySelector("[data-search-results]");
    if (results && Array.isArray(window.SEARCH_MOVIES)) {
      var params = new URLSearchParams(window.location.search);
      var query = normalize(params.get("q"));
      var source = window.SEARCH_MOVIES;
      var filtered = query ? source.filter(function (item) {
        return normalize([item.title, item.region, item.type, item.genre, item.tags, item.oneLine, item.category].join(" ")).indexOf(query) !== -1;
      }) : source.slice(0, 60);
      var summary = document.querySelector("[data-search-summary]");
      if (summary) {
        summary.textContent = query ? "根据关键词筛选出的影片" : "热门影片推荐";
      }
      results.innerHTML = filtered.slice(0, 120).map(function (item) {
        return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
          '<div class="poster-wrap"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="card-badge">' + escapeHtml(item.year) + '</span></div>' +
          '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3>' +
          '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p></div></a>';
      }).join("");
      if (!filtered.length) {
        results.innerHTML = '<div class="filter-panel"><h2>未找到相关内容</h2><p>换一个关键词继续探索。</p></div>';
      }
    }
  });
})();
