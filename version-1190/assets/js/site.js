(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.getElementById("mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function setActive(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle("active", i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          setActive(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setActive(i);
          start();
        });
      });

      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener("mouseenter", function () {
          setActive(i);
          stop();
        });
        thumb.addEventListener("mouseleave", start);
      });

      if (prev) {
        prev.addEventListener("click", function () {
          setActive(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setActive(index + 1);
          start();
        });
      }

      setActive(0);
      start();
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var root = panel.closest("main") || document;
      var input = panel.querySelector("[data-filter-input]");
      var yearSelect = panel.querySelector("[data-year-select]");
      var regionSelect = panel.querySelector("[data-region-select]");
      var clearButton = panel.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(root.querySelectorAll(".js-movie-card"));
      var empty = root.querySelector("[data-no-results]");

      function apply() {
        var query = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (year && normalize(card.dataset.year) !== year) {
            ok = false;
          }
          if (region && normalize(card.dataset.region) !== region) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          apply();
        });
      }
      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var loaded = false;
      var hls = null;

      function loadVideo() {
        if (!video || loaded) {
          return;
        }
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function play() {
        loadVideo();
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        play();
      });

      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove("is-playing");
          }
        });
        video.addEventListener("ended", function () {
          player.classList.remove("is-playing");
        });
      }
    });

    if (window.MOVIE_INDEX) {
      var searchInput = document.getElementById("global-search-input");
      var results = document.getElementById("global-search-results");
      var empty = document.getElementById("global-search-empty");
      var form = document.querySelector("[data-global-search-form]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      function renderCard(item) {
        return [
          '<article class="movie-card js-movie-card">',
          '<a href="' + item.file + '" aria-label="' + escapeHtml(item.title) + '">',
          '<div class="poster-frame">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<div class="poster-gradient"></div>',
          '<span class="score-badge">' + item.rating + '</span>',
          '</div>',
          '<div class="movie-card-body">',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p class="movie-card-line">' + escapeHtml(item.oneLine) + '</p>',
          '<div class="movie-meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
          '<div class="tag-line">' + escapeHtml(item.tags) + '</div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      function runSearch() {
        if (!results) {
          return;
        }
        var query = normalize(searchInput && searchInput.value);
        var pool = window.MOVIE_INDEX;
        var filtered = pool.filter(function (item) {
          if (!query) {
            return item.featured;
          }
          return normalize([
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.tags,
            item.oneLine
          ].join(" ")).indexOf(query) !== -1;
        }).slice(0, 120);
        results.innerHTML = filtered.map(renderCard).join("");
        if (empty) {
          empty.hidden = filtered.length !== 0;
        }
      }

      if (searchInput) {
        searchInput.value = initialQuery;
        searchInput.addEventListener("input", runSearch);
      }
      if (form) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          runSearch();
        });
      }
      runSearch();
    }
  });
})();
