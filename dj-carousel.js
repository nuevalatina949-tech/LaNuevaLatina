(function () {
    const carousel = document.getElementById('djCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.dj-track');
    const slides = Array.from(carousel.querySelectorAll('.dj-slide'));
    const dotsContainer = document.getElementById('djDots');
    if (!track || !slides.length) return;

    let current = 0;
    const intervalMs = 2000;
    let timer = null;

    function updateTrack() {
        const offset = -current * 100;
        track.style.transform = `translateX(${offset}%)`;
        updateDots();
    }

    function next() {
        current = (current + 1) % slides.length;
        updateTrack();
    }

    function start() {
        stop();
        timer = window.setInterval(next, intervalMs);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Ir al slide ${i + 1}`);
            btn.addEventListener('click', () => {
                current = i;
                updateTrack();
                // restart autoplay so user sees the slide before it advances
                start();
            });
            dotsContainer.appendChild(btn);
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        const dots = Array.from(dotsContainer.children);
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // pause on hover/focus
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    // touch: pause on touchstart, resume on touchend
    carousel.addEventListener('touchstart', stop, {passive: true});
    carousel.addEventListener('touchend', () => start());

    // initialize
    createDots();
    updateTrack();
    start();
})();
