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

radioPlayer.src = streamUrl;
radioPlayer.volume = Number(volumeRange.value) / 100;

function setPlaybackUI(isPlaying, message) {
    const playLabel = playBtn.querySelector("span");
    const label = isPlaying ? "Pausar radio" : "Escuchar radio";
    const bottomLabel = isPlaying ? "❚❚" : "▶";
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
    bottomPlay.textContent = bottomLabel;
    livePlayBtn.textContent = liveLabel;
    playBtn.setAttribute("aria-label", isPlaying ? "Pausar radio" : "Reproducir radio");
    livePlayBtn.setAttribute("aria-label", isPlaying ? "Radio reproduciendose, tocar para pausar" : "Escuchar en vivo");
    bottomPlay.setAttribute("aria-label", isPlaying ? "Pausar radio" : "Reproducir radio");
    playBtn.setAttribute("aria-pressed", String(isPlaying));
    livePlayBtn.setAttribute("aria-pressed", String(isPlaying));
    bottomPlay.setAttribute("aria-pressed", String(isPlaying));
    playBtn.classList.toggle("is-playing", isPlaying);
    livePlayBtn.classList.toggle("is-playing", isPlaying);
    bottomPlay.classList.toggle("is-playing", isPlaying);
    heroPlayer.classList.toggle("is-playing", isPlaying);
    bottomPlayer.classList.toggle("is-playing", isPlaying);

    if (message) {
        playerStatus.textContent = message;
    }
}

function togglePlayback() {
    showRadioMode();

    if (radioPlayer.paused) {
        playerStatus.textContent = "Conectando con la radio...";
        radioPlayer.play().catch(() => {
            setPlaybackUI(false, "No se pudo iniciar la transmision. Intenta de nuevo.");
        });
        return;
    }

    radioPlayer.pause();
    setPlaybackUI(false, "Radio en pausa.");
}

function showVideoMode() {
    if (!youtubeLiveFrame.getAttribute("src")) {
        youtubeLiveFrame.setAttribute("src", youtubeLiveFrame.dataset.src);
    }

    heroPlayer.classList.add("is-video");
    watchLiveBtn.classList.add("is-active");
    watchLiveBtn.setAttribute("aria-pressed", "true");
    watchLiveBtn.querySelector("span").textContent = "Solo escuchar";
    watchLiveBtn.setAttribute("aria-label", "Volver a solo escuchar la radio");
    playerStatus.textContent = radioPlayer.paused
        ? "Video en vivo muteado. Puedes activar la radio cuando quieras."
        : "Video en vivo muteado. La radio sigue sonando.";
}

function showRadioMode() {
    heroPlayer.classList.remove("is-video");
    watchLiveBtn.classList.remove("is-active");
    watchLiveBtn.setAttribute("aria-pressed", "false");
    watchLiveBtn.querySelector("span").textContent = "Ver en vivo";
    watchLiveBtn.setAttribute("aria-label", "Ver transmision en vivo");

    if (youtubeLiveFrame.getAttribute("src")) {
        youtubeLiveFrame.removeAttribute("src");
    }
}

function toggleVideoMode() {
    if (heroPlayer.classList.contains("is-video")) {
        showRadioMode();
        playerStatus.textContent = radioPlayer.paused ? "Radio en pausa." : "Transmitiendo en vivo.";
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
        playerStatus.textContent = "Enlace copiado para compartir.";
        return;
    }

    playerStatus.textContent = "Copia el enlace de la barra del navegador para compartir.";
}

function changeVolume(step) {
    const nextVolume = Math.min(1, Math.max(0, radioPlayer.volume + step));
    radioPlayer.volume = nextVolume;
    volumeRange.value = String(Math.round(nextVolume * 100));
}

function syncVolumeFromSlider() {
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
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
    menuToggle.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
}

function closeSidebarMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    menuToggle.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
}

function toggleAboutText() {
    const isExpanded = aboutToggle.getAttribute("aria-expanded") === "true";

    aboutMore.hidden = isExpanded;
    aboutToggle.setAttribute("aria-expanded", String(!isExpanded));
    aboutToggle.textContent = isExpanded ? "Conoce mas" : "Ocultar";
}

playBtn.addEventListener("click", togglePlayback);
livePlayBtn.addEventListener("click", togglePlayback);
bottomPlay.addEventListener("click", togglePlayback);
watchLiveBtn.addEventListener("click", toggleVideoMode);
sharePageBtn.addEventListener("click", sharePage);
volumeRange.addEventListener("input", syncVolumeFromSlider);
heroVolumeDownBtn.addEventListener("click", () => changeVolume(-0.1));
heroVolumeUpBtn.addEventListener("click", () => changeVolume(0.1));
volumeDownBtn.addEventListener("click", () => changeVolume(-0.1));
volumeUpBtn.addEventListener("click", () => changeVolume(0.1));
menuToggle.addEventListener("click", openSidebar);
closeSidebar.addEventListener("click", closeSidebarMenu);
overlay.addEventListener("click", closeSidebarMenu);
aboutToggle.addEventListener("click", toggleAboutText);

sidebarLinks.forEach((link) => {
    link.addEventListener("click", closeSidebarMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeSidebarMenu();
    }
});

radioPlayer.addEventListener("playing", () => {
    setPlaybackUI(true, "Transmitiendo en vivo.");
});

radioPlayer.addEventListener("pause", () => {
    setPlaybackUI(false, "Radio en pausa.");
});

radioPlayer.addEventListener("waiting", () => {
    playerStatus.textContent = "Cargando la transmision...";
});

radioPlayer.addEventListener("error", () => {
    setPlaybackUI(false, "No se pudo cargar la radio. Verifica el enlace o reintenta.");
});

setPlaybackUI(false, "Listo para reproducir la radio en vivo.");

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
