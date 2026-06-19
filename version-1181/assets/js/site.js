(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initImages() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-blank');
      }, { once: true });
    });
  }

  function initMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var thumbs = qsa('[data-hero-thumb]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle('is-active', idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + item.url + '" aria-label="观看' + item.title + '">',
      '    <img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
      '    <span class="poster-shine"></span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-tags"><span>' + item.year + ' 年</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
      '    <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
      '    <p>' + item.description + '</p>',
      '    <div class="card-meta"><span>' + item.rating + ' 分</span><span>' + item.views + ' 次</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    var title = qs('[data-search-title]');
    var input = qs('[data-search-input]');
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      initImages();
      return;
    }
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (item) {
      var haystack = item.search.toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (title) {
      title.textContent = '搜索结果：' + query + '（' + matched.length + '）';
    }
    if (matched.length) {
      results.innerHTML = matched.map(cardTemplate).join('');
    } else {
      results.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更短的片名、地区、年份或类型关键词。</p></div>';
    }
    initImages();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video[data-stream]', player);
      var buttons = qsa('[data-player-start]', player);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hls = null;
      var ready = false;

      function attachStream(done) {
        if (ready) {
          done();
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, done);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              }
            }
          });
          return;
        }
        video.src = stream;
        done();
      }

      function playVideo() {
        attachStream(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
          player.classList.add('is-playing');
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', playVideo);
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImages();
    initMobileNav();
    initHero();
    initSearchPage();
    initPlayers();
  });
})();
