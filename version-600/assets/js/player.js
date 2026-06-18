(function () {
    function mount(options) {
        const video = document.getElementById(options.videoId);
        const cover = document.getElementById(options.coverId);
        const button = document.getElementById(options.buttonId);
        let ready = false;
        let hls = null;

        function load() {
            if (!video || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = options.url;
            } else if (window.Hls) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(options.url);
                hls.attachMedia(video);
            } else {
                video.src = options.url;
            }

            ready = true;
        }

        function play() {
            load();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready) {
                    play();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.HDPlayer = {
        mount: mount
    };
}());
