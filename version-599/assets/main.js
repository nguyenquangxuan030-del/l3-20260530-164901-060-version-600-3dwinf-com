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
      .replace(/'/g, "&#039;");
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-poster\" href=\"" + item.url + "\" aria-label=\"观看 " + escapeHtml(item.title) + "\">",
      "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span><span class=\"poster-play\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<a class=\"movie-title\" href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a>",
      "<p class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>",
      "<p class=\"movie-line\">" + escapeHtml(item.oneLine) + "</p>",
      "<div class=\"tag-list\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    var headerSearch = document.querySelector(".header-search");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        if (headerSearch) {
          headerSearch.classList.toggle("is-open");
        }
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      });
    });

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;
      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      }
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      start();
    }

    var localFilter = document.querySelector("[data-local-filter]");
    if (localFilter) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      localFilter.addEventListener("input", function () {
        var value = localFilter.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
          card.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
        });
      });
    }

    var searchResults = document.getElementById("search-results");
    if (searchResults && Array.isArray(window.SEARCH_MOVIES)) {
      var query = getQuery().trim();
      var summary = document.getElementById("search-summary");
      var box = document.querySelector(".search-page-form input[name='q']");
      if (box) {
        box.value = query;
      }
      if (summary && query) {
        summary.textContent = "搜索关键词：“" + query + "”";
      }
      var normalized = query.toLowerCase();
      var items = window.SEARCH_MOVIES.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return !normalized || text.indexOf(normalized) !== -1;
      }).slice(0, 120);
      if (!items.length) {
        searchResults.innerHTML = "<p class=\"empty-state\">没有找到匹配影片，请尝试更换关键词。</p>";
      } else {
        searchResults.innerHTML = items.map(cardHtml).join("");
      }
    }
  });
})();
