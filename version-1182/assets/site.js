(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var cardFilter = document.querySelector('[data-card-filter]');
  var cardSort = document.querySelector('[data-card-sort]');
  var cardList = document.querySelector('[data-card-list]');

  function filterCards() {
    if (!cardList) {
      return;
    }

    var keyword = cardFilter ? cardFilter.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();

      card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
    });
  }

  function sortCards() {
    if (!cardList || !cardSort) {
      return;
    }

    var value = cardSort.value;
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

    if (value === 'rating') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
      });
    }

    if (value === 'views') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
      });
    }

    if (value === 'year') {
      cards.sort(function (a, b) {
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
    }

    if (value !== 'default') {
      cards.forEach(function (card) {
        cardList.appendChild(card);
      });
    }
  }

  if (cardFilter) {
    cardFilter.addEventListener('input', filterCards);
  }

  if (cardSort) {
    cardSort.addEventListener('change', function () {
      sortCards();
      filterCards();
    });
  }

  var rankTabs = Array.prototype.slice.call(document.querySelectorAll('[data-rank-tab]'));
  var rankPanels = Array.prototype.slice.call(document.querySelectorAll('[data-rank-panel]'));

  rankTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-rank-tab');
      rankTabs.forEach(function (item) {
        item.classList.toggle('is-active', item === tab);
      });
      rankPanels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-rank-panel') === name);
      });
    });
  });

  function createSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-category" href="category-' + movie.categorySlug + '.html">' + escapeHtml(movie.categoryName) + '</a>',
      '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>评分 ' + escapeHtml(movie.rating) + '</span></div>',
      '<div class="tag-line">' + escapeHtml(movie.tags.slice(0, 3).join(' ')) + '</div>',
      '</div>',
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

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchTitle = document.querySelector('[data-search-title]');

  if (searchResults && Array.isArray(window.SITE_MOVIE_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.trim().toLowerCase();
    var results = [];

    if (normalized) {
      results = window.SITE_MOVIE_INDEX.filter(function (movie) {
        return [
          movie.title,
          movie.description,
          movie.categoryName,
          movie.region,
          movie.type,
          movie.genre,
          movie.year,
          movie.tags.join(' ')
        ].join(' ').toLowerCase().indexOf(normalized) !== -1;
      }).slice(0, 96);
    }

    if (searchTitle) {
      searchTitle.textContent = normalized ? '与“' + query + '”相关的影片' : '请输入关键词开始搜索';
    }

    searchResults.innerHTML = results.length ? results.map(createSearchCard).join('') : '';
  }

  function attachMoviePlayer() {
    var video = document.querySelector('.movie-video');
    var button = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-hls');
    var wrap = video.closest('.video-wrap');
    var hlsInstance = null;

    if (src) {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    }

    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    video.addEventListener('play', function () {
      if (wrap) {
        wrap.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (wrap) {
        wrap.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      if (wrap) {
        wrap.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', togglePlay);

    if (button) {
      button.addEventListener('click', togglePlay);
    }
  }

  attachMoviePlayer();
})();
