(function() {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function() {
      navLinks.classList.toggle("is-open");
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });
    heroDots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      var index = Number(dot.getAttribute("data-hero-dot"));
      showHeroSlide(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function() {
      showHeroSlide(heroIndex + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function renderSearch(input, panel) {
    var query = normalize(input.value);
    if (!query || typeof MOVIE_INDEX === "undefined") {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }

    var results = MOVIE_INDEX.filter(function(item) {
      var bag = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.category,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();
      return bag.indexOf(query) !== -1;
    }).slice(0, 10);

    if (!results.length) {
      panel.innerHTML = '<div class="search-item"><div></div><span>未找到匹配影片</span></div>';
      panel.classList.add("is-open");
      return;
    }

    panel.innerHTML = results.map(function(item) {
      return [
        '<a class="search-item" href="' + item.link + '">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>',
        '</a>'
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(function(input) {
    var panel = input.parentElement.querySelector("[data-search-results]");
    if (!panel) {
      return;
    }
    input.addEventListener("input", function() {
      renderSearch(input, panel);
    });
    input.addEventListener("focus", function() {
      renderSearch(input, panel);
    });
  });

  document.addEventListener("click", function(event) {
    if (!event.target.closest(".site-search") && !event.target.closest(".hero-search-box")) {
      Array.prototype.slice.call(document.querySelectorAll("[data-search-results]")).forEach(function(panel) {
        panel.classList.remove("is-open");
      });
    }
  });

  var cardSearch = document.querySelector("[data-card-search]");
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function applyCardFilters() {
    if (!movieCards.length) {
      return;
    }
    var query = normalize(cardSearch ? cardSearch.value : "");
    var year = normalize((document.querySelector('[data-filter="year"]') || {}).value);
    var type = normalize((document.querySelector('[data-filter="type"]') || {}).value);
    var genre = normalize((document.querySelector('[data-filter="genre"]') || {}).value);
    var visible = 0;

    movieCards.forEach(function(card) {
      var textBag = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var matchesQuery = !query || textBag.indexOf(query) !== -1;
      var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
      var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
      var matchesGenre = !genre || normalize(card.getAttribute("data-genre")).indexOf(genre) !== -1 || normalize(card.getAttribute("data-tags")).indexOf(genre) !== -1;
      var shouldShow = matchesQuery && matchesYear && matchesType && matchesGenre;
      card.style.display = shouldShow ? "" : "none";
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (cardSearch) {
    cardSearch.addEventListener("input", applyCardFilters);
  }

  filters.forEach(function(filter) {
    filter.addEventListener("change", applyCardFilters);
  });
})();
