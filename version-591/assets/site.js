(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var homeSearch = document.querySelector("[data-home-search]");
    if (homeSearch) {
      homeSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = homeSearch.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var setHero = function (next) {
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
      var start = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          setHero(current + 1);
        }, 5600);
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          setHero(index);
          start();
        });
      });
      start();
    }

    var controls = document.querySelector("[data-filter-controls]");
    var list = document.querySelector("[data-filter-list]");
    if (controls && list) {
      var search = controls.querySelector(".js-card-search");
      var year = controls.querySelector(".js-year-filter");
      var category = controls.querySelector(".js-category-filter");
      var empty = document.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) {
        search.value = params.get("q");
      }
      var apply = function () {
        var query = search ? search.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var categoryValue = category ? category.value : "";
        var shown = 0;
        Array.prototype.slice.call(list.querySelectorAll(".movie-item")).forEach(function (item) {
          var text = item.getAttribute("data-filter") || "";
          var itemYear = item.getAttribute("data-year") || "";
          var itemCategory = item.getAttribute("data-category") || "";
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (yearValue && itemYear !== yearValue) {
            matched = false;
          }
          if (categoryValue && itemCategory !== categoryValue) {
            matched = false;
          }
          item.classList.toggle("is-hidden", !matched);
          if (matched) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      };
      [search, year, category].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });
      apply();
    }
  });

  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var playerShell = document.getElementById("playerShell");
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    var attach = function () {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute("data-ready", "1");
    };

    var play = function () {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    if (playerShell) {
      playerShell.addEventListener("click", function (event) {
        if (event.target === overlay || event.target.closest(".play-overlay")) {
          return;
        }
        if (video.getAttribute("data-ready") !== "1") {
          play();
        }
      });
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
