# VIDO

**Multi-source video extraction protocol — free, open source, containerized, no ads.**

VIDO is a self-hosted video downloader built on [yt-dlp](https://github.com/yt-dlp/yt-dlp), wrapped in a clean terminal-aesthetic UI. Paste a link, pick a format, download. No accounts, no tracking, no ads, no limits.

---

## Features

### Multi-source support
Download from 1800+ supported sites including YouTube, Twitter/X, Facebook, Instagram, TikTok, Vimeo, Twitch, SoundCloud, and many more — anything yt-dlp supports, VIDO supports.

### Format selection
Before downloading, VIDO fetches all available formats for the video and lets you choose exactly what you want — resolution, codec, file size. No blind downloading.

### Video quality options
Choose from all available resolutions: 144p up to 8K, organized and deduplicated so you always see the best stream per quality tier.

### Audio extraction
Download audio-only formats in their native codec (AAC, Opus, etc.) or convert directly to MP3 at best quality with a single click — no extra tools needed.

### Real-time progress
A live progress bar shows download percentage, transfer speed, and ETA as the download happens — streamed in real time via SSE (Server-Sent Events).

### Pause & resume
Pause the progress display at any time and resume without losing state. Cancel the download entirely and kill the underlying process cleanly.

### Download history
Every completed download is logged locally with title, thumbnail, format, and timestamp. Search, browse, and manage your history — or clear it all at once.

### No ads, no telemetry
VIDO collects nothing. No analytics, no tracking, no third-party scripts. Your downloads stay between you and your machine.

### Docker containerized
VIDO ships as a Docker Compose stack. One command and it's running — no Node or Python setup required on the host.

### Self-hosted
You own the server. Downloads go straight to your machine's `~/Downloads` folder. Nothing passes through any third-party service.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js (raw HTTP, no framework) |
| Downloader | yt-dlp |
| Streaming | Server-Sent Events (SSE) |
| Containerization | Docker + Docker Compose |

---

## Getting started

### With Docker (recommended)

```bash
git clone https://github.com/yourname/vido.git
cd vido
./install.sh
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Usage

1. Paste a video URL into the input field
2. Click **Scan** — VIDO fetches all available formats
3. Select a video resolution or audio format from the list
4. Click **Download**
5. Watch the real-time progress bar
6. Find your file in `~/Downloads`

---

## Supported sites (sample)

YouTube · Twitter/X · Facebook · Instagram · TikTok · Vimeo · Twitch · SoundCloud · Dailymotion · Reddit · Bilibili · Rumble · and 1800+ more via yt-dlp

Full list: [yt-dlp supported sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

---




