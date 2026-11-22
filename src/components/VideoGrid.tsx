"use client";

import { useState } from "react";
import VideoEmbed from "./VideoEmbed";

type Item = { youtubeId: string; title: string; description: string; type: string; orientation: "landscape" | "portrait" };

function Card({ v }: { v: Item }) {
  return (
    <article className="vgrid__item">
      <VideoEmbed youtubeId={v.youtubeId} title={v.title} portrait={v.orientation === "portrait"} />
      <p className="vgrid__type">{v.type}</p>
      <h3 className="vgrid__title">{v.title}</h3>
      {v.description ? <p className="vgrid__desc">{v.description}</p> : null}
    </article>
  );
}

/** All films, with a filter by type. Horizontal films sit in a two-up grid, vertical films in their own row below. */
export default function VideoGrid({ items, types }: { items: Item[]; types: string[] }) {
  const [type, setType] = useState("All");
  const shown = items.filter((v) => type === "All" || v.type === type);
  const wide = shown.filter((v) => v.orientation === "landscape");
  const tall = shown.filter((v) => v.orientation === "portrait");
  return (
    <>
      {types.length > 1 ? (
        <div className="vgrid__filters" role="group" aria-label="Filter films by type">
          {["All", ...types].map((t) => (
            <button key={t} type="button" className="vgrid__chip" aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      ) : null}
      {wide.length ? <div className="vgrid vgrid--wide">{wide.map((v) => <Card key={v.youtubeId} v={v} />)}</div> : null}
      {tall.length ? <div className="vgrid vgrid--tall">{tall.map((v) => <Card key={v.youtubeId} v={v} />)}</div> : null}
    </>
  );
}
