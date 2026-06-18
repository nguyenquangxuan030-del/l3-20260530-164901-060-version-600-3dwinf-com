(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobilePanel.classList.contains('is-open'));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                setSlide(active + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                restart();
            });
        });

        setSlide(0);
        start();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-filter-input]');
        const cards = Array.from(scope.querySelectorAll('[data-card]'));
        const chips = Array.from(scope.querySelectorAll('[data-filter-chip]'));
        let chipValue = '';

        function applyFilter() {
            const value = ((input && input.value) || '').trim().toLowerCase();
            const chip = chipValue.toLowerCase();

            cards.forEach(function (card) {
                const text = [card.dataset.title || '', card.dataset.keywords || '', card.textContent || ''].join(' ').toLowerCase();
                const matchedText = !value || text.indexOf(value) !== -1;
                const matchedChip = !chip || text.indexOf(chip) !== -1;
                card.classList.toggle('is-hidden-card', !(matchedText && matchedChip));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                const nextValue = chip.classList.contains('active') ? '' : chip.textContent.trim();
                chipValue = nextValue;
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip && Boolean(nextValue));
                });
                applyFilter();
            });
        });
    });

    const searchResults = document.querySelector('[data-search-results]');
    const searchBox = document.querySelector('[data-search-box]');
    const searchTitle = document.querySelector('[data-search-title]');

    if (searchResults && searchBox && Array.isArray(window.SITE_MOVIES)) {
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        searchBox.value = initialQuery;

        function cardTemplate(item) {
            return [
                '<article class="movie-card movie-card-compact">',
                '<a class="poster" href="./' + item.file + '">',
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                '<span class="poster-score">' + item.score + '</span>',
                '</a>',
                '<div class="card-body compact-body">',
                '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
                '<div class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function render(query) {
            const value = query.trim().toLowerCase();
            const pool = value
                ? window.SITE_MOVIES.filter(function (item) {
                    return item.search.indexOf(value) !== -1;
                })
                : window.SITE_MOVIES.slice(0, 24);
            const limited = pool.slice(0, 80);
            searchResults.innerHTML = limited.length
                ? limited.map(cardTemplate).join('')
                : '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更换片名、地区、年份、类型或标签。</p></div>';
            if (searchTitle) {
                searchTitle.textContent = value ? '搜索结果' : '精选影片';
            }
        }

        render(initialQuery);
        searchBox.addEventListener('input', function () {
            render(searchBox.value);
        });
    }
}());
