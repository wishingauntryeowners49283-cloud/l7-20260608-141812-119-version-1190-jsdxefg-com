(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('.hero-carousel');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('.filter-panel');
  if (filterPanel) {
    var scope = document.querySelector('.filter-scope');
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .wide-card')) : [];
    var searchInput = filterPanel.querySelector('.movie-search');
    var typeFilter = filterPanel.querySelector('.type-filter');
    var yearFilter = filterPanel.querySelector('.year-filter');
    var sortFilter = filterPanel.querySelector('.sort-filter');

    function matchYear(cardYear, filterYear) {
      if (!filterYear) {
        return true;
      }
      var parsed = parseInt(cardYear, 10) || 0;
      if (filterYear === 'older') {
        return parsed <= 2021;
      }
      return String(cardYear).indexOf(filterYear) !== -1;
    }

    function matchType(cardType, filterType) {
      if (!filterType) {
        return true;
      }
      if (filterType === '剧集') {
        return cardType.indexOf('剧') !== -1 || cardType.indexOf('电视剧') !== -1;
      }
      if (filterType === '纪录') {
        return cardType.indexOf('纪录') !== -1;
      }
      return cardType.indexOf(filterType) !== -1;
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var yearValue = yearFilter ? yearFilter.value : '';

      cards.forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var visible = (!keyword || searchText.indexOf(keyword) !== -1) && matchType(cardType, typeValue) && matchYear(cardYear, yearValue);
        card.classList.toggle('hidden', !visible);
      });
    }

    function applySort() {
      if (!scope || !sortFilter) {
        return;
      }
      var value = sortFilter.value;
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
        });
      } else if (value === 'year-asc') {
        sorted.sort(function (a, b) {
          return (parseInt(a.getAttribute('data-year'), 10) || 0) - (parseInt(b.getAttribute('data-year'), 10) || 0);
        });
      } else if (value === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        scope.appendChild(card);
      });
      applyFilters();
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortFilter) {
      sortFilter.addEventListener('change', applySort);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var layer = shell.querySelector('.player-layer');
    if (!video || !layer) {
      return;
    }

    var source = video.getAttribute('data-video-url');
    var attached = false;
    var hlsInstance = null;

    function attachMedia() {
      if (attached || !source) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachMedia();
      shell.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    layer.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        shell.classList.remove('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
