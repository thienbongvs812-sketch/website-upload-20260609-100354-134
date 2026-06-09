document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('.filter-panel').forEach(function (panelNode) {
        var targetId = panelNode.getAttribute('data-target');
        var grid = targetId ? document.getElementById(targetId) : panelNode.nextElementSibling;
        if (!grid) {
            return;
        }
        var search = panelNode.querySelector('.filter-search');
        var filter = panelNode.querySelector('.filter-select');
        var sort = panelNode.querySelector('.sort-select');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQ = params.get('q') || '';

        if (search && initialQ) {
            search.value = initialQ;
        }

        function apply() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var cat = filter ? filter.value : 'all';
            var visible = [];

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardCat = card.getAttribute('data-category') || '';
                var matched = (!keyword || text.indexOf(keyword) !== -1) && (cat === 'all' || cardCat === cat);
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible.push(card);
                }
            });

            if (sort) {
                var mode = sort.value;
                visible.sort(function (a, b) {
                    var yearA = parseInt(a.getAttribute('data-year') || '0', 10);
                    var yearB = parseInt(b.getAttribute('data-year') || '0', 10);
                    var titleA = a.getAttribute('data-title') || '';
                    var titleB = b.getAttribute('data-title') || '';

                    if (mode === 'year-asc') {
                        return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
                    }
                    if (mode === 'title-asc') {
                        return titleA.localeCompare(titleB, 'zh-Hans-CN');
                    }
                    return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
                });

                visible.forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        if (filter) {
            filter.addEventListener('change', apply);
        }
        if (sort) {
            sort.addEventListener('change', apply);
        }
        apply();
    });
});
