import JsonLd from "./JsonLd";
import Reveal from "./Reveal";
import VideoEmbed from "./VideoEmbed";
import { videoSchema, videosForPath, type VideoItem } from "@/lib/videos";

const LANDSCAPE = 16 / 9;
const PORTRAIT = 9 / 16;

function Figure({ v, className = "" }: { v: VideoItem; className?: string }) {
  const portrait = v.orientation === "portrait";
  return (
    <figure className={`vfig ${portrait ? "vfig--tall" : "vfig--wide"} ${className}`.trim()} style={{ "--ar": portrait ? PORTRAIT : LANDSCAPE } as React.CSSProperties}>
      <VideoEmbed youtubeId={v.youtubeId} title={v.title} portrait={portrait} />
      <figcaption className="vfig__cap"><span>{v.type}</span>{v.title}</figcaption>
    </figure>
  );
}

/**
 * The studio's YouTube films for a page, with VideoObject schema. Renders nothing until a film is attached to the page in the admin.
 * One "Watch" section, laid out by the mix of shapes so horizontal and vertical films never sit in mismatched boxes:
 * - a single film at its own shape;
 * - one horizontal film with one or two vertical ones side by side at the same height;
 * - otherwise horizontal films in a two-up grid and vertical films in a tidy row below.
 */
export default async function VideoBlock({ path }: { path: string }) {
  const videos = await videosForPath(path);
  if (!videos.length) return null;
  const wide = videos.filter((v) => v.orientation !== "portrait");
  const tall = videos.filter((v) => v.orientation === "portrait");
  const mode = videos.length === 1 ? "single" : wide.length === 1 && tall.length >= 1 && tall.length <= 2 ? "row" : "stack";

  return (
    <>
      <JsonLd data={videos.map((v) => videoSchema(v, path))} />
      <Reveal className="split">
        <h2 className="t-h4">Watch</h2>
        {mode === "single" ? (
          <div className="vblock vblock--single"><Figure v={videos[0]} /></div>
        ) : mode === "row" ? (
          <div className="vblock vblock--row">{[wide[0], ...tall].map((v) => <Figure key={v.youtubeId} v={v} />)}</div>
        ) : (
          <div className="vblock vblock--stack">
            {wide.length > 0 && <div className="vblock__wide">{wide.map((v) => <Figure key={v.youtubeId} v={v} />)}</div>}
            {tall.length > 0 && <div className="vblock__tall" style={{ "--cols": Math.min(tall.length, 4) } as React.CSSProperties}>{tall.map((v) => <Figure key={v.youtubeId} v={v} />)}</div>}
          </div>
        )}
      </Reveal>
    </>
  );
}
