(function () {
    const normalize = function (value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    };

    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');
    if (navToggle && mobilePanel) {
        navToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;
        const showSlide = function (nextIndex) {
            activeIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === activeIndex);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === activeIndex);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const forms = Array.from(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
        const input = form.querySelector('input[name="q"]');
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const value = input ? input.value.trim() : '';
            const target = form.getAttribute('data-target') || 'index.html';
            if (value) {
                window.location.href = target + '?q=' + encodeURIComponent(value) + '#all-movies';
            } else {
                window.location.href = target;
            }
        });
    });

    const grid = document.querySelector('[data-movie-grid]');
    const emptyState = document.querySelector('[data-empty-state]');
    const filterBar = document.querySelector('[data-filter-bar]');
    let activeFilter = 'all';
    let activeQuery = normalize(initialQuery);

    const filterCards = function () {
        if (!grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        let visible = 0;
        cards.forEach(function (card) {
            const matchesCategory = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
            const search = normalize(card.getAttribute('data-search') || card.textContent);
            const matchesQuery = !activeQuery || search.indexOf(activeQuery) !== -1;
            const show = matchesCategory && matchesQuery;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    };

    if (filterBar) {
        const chips = Array.from(filterBar.querySelectorAll('[data-filter]'));
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                filterCards();
            });
        });
    }

    const sortSelect = document.querySelector('[data-sort-select]');
    if (sortSelect && grid) {
        sortSelect.addEventListener('change', function () {
            const mode = sortSelect.value;
            const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
            cards.sort(function (a, b) {
                if (mode === 'year') {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                }
                if (mode === 'title') {
                    return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
                }
                return Number(b.getAttribute('data-rank') || 0) - Number(a.getAttribute('data-rank') || 0);
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
            filterCards();
        });
    }

    if (grid && initialQuery) {
        filterCards();
    }
})();
