export type PreviewKind = "image" | "video" | "audio" | "pdf" | "text" | "none";

// Types browsers render natively. Anything else (HEIC, MKV, AVI, DOCX, ZIP...) → "none".
const IMAGE = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "image/avif", "image/svg+xml", "image/bmp", "image/x-icon",
]);
const VIDEO = new Set(["video/mp4", "video/webm", "video/ogg"]);
const AUDIO = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg",
  "audio/webm", "audio/aac", "audio/mp4", "audio/x-m4a", "audio/flac",
]);
const TEXT_EXTRA = new Set([
  "application/json", "application/xml", "application/javascript",
  "application/x-yaml", "application/sql",
]);

export function getPreviewKind(rawMime: string | null | undefined): PreviewKind {
  if (!rawMime) return "none";
  const mime = rawMime.split(";")[0].trim().toLowerCase(); // strip "; charset=utf-8"

  if (IMAGE.has(mime)) return "image";
  if (VIDEO.has(mime)) return "video";
  if (AUDIO.has(mime)) return "audio";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("text/") || TEXT_EXTRA.has(mime)) return "text";
  return "none";
}

export function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot + 1).toUpperCase() : "FILE";
}

export function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null) return null;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}