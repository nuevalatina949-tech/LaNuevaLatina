// entrevistas.js
// Maneja la búsqueda de entrevistas y la reproducción de miniaturas.
(function () {
    const VIDEO_ID_DEFAULT = 'KMXCwyKD1Cg';

    const inputTop = document.getElementById('headerSearch');
    const inputBottom = document.getElementById('searchInterviews');
    const list = document.getElementById('interviewsList');
    const items = list ? Array.from(list.querySelectorAll('.interview-card')) : [];
    const menuToggleHeader = document.getElementById('menuToggleHeader');
    const livePlayBtnHeader = document.getElementById('livePlayBtnHeader');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarLinks = sidebar ? sidebar.querySelectorAll('.sidebar-nav a') : [];

    function normalize(value) {
        return (value || '').toLowerCase().trim();
    }

    function filter(query) {
        items.forEach((card) => {
            const title = normalize(card.dataset.title);
            const desc = normalize(card.dataset.desc);
            const match = query === '' || title.includes(query) || desc.includes(query);
            card.style.display = match ? '' : 'none';
        });
    }

    if (inputTop) {
        inputTop.addEventListener('input', function () {
            if (inputBottom) inputBottom.value = this.value;
            filter(normalize(this.value));
        });
    }

    if (inputBottom) {
        inputBottom.addEventListener('input', function () {
            if (inputTop) inputTop.value = this.value;
            filter(normalize(this.value));
        });
    }

    items.forEach((card) => {
        const wrap = card.querySelector('.thumb-wrap');
        const playButton = card.querySelector('.play-overlay');
        const videoId = card.dataset.video || VIDEO_ID_DEFAULT;

        if (!wrap || !playButton) return;

        playButton.addEventListener('click', () => {
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.title = card.dataset.title;
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            wrap.innerHTML = '';
            wrap.appendChild(iframe);
        });
    });

    function toggleButton(btn, otherBtn) {
        const isPressed = btn.getAttribute('aria-pressed') === 'true';
        const count = btn.querySelector('.count');
        if (isPressed) {
            btn.setAttribute('aria-pressed', 'false');
            if (count) count.textContent = Math.max(0, parseInt(count.textContent, 10) - 1);
            return;
        }

        btn.setAttribute('aria-pressed', 'true');
        if (count) count.textContent = (parseInt(count.textContent || '0', 10) + 1).toString();

        if (otherBtn && otherBtn.getAttribute('aria-pressed') === 'true') {
            otherBtn.setAttribute('aria-pressed', 'false');
            const otherCount = otherBtn.querySelector('.count');
            if (otherCount) otherCount.textContent = Math.max(0, parseInt(otherCount.textContent, 10) - 1);
        }
    }

    items.forEach((card) => {
        const likeBtn = card.querySelector('.like-btn');
        const dislikeBtn = card.querySelector('.dislike-btn');

        if (likeBtn) {
            likeBtn.addEventListener('click', () => toggleButton(likeBtn, dislikeBtn));
        }

        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', () => toggleButton(dislikeBtn, likeBtn));
        }
    });

    function openSidebarMenu() {
        if (!sidebar || !overlay || !menuToggleHeader) return;

        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
        menuToggleHeader.setAttribute('aria-expanded', 'true');
        sidebar.setAttribute('aria-hidden', 'false');
    }

    function closeSidebarMenu() {
        if (!sidebar || !overlay || !menuToggleHeader) return;

        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        menuToggleHeader.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
    }

    if (menuToggleHeader) {
        menuToggleHeader.addEventListener('click', openSidebarMenu);
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebarMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebarMenu);
    }

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', closeSidebarMenu);
    });

    if (livePlayBtnHeader) {
        livePlayBtnHeader.addEventListener('click', () => {
            window.location.href = 'index.html#inicio';
        });
    }
})();
