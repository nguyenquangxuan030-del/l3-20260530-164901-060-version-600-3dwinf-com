(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var hero = document.querySelector(".hero");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector(".hero-control.prev");
        var next = hero.querySelector(".hero-control.next");
        var current = 0;

        var show = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));

    filterForms.forEach(function (form) {
        var input = form.querySelector("input");
        var scopeSelector = form.getAttribute("data-scope") || ".movie-card";
        var cards = Array.prototype.slice.call(document.querySelectorAll(scopeSelector));

        var filter = function () {
            var keyword = (input.value || "").trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
            });
        };

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            filter();
        });

        if (input) {
            input.addEventListener("input", filter);
        }
    });

    var searchPage = document.getElementById("searchResults");

    if (searchPage && window.SITE_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = document.getElementById("searchPageInput");
        var title = document.getElementById("searchPageTitle");

        if (input) {
            input.value = query;
        }

        if (title && query) {
            title.textContent = "搜索：" + query;
        }

        var render = function (items) {
            if (!items.length) {
                searchPage.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试其他关键词。</div>';
                return;
            }

            searchPage.innerHTML = items.slice(0, 120).map(function (movie) {
                return [
                    '<article class="movie-card" data-search="' + escapeHtml(movie.title + " " + movie.region + " " + movie.genre + " " + movie.type) + '">',
                    '<a class="movie-card-link" href="' + movie.href + '">',
                    '<figure class="movie-poster">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '<figcaption>' + escapeHtml(movie.type) + '</figcaption>',
                    '</figure>',
                    '<div class="movie-card-body">',
                    '<div class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
                    '<h3>' + escapeHtml(movie.title) + '</h3>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
                    '</div>',
                    '</a>',
                    '</article>'
                ].join("");
            }).join("");
        };

        var runSearch = function (keyword) {
            var normalized = (keyword || "").trim().toLowerCase();

            if (!normalized) {
                render(window.SITE_MOVIES.slice(0, 48));
                return;
            }

            render(window.SITE_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags].join(" ").toLowerCase();
                return text.indexOf(normalized) !== -1;
            }));
        };

        var pageForm = document.getElementById("searchPageForm");

        if (pageForm && input) {
            pageForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var keyword = input.value.trim();
                var newUrl = keyword ? "search.html?q=" + encodeURIComponent(keyword) : "search.html";
                history.replaceState(null, "", newUrl);
                if (title) {
                    title.textContent = keyword ? "搜索：" + keyword : "影片搜索";
                }
                runSearch(keyword);
            });
        }

        runSearch(query);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
