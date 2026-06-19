(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  function startPlayer(card) {
    var video = card.querySelector("video");

    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    card.classList.add("is-playing");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (!video.src) {
        video.src = stream;
      }
      video.play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsReady = true;
        video._hls = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      } else {
        video.play();
      }
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (card) {
    var button = card.querySelector(".player-overlay");
    var video = card.querySelector("video");

    if (button) {
      button.addEventListener("click", function () {
        startPlayer(card);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!card.classList.contains("is-playing")) {
          startPlayer(card);
        }
      });
    }
  });

  function setupCatalogFilter(scope) {
    var catalog = scope.querySelector("[data-catalog]");

    if (!catalog) {
      return;
    }

    var search = scope.querySelector("[data-catalog-search]");
    var year = scope.querySelector("[data-filter-year]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-genre") || ""
        ].join(" ").toLowerCase();
        var ok = true;

        if (q && text.indexOf(q) === -1) {
          ok = false;
        }

        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }

        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }

        if (t && (card.getAttribute("data-type") || "").indexOf(t) === -1) {
          ok = false;
        }

        card.classList.toggle("hidden-card", !ok);
      });
    }

    [search, year, region, type].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
  }

  setupCatalogFilter(document);

  function cardHtml(movie) {
    var tags = [movie.year, movie.region, movie.type].map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"poster-shade\"></span>",
      "<span class=\"poster-play\">▶</span>",
      "<span class=\"poster-meta\">" + escapeHtml(movie.duration) + "</span>",
      "</a>",
      "<div class=\"movie-info\">",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.description) + "</p>",
      "<div class=\"movie-tags\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  var searchInput = document.getElementById("search-input");
  var searchResults = document.getElementById("search-results");

  if (searchInput && searchResults && window.MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    searchInput.value = initial;

    function renderSearch() {
      var q = searchInput.value.trim().toLowerCase();
      var list = window.MOVIES.filter(function (movie) {
        if (!q) {
          return true;
        }

        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.description,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();

        return text.indexOf(q) !== -1;
      }).slice(0, 240);

      searchResults.innerHTML = list.map(cardHtml).join("");
    }

    searchInput.addEventListener("input", renderSearch);
    renderSearch();
  }
})();
