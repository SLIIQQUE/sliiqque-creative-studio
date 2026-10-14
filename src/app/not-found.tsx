import type { Metadata } from "next";
import NotFoundView from "./NotFoundView";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page does not exist or has moved. Find SLIIQQUE's AI commercials, AI UGC, digital humans and AI photography services from the homepage.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
