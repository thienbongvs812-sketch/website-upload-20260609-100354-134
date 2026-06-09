(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.mobile-menu-toggle');
    var drawer = document.querySelector('.mobile-drawer');
    if (!toggle || !drawer) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.hasAttribute('hidden') === false;
      if (isOpen) {
        drawer.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        drawer.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dotsWrap = hero.querySelector('[data-hero-dots]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, slideIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换到第 ' + (slideIndex + 1) + ' 张');
        dot.addEventListener('click', function () {
          showSlide(slideIndex);
          startTimer();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  function setupFilters() {
    var form = document.querySelector('.movie-filter-form');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card-item'));
    if (!form || !cards.length) {
      return;
    }

    var keywordInput = form.querySelector('.js-filter-keyword');
    var typeSelect = form.querySelector('.js-filter-type');
    var categorySelect = form.querySelector('.js-filter-category');
    var yearInput = form.querySelector('.js-filter-year');
    var countNode = document.querySelector('.js-visible-count');
    var reset = form.querySelector('.js-filter-reset');
    var empty = document.querySelector('.empty-result');
    var initialQuery = getQueryParam('q');

    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }

    function cardMatches(card) {
      var keyword = normalize(keywordInput && keywordInput.value);
      var typeValue = normalize(typeSelect && typeSelect.value);
      var categoryValue = normalize(categorySelect && categorySelect.value);
      var yearValue = normalize(yearInput && yearInput.value);
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) {
        return false;
      }
      if (categoryValue && normalize(card.dataset.category) !== categoryValue) {
        return false;
      }
      if (yearValue && normalize(card.dataset.year).indexOf(yearValue) === -1) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      var visible = 0;
      cards.forEach(function (card) {
        var shouldShow = cardMatches(card);
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = visible;
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilters();
    });

    [keywordInput, typeSelect, categorySelect, yearInput].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        form.reset();
        var current = document.querySelector('.filter-panel');
        if (current && current.dataset.currentCategory && categorySelect) {
          categorySelect.value = current.dataset.currentCategory;
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    if (!video) {
      return;
    }

    var hlsInstance = null;
    var overlay = document.querySelector('.player-overlay');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

    function playVideo(url) {
      if (!url) {
        return;
      }

      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
      } else {
        video.src = url;
        video.play().catch(function () {});
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        playVideo(button.dataset.videoUrl || (overlay && overlay.dataset.videoUrl));
      });
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
