import JsonLd from "./JsonLd";
import Reveal from "./Reveal";
import VideoEmbed from "./VideoEmbed";
import { videoSchema, videosForPath } from "@/lib/videos";

/** The studio's YouTube films for a page, with VideoObject schema. Renders nothing until a film is attached to the page in the admin. */
export default async function VideoBlock({ path }: { path: string }) {
  const videos = await videosForPath(path);
  if (!videos.length) return null;
  return (
    <>
      <JsonLd data={videos.map(videoSchema)} />
      {videos.map((v) => (
        <Reveal className="split" key={v.youtubeId}>
          <h2 className="t-h4">Watch</h2>
          <div><VideoEmbed youtubeId={v.youtubeId} title={v.title} portrait={v.orientation === "portrait"} /><p className="video__cap">{v.title}</p></div>
        </Reveal>
      ))}
    </>
  );
}
