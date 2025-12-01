// src/content.ts

interface SponsorSegment {
    segment: [number, number];
    category: string;
    UUID: string;
}

interface VideoWithSkipper extends HTMLVideoElement {
    hasSponsorSkipper?: boolean;
}

console.log("YT Skipper: Multi-Selector Clicker");

let currentVideoId: string = "";
let currentSegments: SponsorSegment[] = [];

// --- UTILS ---
const getVideoID = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
};

const showToast = (message: string) => {
    if (document.querySelector('.yt-skipper-toast')) return;
    const toast = document.createElement('div');
    toast.className = 'yt-skipper-toast';
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', color: '#fff', padding: '10px 20px', borderRadius: '50px',
        zIndex: '9999', fontSize: '14px', pointerEvents: 'none', fontWeight: 'bold'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

// --- SPONSOR FETCH ---
const fetchSponsorSegments = async (videoId: string) => {
    if (videoId === currentVideoId) return;
    currentVideoId = videoId;
    currentSegments = []; 
    try {
        const response = await fetch(
            `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=["sponsor"]`
        );
        if (response.ok) {
            currentSegments = await response.json();
        }
    } catch { /* ignore */ }
};

// --- SPONSOR SKIPPER ---
const handleSponsorSkip = (video: HTMLVideoElement) => {
    if (currentSegments.length === 0) return;
    const currentTime = video.currentTime;
    for (const seg of currentSegments) {
        const [start, end] = seg.segment;
        if (currentTime >= start && currentTime < end - 0.5) {
            video.currentTime = end;
            showToast("Skipped Sponsor");
        }
    }
};

// --- HELPER: CLICK ANY BUTTON ---
const clickSkipButton = () => {
    // List of every known Skip Button class name
    const selectors = [
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        '.videoAdUiSkipButton',
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button-slot', 
        '.ytp-ad-skip-button-container',
        '.ytp-skip-ad-button modern ytp-button'
    ];

    // Try to find ANY of them
    for (const selector of selectors) {
        const btn = document.querySelector(selector) as HTMLElement;
        if (btn) {
            btn.click();
            return true; // Stop looking if we clicked one
        }
    }
    return false;
};

// --- AD KILLER ---
const killAd = () => {
    const video = document.querySelector('video');
    if (!video) return;

    // Detection
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const playerAdClass = document.querySelector('.ad-showing');
    const isAd = adOverlay || playerAdClass;

    if (isAd) {
        // 1. Mute
        video.muted = true;

        // 2. Speed Up (16x)
        if (video.playbackRate !== 16.0) {
            video.playbackRate = 16.0;
        }

        // 3. Try to click Skip Button
        clickSkipButton();
    } 
    else {
        // Reset speed if content is playing
        if (video.playbackRate === 16.0) {
            video.playbackRate = 1.0;
        }
    }

    // Cleanup Banner Ads
    const popupCloseBtn = document.querySelector('.ytp-ad-overlay-close-button') as HTMLElement;
    if (popupCloseBtn) popupCloseBtn.click();
};

// --- OBSERVER ---
const observer = new MutationObserver(() => {
    killAd();

    const video = document.querySelector('video') as VideoWithSkipper | null;
    if (video) {
        const videoId = getVideoID();
        if (videoId && videoId !== currentVideoId) {
            fetchSponsorSegments(videoId);
        }
        
        if (!video.hasSponsorSkipper) {
            video.ontimeupdate = () => handleSponsorSkip(video);
            video.hasSponsorSkipper = true;
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true, attributes: true });

// --- CSS CURTAIN ---
// NOTE: I changed "display: none" to "opacity: 0" for the overlay.
// This keeps the button clickable even if you can't see it.
const style = document.createElement('style');
style.innerHTML = `
    /* Hide Video Content */
    .html5-video-player:has(.ytp-ad-player-overlay) video { opacity: 0 !important; }
    .ad-showing video { opacity: 0 !important; }

    /* Hide Ad UI (Make invisible but keep clickable) */
    .ytp-ad-player-overlay,
    .ytp-ad-overlay-container, 
    #player-ads,
    ytd-ad-slot-renderer { 
        opacity: 0 !important;
        pointer-events: none; /* Let clicks pass through if needed, but we handle clicks in JS */
    }
`;
document.head.appendChild(style);