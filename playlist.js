const playlistViewport = document.getElementById("playlistViewport");
const playlistPrev = document.getElementById("playlistPrev");
const playlistNext = document.getElementById("playlistNext");
const spotifyEmbed = document.getElementById("spotifyEmbed");
const spotifyEmbedWrapper = document.getElementById("spotifyEmbedWrapper");
const playlistCards = document.querySelectorAll(".playlist-card");
const playlistButtons = document.querySelectorAll(".playlist-play-btn");
const radioPlayerForPlaylist = document.getElementById("radioPlayer");
const spotifyThumbnailCache = new Map();

const spotifyTrackMetadataFallbacks = {
    "0TDLuuLlV54CkRRUOahJb4": {
        title: "Titanium (feat. Sia)",
        author: "David Guetta, Sia",
        extra: "Disponible en Spotify",
    },
    "23L5CiUhw2jV1OIMwthR3S": {
        title: "In the Name of Love",
        author: "Martin Garrix, Bebe Rexha",
        extra: "Disponible en Spotify",
    },
    "704mzKiY5HnMMSeTmzak3v": {
        title: "SI MUA",
        author: "Dafina Zeqiri, Elgit Doda",
        extra: "Disponible en Spotify",
    },
    "2a1o6ZejUi8U3wzzOtCOYw": {
        title: "Danza Kuduro",
        author: "Don Omar, Lucenzo",
        extra: "Disponible en Spotify",
    },
    "7qiZfU4dY1lWllzX7mPBI3": {
        title: "Shape of You",
        author: "Ed Sheeran",
        extra: "Disponible en Spotify",
    },
    "6WrUT7FOAlDscRWU7ndmyd": {
        title: "Viva La Vida",
        author: "Coldplay",
        extra: "Disponible en Spotify",
    },
    "4uLU6hMCjMI75M1A2tKUQC": {
        title: "Never Gonna Give You Up",
        author: "Rick Astley",
        extra: "Disponible en Spotify",
    },
    "1mPwde0APTwtRskiOv9w55": {
        title: "I've Come to Worship",
        author: "Sion & Shannon Alford",
        extra: "Disponible en Spotify",
    },
    "1eOJAiCKFuMda0fPRvjcuc": {
        title: "Hold My Hand",
        author: "Jess Glynne",
        extra: "Disponible en Spotify",
    },
};

function getSpotifyTrackUrl(spotifyUri) {
    return `https://open.spotify.com/track/${spotifyUri}`;
}

async function fetchSpotifyMetadata(spotifyUri) {
    if (!spotifyUri) {
        return null;
    }

    if (spotifyThumbnailCache.has(spotifyUri)) {
        return spotifyThumbnailCache.get(spotifyUri);
    }

    return fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(getSpotifyTrackUrl(spotifyUri))}`)
        .then((response) => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then((data) => {
            if (!data) {
                return null;
            }

            const fallback = spotifyTrackMetadataFallbacks[spotifyUri] || {};
            const metadata = {
                title: data.title || fallback.title || null,
                author: data.author_name || fallback.author || null,
                provider: data.provider_name || null,
                thumbnail: data.thumbnail_url || null,
                extra: fallback.extra || null,
            };

            spotifyThumbnailCache.set(spotifyUri, metadata);
            return metadata;
        })
        .catch(() => null);
}

function getCardImage(card) {
    return card?.querySelector("img");
}

async function setSpotifyMetadata(card) {
    const spotifyUri = card.dataset.spotifyUri;
    if (!spotifyUri) {
        return;
    }

    const metadata = await fetchSpotifyMetadata(spotifyUri);
    if (!metadata) {
        return;
    }

    const img = getCardImage(card);
    const titleElement = card.querySelector(".playlist-copy h3");
    const subtitleElement = card.querySelector(".playlist-copy p");
    const smallElement = card.querySelector(".playlist-copy small");

    if (img && metadata.thumbnail) {
        img.src = metadata.thumbnail;
    }

    if (metadata.title && titleElement) {
        titleElement.textContent = metadata.title;
        card.dataset.trackTitle = metadata.title;
    }

    if (metadata.author && subtitleElement) {
        subtitleElement.textContent = metadata.author;
    }

    if (smallElement) {
        smallElement.textContent = metadata.extra || metadata.provider || "Spotify";
    }
}

function initializePlaylistMetadata() {
    playlistCards.forEach((card) => {
        const titleElement = card.querySelector(".playlist-copy h3");
        const subtitleElement = card.querySelector(".playlist-copy p");
        const smallElement = card.querySelector(".playlist-copy small");
        const fallback = spotifyTrackMetadataFallbacks[card.dataset.spotifyUri] || {};

        if (titleElement) {
            titleElement.textContent = fallback.title || "Cargando...";
        }
        if (subtitleElement) {
            subtitleElement.textContent = fallback.author || "Spotify";
        }
        if (smallElement) {
            smallElement.textContent = fallback.extra || "Disponible en Spotify";
        }

        setSpotifyMetadata(card);
    });
}

// Open Spotify track when clicking on card
playlistCards.forEach((card) => {
    card.addEventListener("click", (e) => {
        // Don't open Spotify if clicking the play button
        if (e.target.closest(".playlist-play-btn")) {
            return;
        }
        const spotifyUri = card.dataset.spotifyUri;
        if (spotifyUri) {
            window.open(`https://open.spotify.com/track/${spotifyUri}`, "_blank");
        }
    });
});

