function initMoviePlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var hlsInstance = null;

  if (!video || !cover || !sourceUrl) {
    return;
  }

  var start = function () {
    cover.classList.add("is-hidden");

    if (!video.getAttribute("data-ready")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.setAttribute("data-ready", "1");
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        video.setAttribute("data-ready", "1");
      } else {
        video.src = sourceUrl;
        video.setAttribute("data-ready", "1");
      }
    }

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        cover.classList.remove("is-hidden");
      });
    }
  };

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!video.getAttribute("data-ready")) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
