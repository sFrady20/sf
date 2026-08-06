//formats the audio converter knows. audio formats convert both ways,
//video formats are input-only — you rip the audio out of them.
//every valid from/to pair = one seo page

export type AudioFormat = {
  slug: string;
  label: string;
  mime: string;
  //lossy outputs get a bitrate control
  lossy: boolean;
  //video containers can only be inputs
  inputOnly?: boolean;
  extensions: string[];
  //a couple of plain sentences for the seo prose under the tool
  about: string;
};

export const audioFormats: AudioFormat[] = [
  {
    slug: "mp3",
    label: "MP3",
    mime: "audio/mpeg",
    lossy: true,
    extensions: ["mp3"],
    about:
      "MP3 is the most widely supported audio format there is — every browser, player, car stereo, and podcast app reads it. It's lossy, so quality is traded for file size, but at 192 kbps and up most listeners can't tell.",
  },
  {
    slug: "wav",
    label: "WAV",
    mime: "audio/wav",
    lossy: false,
    extensions: ["wav"],
    about:
      "WAV is uncompressed PCM audio — the raw samples with a small header. It's the standard interchange format for recording, sampling, and production work, at the cost of roughly 10 MB per minute of stereo.",
  },
  {
    slug: "aiff",
    label: "AIFF",
    mime: "audio/aiff",
    lossy: false,
    extensions: ["aiff", "aif", "aifc"],
    about:
      "AIFF is Apple's uncompressed audio format — the same raw PCM as WAV in a different wrapper, dating back to 1988. It's still the native interchange format for Logic Pro and much of the mac production world, and converts to WAV with zero quality change.",
  },
  {
    slug: "flac",
    label: "FLAC",
    mime: "audio/flac",
    lossy: false,
    extensions: ["flac"],
    about:
      "FLAC is lossless compression for audio — bit-identical to the source at roughly half the size of WAV. It's the archival format of choice for music collections and masters.",
  },
  {
    slug: "ogg",
    label: "OGG",
    mime: "audio/ogg",
    lossy: true,
    extensions: ["ogg", "oga"],
    about:
      "OGG Vorbis is a free, open lossy codec that beats MP3 at equivalent bitrates. It's common in game audio and open-source software, and every modern browser plays it.",
  },
  {
    slug: "m4a",
    label: "M4A",
    mime: "audio/mp4",
    lossy: true,
    extensions: ["m4a", "aac"],
    about:
      "M4A is AAC audio in an MP4 container — the default format of the Apple ecosystem and most streaming services. AAC compresses more efficiently than MP3, so the same bitrate sounds a little better.",
  },
  {
    slug: "opus",
    label: "Opus",
    mime: "audio/opus",
    lossy: true,
    extensions: ["opus"],
    about:
      "Opus is the newest codec here and the most efficient — it outperforms MP3, Vorbis, and AAC at low bitrates, which is why WhatsApp, Discord, and WebRTC all use it. Support is universal in browsers, patchier in older hardware.",
  },
  {
    slug: "mp4",
    label: "MP4",
    mime: "video/mp4",
    lossy: true,
    inputOnly: true,
    extensions: ["mp4", "m4v"],
    about:
      "MP4 is the standard video container on the web. Extracting its audio track is a quick way to turn a music video, lecture, or recording into a listenable file.",
  },
  {
    slug: "mov",
    label: "MOV",
    mime: "video/quicktime",
    lossy: true,
    inputOnly: true,
    extensions: ["mov", "qt"],
    about:
      "MOV is Apple's QuickTime container, the default for iPhone recordings and screen captures on macOS. The audio track inside is usually AAC, which converts cleanly to anything here.",
  },
  {
    slug: "webm",
    label: "WebM",
    mime: "video/webm",
    lossy: true,
    inputOnly: true,
    extensions: ["webm"],
    about:
      "WebM is the open web video container used by browser screen recorders and much of YouTube. Its audio track is typically Opus or Vorbis.",
  },
  {
    slug: "mkv",
    label: "MKV",
    mime: "video/x-matroska",
    lossy: true,
    inputOnly: true,
    extensions: ["mkv"],
    about:
      "MKV is the Matroska container — a flexible box that can hold nearly any codec. OBS and most screen recorders write it by default.",
  },
];

export const audioOutputs = audioFormats.filter((f) => !f.inputOnly);

export const getAudioFormat = (slug: string) =>
  audioFormats.find((f) => f.slug === slug);

//mime first, extension as fallback — file inputs lie about type constantly,
//and browsers love x- prefixed subtypes (audio/x-aiff, audio/x-wav)
const normMime = (m: string) => m.replace("/x-", "/");
export const detectAudioFormat = (file: File) => {
  const byMime = audioFormats.find(
    (f) => normMime(f.mime) === normMime(file.type),
  );
  if (byMime) return byMime;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return audioFormats.find((f) => f.extensions.includes(ext));
};

export type AudioPair = {
  slug: string;
  from: AudioFormat;
  to: AudioFormat;
};

export const audioPairs: AudioPair[] = audioFormats.flatMap((from) =>
  audioOutputs
    .filter((to) => to.slug !== from.slug)
    .map((to) => ({ slug: `${from.slug}-to-${to.slug}`, from, to })),
);

export const getAudioPair = (slug: string) =>
  audioPairs.find((p) => p.slug === slug);
