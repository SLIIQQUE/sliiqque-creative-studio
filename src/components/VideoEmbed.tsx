"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

/** Click-to-load YouTube embed: no third-party request until played, which keeps pages fast and cookie-free until the visitor chooses. */
export default function VideoEmbed({ youtubeId, title, portrait = false }: { youtubeId: string; title: string; portrait?: boolean }) {
  const [on, setOn] = useState(false);
  // Landscape films get the sharp 1280px thumbnail when YouTube made one; it answers a 120px placeholder when it did not.
  const [thumb, setThumb] = useState(portrait ? "hqdefault" : "maxresdefault");
  return (
    <div className={`video${portrait ? " video--portrait" : ""}`}>
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" className="video__play" onClick={() => { setOn(true); track("video_play", { id: youtubeId }); }} aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/${thumb}.jpg`}
            alt=""
            loading="lazy"
            width={portrait ? 360 : 640}
            height={portrait ? 640 : 360}
            onLoad={(e) => { if (thumb === "maxresdefault" && e.currentTarget.naturalWidth <= 120) setThumb("hqdefault"); }}
            onError={() => setThumb("hqdefault")}
          />
          <span className="video__icon" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
