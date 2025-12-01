📺 YT Skipper (React + TypeScript Extension)

A high-performance Chrome Extension that automatically detects and skips YouTube video ads, hides banner ads, and skips in-video sponsored segments using the SponsorBlock API.

Built with React, TypeScript, and Vite.

⚡ Features
1. The "Speedrun" Ad Skipper

Unlike other blockers that try to "delete" ads (which crashes the player), this extension uses a Hybrid Strategy:

Detection: Uses MutationObserver to detect ads the millisecond they inject into the DOM.

16x Speed: Instantly sets playback rate to 16.0 (the browser maximum) to fast-forward through unskippable ads.

Auto-Click: Brute-forces clicks on 6+ different variations of the "Skip" button.

2. "Blackout" Curtain

Uses aggressive CSS injection (opacity: 0 !important) to make the ad video player invisible while it fast-forwards.

Prevents the user from seeing the "flicker" of ads.

Instantly mutes audio during the ad phase.

3. SponsorBlock Integration

Fetches crowd-sourced data for the current video ID.

Automatically jumps over "Sponsor," "Intro," and "Self-Promo" segments.

Displays a non-intrusive "Skipped Sponsor" toast notification.

4. DOM Cleaning

Removes static banner ads (#player-ads, ytd-ad-slot-renderer).

Removes popup overlays (.ytp-ad-overlay-container).

🛠️ Tech Stack

Core: React (v18), TypeScript

Build Tool: Vite (configured for Chrome Extensions)

Browser APIs: MutationObserver, requestAnimationFrame, chrome.storage, fetch

🚀 Installation & Setup
Prerequisites

Node.js (v20 or higher)

Google Chrome (or Kiwi Browser for Android)

1. Build the Project

Clone the repo and install dependencies:

code
Bash
download
content_copy
expand_less
npm install

Build the extension (compiles TypeScript to dist/):

code
Bash
download
content_copy
expand_less
npm run build
2. Load into Chrome

Open Chrome and navigate to chrome://extensions.

Enable Developer Mode (top right toggle).

Click Load Unpacked.

Select the dist folder created in the previous step.

📱 How to use on Android

Since standard Chrome on Android does not support extensions, you must use Kiwi Browser.

Transfer the dist folder to your phone (via USB, Drive, etc.).

Open Kiwi Browser.

Go to chrome://extensions and enable Developer Mode.

Load the dist folder.

Go to m.youtube.com — the extension works natively on mobile web!

🧠 How it Works (Under the Hood)

The Ad Loop:
The extension ignores setInterval (which causes performance issues) and relies on CSS Selectors to determine state.

It checks for the .ytp-ad-player-overlay class.

If found: MUTE -> SPEED 16x -> CLICK BUTTON.

If not found: SPEED 1x.

The Sponsor Loop:

On navigation, it fetches segments: https://sponsor.ajay.app/api/skipSegments?videoID={id}.

It hooks into video.ontimeupdate.

If currentTime falls within a sponsor range, it sets video.currentTime = segmentEnd.

⚠️ Disclaimer

This project is for educational purposes only. It is designed to demonstrate DOM manipulation, React/Vite configuration for extensions, and interaction with browser APIs. I am not affiliated with YouTube or Google.

🤝 Contributing

Fork the repository.

Create a feature branch.

Commit your changes.

Open a Pull Request.