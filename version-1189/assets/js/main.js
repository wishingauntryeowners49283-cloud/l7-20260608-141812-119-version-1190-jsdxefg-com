(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('.menu-toggle');
        var nav = qs('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = qs('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dot', slider);
        var prev = qs('.hero-prev', slider);
        var next = qs('.hero-next', slider);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var filterBlocks = qsa('[data-filter-scope]');
        filterBlocks.forEach(function (scope) {
            var search = qs('.site-search', scope);
            var year = qs('.year-filter', scope);
            var region = qs('.region-filter', scope);
            var type = qs('.type-filter', scope);
            var cards = qsa('.movie-card', scope);
            var empty = qs('.empty-state', scope);

            function valueOf(el) {
                return el ? String(el.value || '').trim().toLowerCase() : '';
            }

            function run() {
                var term = valueOf(search);
                var yearValue = valueOf(year);
                var regionValue = valueOf(region);
                var typeValue = valueOf(type);
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = String(card.getAttribute('data-search') || '').toLowerCase();
                    var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
                    var cardRegion = String(card.getAttribute('data-region') || '').toLowerCase();
                    var cardType = String(card.getAttribute('data-type') || '').toLowerCase();
                    var matched = true;
                    if (term && searchText.indexOf(term) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }
                    if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            [search, year, region, type].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', run);
                    el.addEventListener('change', run);
                }
            });
        });
    }

    function playVideo(player) {
        var video = qs('video', player);
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        player.classList.add('is-playing');
        if (video.dataset.ready === '1') {
            video.play().catch(function () {});
            return;
        }
        video.dataset.ready = '1';
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            video._hls = hls;
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            return;
        }
        video.src = stream;
        video.play().catch(function () {});
    }

    function initPlayers() {
        qsa('.movie-player').forEach(function (player) {
            var button = qs('.play-trigger', player);
            var video = qs('video', player);
            if (button) {
                button.addEventListener('click', function () {
                    playVideo(player);
                });
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
