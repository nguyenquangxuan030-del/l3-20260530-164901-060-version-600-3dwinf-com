(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var filterPanels = document.querySelectorAll('[data-filter-panel]');

    filterPanels.forEach(function (panelNode) {
      var scope = panelNode.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var searchInput = panelNode.querySelector('[data-search-input]');
      var typeFilter = panelNode.querySelector('[data-type-filter]');
      var regionFilter = panelNode.querySelector('[data-region-filter]');
      var emptyState = scope.querySelector('[data-empty-state]');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function cardText(card) {
        return [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
      }

      function applyFilters() {
        var keyword = normalize(searchInput ? searchInput.value : '');
        var type = normalize(typeFilter ? typeFilter.value : '');
        var region = normalize(regionFilter ? regionFilter.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = cardText(card);
          var cardType = normalize(card.dataset.type);
          var cardRegion = normalize(card.dataset.region);
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchType = !type || cardType.indexOf(type) !== -1;
          var matchRegion = !region || cardRegion.indexOf(region) !== -1;
          var show = matchKeyword && matchType && matchRegion;

          card.style.display = show ? '' : 'none';

          if (show) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('is-visible', visible === 0);
        }
      }

      [searchInput, typeFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });
    });
  });
}());
