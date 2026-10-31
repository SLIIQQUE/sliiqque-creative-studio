import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { SERVICE_PAGES } from "@/data/services";
import { requireUser } from "@/lib/cms/dal";
import { dateToLagosLocal, formatLagos } from "@/lib/cms/dates";
import { PRICE_TOKEN_LABELS } from "@/lib/cms/prices";
import { getPostForEdit, listCategories, listMedia, listRevisions, listUsers } from "@/lib/cms/queries";
import { db } from "@/db/client";
import { posts } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { SITE_URL } from "@/lib/seo";
import type { PriceToken } from "@/lib/cms/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const post = await getPostForEdit(id);
  if (!post) notFound();
  const [categories, users, media, revisions] = await Promise.all([listCategories(), listUsers(), listMedia(), listRevisions(id)]);
  const related = post.relatedIds.length ? await db.select({ id: posts.id, title: posts.title }).from(posts).where(inArray(posts.id, post.relatedIds)) : [];
  const order = new Map(post.relatedIds.map((rid, i) => [rid, i]));
  related.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return (
    <PostEditor
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        status: post.status,
        listed: post.listed,
        isConcept: post.isConcept,
        categoryId: post.categoryId,
        serviceSlug: post.serviceSlug,
        authorId: post.authorId,
        heroMediaId: post.heroMediaId,
        seo: post.seo,
        faq: post.faq,
        relatedIds: post.relatedIds,
        scheduledForLocal: dateToLagosLocal(post.scheduledFor),
        publishedAtLabel: post.publishedAt ? formatLagos(post.publishedAt) : "",
        scheduledLabel: post.scheduledFor ? formatLagos(post.scheduledFor) : "",
      }}
      categories={categories.map((c) => ({ id: c.id, name: c.name, serviceSlug: c.serviceSlug }))}
      services={SERVICE_PAGES.map((s) => ({ slug: s.slug, name: s.name }))}
      authors={users.filter((u) => !u.disabled).map((u) => ({ id: u.id, name: u.name }))}
      media={media.map((m) => ({ id: m.id, url: m.url, alt: m.alt }))}
      related={related}
      revisions={revisions.map((r) => ({ id: r.id, title: r.title, savedAtLabel: formatLagos(r.savedAt), note: r.note, savedBy: r.savedBy }))}
      priceTokens={Object.entries(PRICE_TOKEN_LABELS) as [PriceToken, string][]}
      role={user.role}
      siteOrigin={SITE_URL}
      nonce={nonce}
    />
  );
}
