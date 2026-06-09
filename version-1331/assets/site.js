(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function openSearch(value) {
        var keyword = String(value || '').trim();
        var target = 'search.html';
        if (keyword) {
            target += '?q=' + encodeURIComponent(keyword);
        }
        window.location.href = target;
    }

    function initHeader() {
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        qsa('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input', form);
                openSearch(input ? input.value : '');
            });
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = qsa('.hero-slide', slider);
        var dots = qsa('[data-hero-dot]');
        var prev = qs('[data-hero-prev]');
        var next = qs('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function applyFilter(grid, keyword, selectedType) {
        var cards = qsa('.movie-card', grid);
        var visible = 0;
        var text = normalize(keyword);
        var type = normalize(selectedType);

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matchText = !text || haystack.indexOf(text) !== -1;
            var matchType = !type || cardType.indexOf(type) !== -1;
            var shouldShow = matchText && matchType;
            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) {
                visible += 1;
            }
        });

        var empty = qs('[data-empty-state]');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    function initFilters() {
        var grid = qs('[data-filter-grid]');
        if (!grid) {
            return;
        }

        var input = qs('[data-filter-input]');
        var select = qs('[data-filter-select]');
        var page = document.body.getAttribute('data-page');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';

        if (input && page === 'search') {
            input.value = q;
        }

        function refresh() {
            applyFilter(grid, input ? input.value : '', select ? select.value : '');
        }

        if (input) {
            input.addEventListener('input', refresh);
        }
        if (select) {
            select.addEventListener('change', refresh);
        }
        refresh();
    }

    function initCinemaPlayer(id) {
        var video = document.getElementById(id);
        if (!video) {
            return;
        }

        var box = video.closest('.player-box');
        var overlay = box ? qs('.player-overlay', box) : null;
        var source = qs('source', video);
        var src = source ? source.getAttribute('src') : video.getAttribute('src');
        var ready = false;
        var hls = null;

        function attach() {
            if (ready || !src) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
            ready = true;
        }

        function start() {
            attach();
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                start();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (box) {
                box.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (box && video.currentTime === 0) {
                box.classList.remove('is-playing');
            }
        });

        video.addEventListener('ended', function () {
            if (box) {
                box.classList.remove('is-playing');
            }
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
            ready = false;
        });
    }

    window.initCinemaPlayer = initCinemaPlayer;

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHero();
        initFilters();
    });
})();
