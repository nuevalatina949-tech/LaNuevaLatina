const playBtn = document.getElementById("playBtn");
const livePlayBtn = document.getElementById("livePlayBtn");
const bottomPlay = document.getElementById("bottomPlay");
const volumeRange = document.getElementById("volumeRange");
const heroVolumeDownBtn = document.getElementById("heroVolumeDownBtn");
const heroVolumeUpBtn = document.getElementById("heroVolumeUpBtn");
const watchLiveBtn = document.getElementById("watchLiveBtn");
const youtubeLiveFrame = document.getElementById("youtubeLiveFrame");
const sharePageBtn = document.getElementById("sharePageBtn");
const volumeDownBtn = document.getElementById("volumeDownBtn");
const volumeUpBtn = document.getElementById("volumeUpBtn");
const radioPlayer = document.getElementById("radioPlayer");
const playerStatus = document.getElementById("playerStatus");
const heroPlayer = document.querySelector(".hero-player");
const bottomPlayer = document.querySelector(".bottom-player");
const heroTitle = document.querySelector(".hero-title");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebar = document.getElementById("mobileSidebar");
const overlay = document.getElementById("sidebarOverlay");
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
const aboutToggle = document.getElementById("aboutToggle");
const aboutMore = document.getElementById("aboutMore");

const streamUrl = "https://cast3.my-control-panel.com/proxy/lanueval/stream";
let radioWasPlaying = false;

if (radioPlayer && volumeRange) {
    radioPlayer.src = streamUrl;
    radioPlayer.volume = Number(volumeRange.value) / 100;
}

function setPlaybackUI(isPlaying, message) {
    if (playBtn) {
        const playLabel = playBtn.querySelector("span");
        const label = isPlaying ? "Pausar radio" : "Escuchar radio";
        const liveLabel = isPlaying ? ".  Reproduciendo" : ".  Escuchar en vivo";

        // Update play button SVG icon
        const playSvg = playBtn.querySelector("svg path");
        if (playSvg) {
            playSvg.setAttribute("d", isPlaying ? "M6 4h4v16H6V4Zm8 0h4v16h-4V4Z" : "M8 5v14l11-7L8 5Z");
        }

        if (playLabel) {
            playLabel.textContent = label;
        } else {
            playBtn.textContent = label;
        }
        playBtn.setAttribute("aria-label", isPlaying ? "Pausar radio" : "Reproducir radio");
        playBtn.setAttribute("aria-pressed", String(isPlaying));
        playBtn.classList.toggle("is-playing", isPlaying);
    }

    if (bottomPlay) {
        const bottomLabel = isPlaying ? "❚❚" : "▶";
        bottomPlay.textContent = bottomLabel;
        bottomPlay.setAttribute("aria-label", isPlaying ? "Pausar radio" : "Reproducir radio");
        bottomPlay.setAttribute("aria-pressed", String(isPlaying));
        bottomPlay.classList.toggle("is-playing", isPlaying);
    }

    if (livePlayBtn) {
        const liveLabel = isPlaying ? ".  Reproduciendo" : ".  Escuchar en vivo";
        livePlayBtn.textContent = liveLabel;
        livePlayBtn.setAttribute("aria-label", isPlaying ? "Radio reproduciendose, tocar para pausar" : "Escuchar en vivo");
        livePlayBtn.setAttribute("aria-pressed", String(isPlaying));
        livePlayBtn.classList.toggle("is-playing", isPlaying);
    }

    if (heroPlayer) {
        heroPlayer.classList.toggle("is-playing", isPlaying);
    }

    if (bottomPlayer) {
        bottomPlayer.classList.toggle("is-playing", isPlaying);
    }

    if (message && playerStatus) {
        playerStatus.textContent = message;
    }
}

function togglePlayback() {
    if (!radioPlayer) return;
    showRadioMode();

    if (radioPlayer.paused) {
        if (playerStatus) playerStatus.textContent = "Conectando con la radio...";
        radioPlayer.play().catch(() => {
            setPlaybackUI(false, "No se pudo iniciar la transmision. Intenta de nuevo.");
        });
        return;
    }

    radioPlayer.pause();
    setPlaybackUI(false, "Radio en pausa.");
}

function showVideoMode() {
    if (!youtubeLiveFrame || !heroPlayer || !watchLiveBtn || !radioPlayer) return;
    radioWasPlaying = !radioPlayer.paused;
    if (!youtubeLiveFrame.getAttribute("src")) {
        youtubeLiveFrame.setAttribute("src", youtubeLiveFrame.dataset.src);
    }

    heroPlayer.classList.add("is-video");
    watchLiveBtn.classList.add("is-active");
    watchLiveBtn.setAttribute("aria-pressed", "true");
    const watchLiveSpan = watchLiveBtn.querySelector("span");
    if (watchLiveSpan) watchLiveSpan.textContent = "Solo escuchar";
    watchLiveBtn.setAttribute("aria-label", "Volver a solo escuchar la radio");

    if (!radioPlayer.paused) {
        radioPlayer.pause();
    }

    if (playerStatus) {
        playerStatus.textContent = "Video en vivo con audio. La radio ha sido pausada.";
    }
}

function showRadioMode() {
    if (!youtubeLiveFrame || !heroPlayer || !watchLiveBtn || !radioPlayer) return;
    heroPlayer.classList.remove("is-video");
    watchLiveBtn.classList.remove("is-active");
    watchLiveBtn.setAttribute("aria-pressed", "false");
    const watchLiveSpan = watchLiveBtn.querySelector("span");
    if (watchLiveSpan) watchLiveSpan.textContent = "Ver en vivo";
    watchLiveBtn.setAttribute("aria-label", "Ver transmision en vivo");

    if (youtubeLiveFrame.getAttribute("src")) {
        youtubeLiveFrame.removeAttribute("src");
    }

    if (radioWasPlaying) {
        radioPlayer.play().catch(() => {
            setPlaybackUI(false, "No se pudo reanudar la radio.");
        });
    }

    if (playerStatus) {
        playerStatus.textContent = radioPlayer.paused ? "Radio en pausa." : "Transmitiendo en vivo.";
    }
}

