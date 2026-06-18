(function () {
  function initPlayer() {
    var shell = document.querySelector('[data-player] .player-shell');
    var video = document.querySelector('[data-player] video');
    var playButton = document.querySelector('[data-player-play]');
    var muteButton = document.querySelector('[data-player-mute]');
    var fullscreenButton = document.querySelector('[data-player-fullscreen]');

    if (!shell || !video) {
      return;
    }

    var src = video.getAttribute('data-hls-src');

    function attachNative() {
      if (src && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    }

    function attachHls(Hls) {
      if (!src) {
        return;
      }

      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
          attachNative();
        });

        window.addEventListener('beforeunload', function () {
          hls.destroy();
        });
      } else {
        attachNative();
      }
    }

    if (src) {
      import('./hls-vendor-dru42stk.js')
        .then(function (module) {
          attachHls(module.H);
        })
        .catch(function () {
          attachNative();
        });
    }

    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    if (playButton) {
      playButton.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
})();
