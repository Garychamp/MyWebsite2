// Background video controls and accessibility helpers
document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('bg-video');
    const toggle = document.getElementById('video-toggle');

    function updateToggleState() {
        if (!toggle || !video) return;
        const isPlaying = !video.paused && !video.ended;
        toggle.setAttribute('aria-pressed', String(isPlaying));
        toggle.textContent = isPlaying ? 'Pause background' : 'Play background';
    }

    // If the user prefers reduced motion, do not autoplay the background
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
        if (video) {
            try { video.pause(); } catch (e) { /* ignore */ }
        }
    }

    // On small screens, swap to mobile-optimized video sources if available
    function loadMobileVideoIfNeeded() {
        if (!video) return;
        const mobileMaxWidth = 768; // px
        const isSmall = window.innerWidth <= mobileMaxWidth || /Mobi|Android/i.test(navigator.userAgent);
        if (!isSmall) return;

        const mobileWebm = video.getAttribute('data-mobile-webm');
        const mobileMp4 = video.getAttribute('data-mobile-mp4');
        if (!mobileWebm && !mobileMp4) return;

        // Replace sources with mobile variants where provided
        const sources = video.querySelectorAll('source');
        sources.forEach(srcEl => {
            const type = srcEl.getAttribute('type') || '';
            if (type.includes('webm') && mobileWebm) srcEl.setAttribute('src', mobileWebm);
            if (type.includes('mp4') && mobileMp4) srcEl.setAttribute('src', mobileMp4);
        });

        // Force the video element to reload sources and attempt play
        try {
            video.load();
            // Attempt to play (may still require user gesture on some browsers)
            video.play().catch(() => {
                // ignored — user may need to interact
            });
        } catch (e) {
            // ignore errors from load/play
        }
    }

    // Run once on load and again on resize (debounced)
    loadMobileVideoIfNeeded();
    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(loadMobileVideoIfNeeded, 250);
    });

    if (toggle && video) {
        // Initialize button state after metadata loads
        video.addEventListener('loadedmetadata', updateToggleState);
        // Update when play/pause occur
        video.addEventListener('play', updateToggleState);
        video.addEventListener('pause', updateToggleState);

        toggle.addEventListener('click', function () {
            if (!video) return;
            if (video.paused) {
                video.play().catch(() => {
                    // play may fail on some browsers if not initiated by user gesture
                });
            } else {
                video.pause();
            }
            updateToggleState();
        });

        // Initial state
        updateToggleState();
    }
});

