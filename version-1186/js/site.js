(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', navMenu.classList.contains('is-open'));
    });
  }

  var hero = document.getElementById('heroSlider');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var activeFilters = {};

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var queryInput = document.querySelector('[data-page-search]');
    var query = normalized(queryInput ? queryInput.value : '');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var searchable = [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].map(normalized).join(' ');
      var matchedQuery = !query || searchable.indexOf(query) !== -1;
      var matchedFilter = Object.keys(activeFilters).every(function (field) {
        return !activeFilters[field] || normalized(card.getAttribute('data-' + field)) === normalized(activeFilters[field]);
      });

      card.classList.toggle('is-hidden', !(matchedQuery && matchedFilter));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-page-search]')).forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var field = button.getAttribute('data-field');
      var value = button.getAttribute('data-value');
      var group = button.parentElement;

      if (field === 'all') {
        activeFilters = {};
      } else {
        activeFilters = {};
        activeFilters[field] = value;
      }

      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('[data-filter-button]')).forEach(function (item) {
          item.classList.remove('is-active');
        });
      }

      button.classList.add('is-active');
      applyFilters();
    });
  });
}());

function createStreamingPlayer(videoId, coverId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var started = false;

  if (!video) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function requestPlay() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  function attachSource() {
    if (started) {
      requestPlay();
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      requestPlay();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        requestPlay();
      });
      return;
    }

    video.src = sourceUrl;
    requestPlay();
  }

  function start() {
    hideCover();
    attachSource();
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-start]')).forEach(function (item) {
    item.addEventListener('click', start);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
