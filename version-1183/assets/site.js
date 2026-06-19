(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindFilter(scope) {
    const input = scope.querySelector("[data-search-input]");
    const year = scope.querySelector("[data-year-filter]");
    const genre = scope.querySelector("[data-genre-filter]");
    const cardScope = scope.nextElementSibling && scope.nextElementSibling.matches("[data-filter-scope]") ? scope.nextElementSibling : scope;
    const cards = Array.from(cardScope.querySelectorAll("[data-card]"));
    const empty = cardScope.querySelector("[data-empty-state]") || scope.querySelector("[data-empty-state]");

    if (!input && !year && !genre) {
      return;
    }

    function applyFilter() {
      const q = normalize(input ? input.value : "");
      const y = normalize(year ? year.value : "");
      const g = normalize(genre ? genre.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.dataset.title + " " + card.dataset.meta);
        const cardYear = normalize(card.dataset.year);
        const cardGenre = normalize(card.dataset.genre);
        const matchesText = !q || haystack.includes(q);
        const matchesYear = !y || cardYear === y;
        const matchesGenre = !g || cardGenre.includes(g) || haystack.includes(g);
        const show = matchesText && matchesYear && matchesGenre;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  }

  document.querySelectorAll(".filter-hero[data-filter-scope]").forEach(bindFilter);
}());
