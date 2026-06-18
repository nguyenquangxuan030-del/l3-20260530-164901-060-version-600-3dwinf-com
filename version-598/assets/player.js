(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var attached = false;
    var hls = null;

    function attachStream() {
      if (!video || attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      if (!video) {
        return;
      }
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  };
})();
