// src/content.ts

// 1. Types
interface SponsorSegment {
    segment: [number, number];
    category: string;
    UUID: string;
}

interface VideoWithSkipper extends HTMLVideoElement {
    hasSponsorSkipper?: boolean;
}

console.log("YT Ultimate Skipper: Aggressive Mode");

let currentVideoId: string = "";
let currentSegments: SponsorSegment[] = [];

// --- UTILS ---
const getVideoID = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
};

const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: '#212121', color: '#fff', padding: '12px 24px', borderRadius: '25px',
        zIndex: '9999', fontSize: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', pointerEvents: 'none',
        fontFamily: 'Roboto, Arial, sans-serif'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
};

// --- SPONSOR DATA ---
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
            console.log("Sponsors loaded:", currentSegments.length);
        }
    } catch { 
        console.log("No sponsor data.");
    }
};

// --- THE CORE LOOP (Runs constantly) ---
const handleTimeUpdate = (video: HTMLVideoElement) => {
    // === PRIORITY 1: KILL ADS INSTANTLY ===
    // We check this inside the time loop for maximum speed
    const adShowing = document.querySelector('.ad-showing');
    
    if (adShowing) {
        // 1. Mute
        video.muted = true;
        
        // 2. Fast Forward
        if (isFinite(video.duration)) {
             video.currentTime = video.duration;
        }
        
        // 3. Click Buttons (Brute Force)
        const skipBtn = document.querySelector('.ytp-ad-skip-button') as HTMLElement;
        const skipBtnModern = document.querySelector('.ytp-ad-skip-button-modern') as HTMLElement;
        if (skipBtn) skipBtn.click();
        if (skipBtnModern) skipBtnModern.click();

        // If ad is active, we stop here. Do not process sponsors.
        return;
    }

    // === PRIORITY 2: SKIP SPONSORS ===
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

// --- SETUP ---
const runSkipper = () => {
  const video = document.querySelector('video') as VideoWithSkipper | null;

  // 1. Check for new video ID (Navigation)
  const videoId = getVideoID();
  if (videoId && videoId !== currentVideoId) {
      fetchSponsorSegments(videoId);
  }

  // 2. Attach The Loop
  // This is the secret. We attach our logic to the video's internal clock.
  if (video && !video.hasSponsorSkipper) {
      video.ontimeupdate = () => handleTimeUpdate(video);
      video.hasSponsorSkipper = true;
  }
};

// --- WATCHER ---
const observer = new MutationObserver(() => {
    runSkipper();
    
    // Banner remover
    const overlay = document.querySelector('.ytp-ad-overlay-close-button') as HTMLElement;
    if (overlay) overlay.click();
    
    // Hide static ads via CSS (inline check)
    const adSlots = document.querySelectorAll('.ytd-ad-slot-renderer');
    adSlots.forEach(slot => (slot as HTMLElement).style.display = 'none');
});

observer.observe(document.body, { childList: true, subtree: true });