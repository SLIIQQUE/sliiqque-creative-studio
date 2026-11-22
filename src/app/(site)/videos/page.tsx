import JsonLd from "@/components/JsonLd";
import VideoGrid from "@/components/VideoGrid";
import { PageHero, Btn } from "@/components/ui";
import { VIDEO_TYPES } from "@/lib/video-utils";
import { abs, breadcrumbSchema, pageMeta } from "@/lib/seo";
import { getVideos, videoSchema } from "@/lib/videos";

export const metadata = pageMeta({
  title: "Videos: AI Commercials, UGC and Digital Humans",
  description: "Films by SLIIQQUE Studio in Lagos: AI commercials, AI UGC ads, digital humans and fashion imagery. Watch the work, then start your own.",
  path: "/videos",
  keywords: ["AI commercial examples", "AI UGC ad examples", "digital human video", "AI video production Lagos"],
});

const BREADCRUMB = [{ name: "Home", path: "/" }, { name: "Videos", path: "/videos" }];

export default async function VideosPage() {
  const videos = await getVideos();
  const present = new Set(videos.map((v) => v.type));
  const types = VIDEO_TYPES.filter((t) => present.has(t));
  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "CollectionPage", name: "SLIIQQUE Studio videos", url: abs("/videos") },
          ...videos.map(videoSchema),
          breadcrumbSchema(BREADCRUMB),
        ]}
      />
      <PageHero h1="Videos" sub="Commercials, UGC and digital humans, made as systems. Press play." className="page-hero--flush" breadcrumb={BREADCRUMB} />
      <section className="sec sec--last">
        <div className="container">
          {videos.length ? (
            <VideoGrid items={videos} types={[...types, ...[...present].filter((t) => !(VIDEO_TYPES as readonly string[]).includes(t))]} />
          ) : (
            <p>New films are on the way. In the meantime, see the <a href="/works">concept work</a>.</p>
          )}
          <p className="services-note">Want a film like these for your brand? <Btn href="/contact">Start a project</Btn></p>
        </div>
      </section>
    </>
  );
}
