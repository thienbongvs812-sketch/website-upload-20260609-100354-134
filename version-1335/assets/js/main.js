(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-focus-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-focus-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 6200);
  }

  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      const value = input.value.trim().toLowerCase();
      const area = input.closest('[data-search-area]') || document;
      const cards = Array.from(area.querySelectorAll('[data-card]'));

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.region,
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', value && !haystack.includes(value));
      });
    });
  });

  const videos = Array.from(document.querySelectorAll('video[data-stream]'));

  videos.forEach(function (video) {
    const src = video.dataset.stream;

    if (!src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    const shell = video.closest('.video-shell');

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove('is-playing');
      }
    });
  });

  const playButtons = Array.from(document.querySelectorAll('[data-play-target]'));

  playButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.getElementById(button.dataset.playTarget);

      if (!target) {
        return;
      }

      const result = target.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    });
  });
})();