function toggleVideoMode() {
    if (!heroPlayer) return;
    if (heroPlayer.classList.contains("is-video")) {
        showRadioMode();
        if (playerStatus) playerStatus.textContent = radioPlayer.paused ? "Radio en pausa." : "Transmitiendo en vivo.";
        return;
    }

    showVideoMode();
}

async function sharePage() {
    const shareData = {
        title: document.title,
        text: "Escucha La Nueva Latina en vivo.",
        url: window.location.href,
    };

    if (navigator.share) {
        await navigator.share(shareData).catch(() => {});
        return;
    }

    if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        if (playerStatus) playerStatus.textContent = "Enlace copiado para compartir.";
        return;
    }

    if (playerStatus) playerStatus.textContent = "Copia el enlace de la barra del navegador para compartir.";
}

function changeVolume(step) {
    if (!radioPlayer || !volumeRange) return;
    const nextVolume = Math.min(1, Math.max(0, radioPlayer.volume + step));
    radioPlayer.volume = nextVolume;
    volumeRange.value = String(Math.round(nextVolume * 100));
}

function syncVolumeFromSlider() {
    if (!radioPlayer || !volumeRange) return;
    radioPlayer.volume = Number(volumeRange.value) / 100;
}

function typeHeroTitle() {
    if (!heroTitle) {
        return;
    }

    const lines = Array.from(heroTitle.querySelectorAll(".hero-title-line"));
    const texts = lines.map((line) => line.dataset.text || "");

    heroTitle.classList.add("is-typing");
    heroTitle.classList.remove("is-done");
    lines.forEach((line) => {
        line.textContent = "";
    });

    let lineIndex = 0;
    let charIndex = 0;

    const tick = () => {
        const currentLine = lines[lineIndex];

        if (!currentLine) {
            heroTitle.classList.remove("is-typing");
            heroTitle.classList.add("is-done");
            return;
        }

        const text = texts[lineIndex];
        currentLine.textContent = text.slice(0, charIndex + 1);
        charIndex += 1;

        if (charIndex < text.length) {
            window.setTimeout(tick, 90);
            return;
        }

        lineIndex += 1;
        charIndex = 0;

        if (lineIndex < lines.length) {
            window.setTimeout(tick, 220);
            return;
        }

        heroTitle.classList.remove("is-typing");
        heroTitle.classList.add("is-done");
    };

    tick();
}

function openSidebar() {
    if (!sidebar || !overlay || !menuToggle) return;
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
    menuToggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
}

function closeSidebarMenu() {
    if (!sidebar || !overlay || !menuToggle) return;
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
}

function toggleAboutText() {
    if (!aboutToggle || !aboutMore) return;
    const isExpanded = aboutToggle.getAttribute("aria-expanded") === "true";

    aboutMore.hidden = isExpanded;
    aboutToggle.setAttribute("aria-expanded", String(!isExpanded));
    aboutToggle.textContent = isExpanded ? "Conoce mas" : "Ocultar";
}

if (playBtn) playBtn.addEventListener("click", togglePlayback);
if (livePlayBtn) livePlayBtn.addEventListener("click", togglePlayback);
if (bottomPlay) bottomPlay.addEventListener("click", togglePlayback);
if (watchLiveBtn) watchLiveBtn.addEventListener("click", toggleVideoMode);
if (sharePageBtn) sharePageBtn.addEventListener("click", sharePage);
if (volumeRange) volumeRange.addEventListener("input", syncVolumeFromSlider);
if (heroVolumeDownBtn) heroVolumeDownBtn.addEventListener("click", () => changeVolume(-0.1));
if (heroVolumeUpBtn) heroVolumeUpBtn.addEventListener("click", () => changeVolume(0.1));
if (volumeDownBtn) volumeDownBtn.addEventListener("click", () => changeVolume(-0.1));
if (volumeUpBtn) volumeUpBtn.addEventListener("click", () => changeVolume(0.1));
if (menuToggle) menuToggle.addEventListener("click", openSidebar);
if (closeSidebar) closeSidebar.addEventListener("click", closeSidebarMenu);
if (overlay) overlay.addEventListener("click", closeSidebarMenu);
if (aboutToggle) aboutToggle.addEventListener("click", toggleAboutText);

sidebarLinks.forEach((link) => {
    link.addEventListener("click", closeSidebarMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSidebarMenu();
    }
});

if (radioPlayer) {
    radioPlayer.addEventListener("playing", () => {
        setPlaybackUI(true, "Transmitiendo en vivo.");
    });

    radioPlayer.addEventListener("pause", () => {
        setPlaybackUI(false, "Radio en pausa.");
    });

    radioPlayer.addEventListener("waiting", () => {
        if (playerStatus) playerStatus.textContent = "Cargando la transmision...";
    });

    radioPlayer.addEventListener("error", () => {
        setPlaybackUI(false, "No se pudo cargar la radio. Verifica el enlace o reintenta.");
    });

    setPlaybackUI(false, "Listo para reproducir la radio en vivo.");
}

const revealTargets = document.querySelectorAll(".hero-left, .hero-player, .highlight-item, .panel");
revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.animationDelay = `${index * 100}ms`;
});

window.setTimeout(() => {
    typeHeroTitle();
}, 220);
window.addEventListener('load', () => {
    // nothing for DJ carousel here; logic moved to dj-carousel.js
});
