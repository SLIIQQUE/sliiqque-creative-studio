import { requireUser } from "@/lib/cms/dal";
import { getNoticeRow } from "@/lib/notice";
import NoticeForm from "./NoticeForm";

export default async function NoticePage() {
  await requireUser();
  const n = await getNoticeRow();
  return <NoticeForm initial={{ enabled: n.enabled, label: n.label ?? "", message: n.message, linkLabel: n.linkLabel, linkHref: n.linkHref, hideAfter: n.hideAfter ?? "" }} saved={n.saved} />;
}