initializePlaylistMetadata();

function getCarouselStep() {
    const firstCard = playlistCards[0];

    if (!firstCard) {
        return 0;
    }

    const gap = Number.parseFloat(getComputedStyle(firstCard.parentElement).columnGap) || 0;
    return firstCard.getBoundingClientRect().width + gap;
}

function updateCarouselButtons() {
    const maxScroll = playlistViewport.scrollWidth - playlistViewport.clientWidth - 2;

    playlistPrev.disabled = playlistViewport.scrollLeft <= 2;
    playlistNext.disabled = playlistViewport.scrollLeft >= maxScroll;
}

function movePlaylistCarousel(direction) {
    playlistViewport.scrollBy({
        left: getCarouselStep() * direction,
        behavior: "smooth",
    });
}

function updatePlaylistCards(activeButton, isPlaying) {
    playlistButtons.forEach((button) => {
        const buttonPlaying = button === activeButton && isPlaying;
        button.textContent = buttonPlaying ? "Pausa" : "Play";
        button.classList.toggle("is-playing", buttonPlaying);
        button.setAttribute("aria-pressed", String(buttonPlaying));
    });

    playlistCards.forEach((card) => {
        const belongsToActiveButton = activeButton ? card.contains(activeButton) : false;
        card.classList.toggle("is-playing", belongsToActiveButton && isPlaying);
    });
}

function playPlaylistTrack(button) {
    const card = button.closest(".playlist-card");

    if (!card) {
        return;
    }

    const spotifyUri = card.dataset.spotifyUri;
    if (!spotifyUri) {
        return;
    }

    const spotifyEmbedUrl = `https://open.spotify.com/embed/track/${spotifyUri}?autoplay=1`;

    if (button.classList.contains("is-playing")) {
        spotifyEmbed.removeAttribute("src");
        spotifyEmbedWrapper.hidden = true;
        updatePlaylistCards(button, false);
        return;
    }

    if (!radioPlayerForPlaylist.paused) {
        radioPlayerForPlaylist.pause();
    }

    spotifyEmbedWrapper.hidden = false;
    spotifyEmbed.setAttribute("src", spotifyEmbedUrl);
    updatePlaylistCards(button, true);
}

radioPlayerForPlaylist.addEventListener("play", () => {
    if (!spotifyEmbedWrapper.hidden) {
        spotifyEmbed.removeAttribute("src");
        spotifyEmbedWrapper.hidden = true;
        updatePlaylistCards(null, false);
    }
});

playlistPrev.addEventListener("click", () => movePlaylistCarousel(-1));
playlistNext.addEventListener("click", () => movePlaylistCarousel(1));
playlistViewport.addEventListener("scroll", updateCarouselButtons);
window.addEventListener("resize", updateCarouselButtons);

playlistViewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePlaylistCarousel(-1);
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        movePlaylistCarousel(1);
    }
});

playlistButtons.forEach((button) => {
    button.addEventListener("click", () => playPlaylistTrack(button));
});

updateCarouselButtons();
