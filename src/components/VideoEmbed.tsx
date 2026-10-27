"use client";

import { track } from "@vercel/analytics";
import { useState } from "react";

/** Click-to-load YouTube embed: no third-party request until played, which keeps pages fast and cookie-free until the visitor chooses. */
export default function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="video">
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" className="video__play" onClick={() => { setOn(true); track("video_play", { id: youtubeId }); }} aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" width={480} height={360} />
          <span className="video__icon" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
