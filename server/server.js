const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const app = express();

require("dotenv").config();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());

const DOWNLOAD_DIR = path.join(os.homedir(), "Downloads");

function getResolutionLabel(f) {
  const h = f.height;
  if (!h) return null;
  if (h >= 4320) return "4320p 8K";
  if (h >= 2160) return "2160p 4K";
  if (h >= 1440) return "1440p 2K";
  if (h >= 1080) return "1080p HD";
  if (h >= 720) return "720p";
  if (h >= 480) return "480p";
  if (h >= 360) return "360p";
  if (h >= 240) return "240p";
  return "144p";
}

function getResolutionOrder(label) {
  const order = [
    "4320p 8K",
    "2160p 4K",
    "1440p 2K",
    "1080p HD",
    "720p",
    "480p",
    "360p",
    "240p",
    "144p",
  ];
  return order.indexOf(label);
}

function formatSize(bytes) {
  if (!bytes) return null;
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}

app.get("/formats", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url required" });

  const proc = spawn("yt-dlp", ["--dump-json", "--no-playlist", url]);

  let chunks = [];
  let err = "";

  proc.stdout.on("data", (c) => chunks.push(c));
  proc.stderr.on("data", (c) => (err += c.toString()));

  proc.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: err || "yt-dlp failed" });
    }

    try {
      const info = JSON.parse(Buffer.concat(chunks).toString());

      const raw = (info.formats || []).filter((f) => {
        if (!f.ext || f.format_note === "storyboard") return false;
        const hasBoth = f.acodec !== "none" && f.vcodec !== "none";
        const isAudioOnly = f.vcodec === "none" && f.acodec !== "none";
        return hasBoth || isAudioOnly;
      });

      const videoMap = new Map();

      for (const f of raw) {
        if (f.vcodec === "none") continue;
        const label = getResolutionLabel(f);
        if (!label) continue;

        const score = f.tbr || f.filesize || 0;
        const existing = videoMap.get(label);
        const existingScore = existing ? (existing.tbr || existing.filesize || 0) : -1;

        if (!existing || score > existingScore) {
          videoMap.set(label, { ...f, _label: label });
        }
      }

      const videoFormats = Array.from(videoMap.values())
        .sort((a, b) => getResolutionOrder(a._label) - getResolutionOrder(b._label))
        .map((f) => ({
          id: f.format_id,
          label: f._label,
          ext: f.ext,
          resolution: f.resolution || `${f.width}x${f.height}`,
          filesize: f.filesize || f.filesize_approx || null,
          filesizeLabel: formatSize(f.filesize || f.filesize_approx),
        }));

      const audioMap = new Map();

      for (const f of raw) {
        if (f.vcodec !== "none") continue;

        const codec = f.acodec?.split(".")[0] || "unknown";
        const score = f.abr || 0;

        const existing = audioMap.get(codec);
        const existingScore = existing ? (existing.abr || 0) : -1;

        if (!existing || score > existingScore) {
          audioMap.set(codec, f);
        }
      }

      const audioFormats = Array.from(audioMap.values())
        .sort((a, b) => (b.abr || 0) - (a.abr || 0))
        .map((f) => ({
          id: f.format_id,
          label: `${(f.acodec?.split(".")[0] || "Audio").toUpperCase()}${f.abr ? " · " + Math.round(f.abr) + "kbps" : ""}`,
          ext: f.ext,
          resolution: "audio only",
          filesize: f.filesize || f.filesize_approx || null,
          filesizeLabel: formatSize(f.filesize || f.filesize_approx),
        }));

      const mp3Format = {
        id: "__mp3__",
        label: "MP3 · Best quality",
        ext: "mp3",
        resolution: "audio only",
        filesize: null,
        filesizeLabel: null,
      };

      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        webpage_url: info.webpage_url,
        formats: [...videoFormats, mp3Format, ...audioFormats],
      });
    } catch {
      res.status(500).json({ error: "parse error" });
    }
  });
});

app.post("/download", (req, res) => {
  const { url, formatId } = req.body;
  if (!url) return res.status(400).json({ error: "url required" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
  });

  res.socket.setNoDelay(true);
  res.flushHeaders();

  const send = (d) => {
    res.write(`data: ${JSON.stringify(d)}\n\n`);
    res.flush?.();
  };

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
    res.flush?.();
  }, 15000);

  const isMp3 = formatId === "__mp3__";

  const args = [
    "--newline",
    "--progress",
    "--no-quiet",
    "--no-playlist",
    "--no-part",
    "--no-colors",
    "-o",
    path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s"),
  ];

  if (isMp3) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else if (formatId) {
    args.push("-f", formatId);
  }

  args.push(url);

  const proc = spawn("yt-dlp", args, {
    env: {
      ...process.env,
      PYTHONUNBUFFERED: "1",
      PYTHONIOENCODING: "utf-8",
    },
  });

  proc.on("error", (e) => {
    clearInterval(heartbeat);
    send({ type: "error", message: e.message });
    res.end();
  });

  function parseLine(line) {
    const t = line.trim();
    if (!t) return;

    const progressMatch = t.match(/\[download\]\s+([\d.]+)%.*?at\s+(.+?)\s+ETA\s+(.+)/);

    if (progressMatch) {
      send({
        type: "progress",
        percent: Number(progressMatch[1]),
        speed: progressMatch[2].trim(),
        eta: progressMatch[3].trim(),
      });
      return;
    }

    send({ type: "log", message: t });
  }

  let stdoutBuf = "";
  proc.stdout.on("data", (chunk) => {
    stdoutBuf += chunk.toString();
    const lines = stdoutBuf.split("\n");
    stdoutBuf = lines.pop();
    for (const line of lines) parseLine(line);
  });

  let stderrBuf = "";
  proc.stderr.on("data", (chunk) => {
    stderrBuf += chunk.toString();
    const lines = stderrBuf.split("\n");
    stderrBuf = lines.pop();
    for (const line of lines) parseLine(line);
  });

  proc.on("close", (code) => {
    clearInterval(heartbeat);

    send({
      type: code === 0 ? "done" : "error",
      message: code === 0 ? "Download complete" : `failed (${code})`,
    });

    res.end();
  });
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running ...`);
});