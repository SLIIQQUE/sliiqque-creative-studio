import JsonLd from "./JsonLd";
import Reveal from "./Reveal";
import VideoEmbed from "./VideoEmbed";
import { videosForPath } from "@/data/videos";
import { ORG_ID } from "@/lib/seo";

/** The studio's YouTube films for a page, with VideoObject schema. Renders nothing until a film is listed in src/data/videos.ts. */
export default function VideoBlock({ path }: { path: string }) {
  const videos = videosForPath(path);
  if (!videos.length) return null;
  return (
    <>
      <JsonLd
        data={videos.map((v) => ({
          "@context": "https://schema.org", "@type": "VideoObject", name: v.title, description: v.description,
          thumbnailUrl: [`https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`], uploadDate: v.uploadDate, duration: v.duration,
          embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`, contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
          publisher: { "@id": ORG_ID }, inLanguage: "en-NG",
        }))}
      />
      {videos.map((v) => (
        <Reveal className="split" key={v.youtubeId}>
          <h2 className="t-h4">Watch</h2>
          <div><VideoEmbed youtubeId={v.youtubeId} title={v.title} /><p className="video__cap">{v.title}</p></div>
        </Reveal>
      ))}
    </>
  );
}
