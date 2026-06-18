(function () {
  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');

    if (!video || !button) {
      return;
    }

    function attach() {
      var stream = video.getAttribute('data-stream');

      if (!stream || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.setAttribute('data-ready', '1');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsController = hls;
        video.setAttribute('data-ready', '1');
        return;
      }

      video.src = stream;
      video.setAttribute('data-ready', '1');
    }

    function play() {
      attach();
      video.controls = true;
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!video.getAttribute('data-ready')) {
        play();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(bindPlayer);
  });
})();
