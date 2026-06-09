(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function apply() {
      var key = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? Number(year.value) : 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = Number(card.getAttribute("data-year") || 0);
        var matchedKeyword = !key || text.indexOf(key) !== -1;
        var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
        var matchedYear = !selectedYear || cardYear >= selectedYear;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedYear));
      });
    }

    [keyword, type, year].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
    apply();
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(" / ");
    var article = document.createElement("article");
    article.className = "movie-card";
    article.setAttribute("data-movie-card", "");
    article.innerHTML = [
      '<a class="poster-link" href="' + movie.path + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img class="poster-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-glow"></span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '<h3><a href="' + movie.path + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-foot"><span>' + escapeHtml(tags || movie.genre) + '</span><a href="' + movie.path + '">详情</a></div>',
      '</div>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.searchMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var normalized = query.trim().toLowerCase();
    var matched = window.searchMovies.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
      return text.indexOf(normalized) !== -1;
    }).slice(0, 80);
    results.innerHTML = "";
    matched.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
    if (status) {
      status.textContent = matched.length ? "搜索结果" : "没有找到匹配影片";
    }
  }

  function initPlayer() {
    var video = document.querySelector('[data-player="movie"]');
    var button = document.querySelector("[data-player-button]");
    if (!video || typeof movieVideoUrl === "undefined") {
      return;
    }
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = movieVideoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(movieVideoUrl);
        hls.attachMedia(video);
      } else {
        video.src = movieVideoUrl;
      }
    }

    function playVideo() {
      loadVideo();
      video.controls = true;
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
