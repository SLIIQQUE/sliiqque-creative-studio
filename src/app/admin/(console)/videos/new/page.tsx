import { requireUser } from "@/lib/cms/dal";
import VideoForm from "../VideoForm";
import { pageOptions } from "../options";

export default async function NewVideoPage() {
  await requireUser();
  const { services, works } = await pageOptions();
  return <VideoForm services={services} works={works} />;
}
