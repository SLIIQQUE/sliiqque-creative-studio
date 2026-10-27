/** Published YouTube films. Add an entry the day a film goes live: it then embeds on every page listed in `pages`
 *  and emits VideoObject structured data. Leave empty until a video exists; nothing renders without an entry. */
export type Video = {
  /** YouTube video ID (the part after v=) */
  youtubeId: string;
  title: string;
  /** One or two sentences, answer-first, same wording as the YouTube description's first lines */
  description: string;
  /** ISO date the film was published, e.g. 2026-11-12 */
  uploadDate: string;
  /** ISO 8601 duration, e.g. PT8M30S */
  duration: string;
  /** Site paths that should embed this film, e.g. ["/services/ai-commercials", "/ai-commercials-lagos"] */
  pages: string[];
};

export const VIDEOS: Video[] = [];

export const videosForPath = (path: string) => VIDEOS.filter((v) => v.pages.includes(path));
