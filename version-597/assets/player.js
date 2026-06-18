function startMoviePlayer(streamUrl) {
    var video = document.getElementById("videoPlayer");
    var button = document.getElementById("playButton");
    var started = false;

    if (!video || !button || !streamUrl) {
        return;
    }

    var begin = function () {
        if (started) {
            video.play().catch(function () {});
            return;
        }

        started = true;
        button.classList.add("is-hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = streamUrl;
        video.play().catch(function () {});
    };

    button.addEventListener("click", begin);
    video.addEventListener("click", begin, { once: true });
}
