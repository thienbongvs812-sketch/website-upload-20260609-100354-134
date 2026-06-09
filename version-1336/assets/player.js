document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.js-player').forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-cover');
        var src = box.getAttribute('data-video');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !src) {
            return;
        }

        function start() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
                video.load();
            }
            box.classList.add('is-playing');
            button.hidden = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.hidden = false;
                    box.classList.remove('is-playing');
                });
            }
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener('play', function () {
            box.classList.add('is-playing');
            button.hidden = true;
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                button.hidden = false;
                box.classList.remove('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
});
