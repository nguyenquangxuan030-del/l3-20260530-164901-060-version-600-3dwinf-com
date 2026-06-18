(function () {
  window.startMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var loaded = false;
    var hls = null;

    function attach() {
      if (!video || !source) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        video.setAttribute("controls", "controls");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
