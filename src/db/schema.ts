import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { Doc, FaqItem, SeoFields } from "@/lib/cms/types";

export const roleEnum = pgEnum("role", ["owner", "editor"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "scheduled", "published", "archived"]);

const stamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("editor"),
  title: varchar("title", { length: 255 }),
  disabled: boolean("disabled").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...stamps,
});

/** One-time sign-in links. Only the SHA-256 of the token is stored. */
export const loginTokens = pgTable(
  "login_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_tokens_user_idx").on(t.userId)],
);

/** Server-side sessions, so a session can be revoked. Only the SHA-256 of the cookie value is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Small counter table for rate limiting sign-in and uploads. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: varchar("key", { length: 255 }).notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    hits: integer("hits").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  /** Slug from src/data/services.ts. The admin never creates a service. */
  serviceSlug: varchar("service_slug", { length: 120 }),
  ...stamps,
});

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Public URL or site path the image is rendered from, e.g. /img/foo.jpg or a Blob URL. */
  /** Not unique: an image that ships in public/img can have one row per use, each with its own alt text. */
  url: text("url").notNull(),
  /** Storage key for files this admin uploaded. Null for images that ship in public/img. */
  storageKey: text("storage_key"),
  mime: varchar("mime", { length: 100 }).notNull(),
  bytes: integer("bytes"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull(),
  caption: text("caption"),
  blurDataUrl: text("blur_data_url"),
  focalX: smallint("focal_x"),
  focalY: smallint("focal_y"),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  ...stamps,
}, (t) => [index("media_url_idx").on(t.url)]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: jsonb("body").$type<Doc>().notNull(),
    status: postStatusEnum("status").notNull().default("draft"),
    /** Replaces BLOGS_LISTED: false hides a published post from the journal grid but keeps its URL live. */
    listed: boolean("listed").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    /** Overrides the category's default service. */
    serviceSlug: varchar("service_slug", { length: 120 }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    heroMediaId: uuid("hero_media_id").references(() => media.id, { onDelete: "set null" }),
    isConcept: boolean("is_concept").notNull().default(false),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    seo: jsonb("seo").$type<SeoFields>().notNull().default(sql`'{}'::jsonb`),
    faq: jsonb("faq").$type<FaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    ...stamps,
  },
  (t) => [
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
    uniqueIndex("posts_slug_lower_idx").on(sql`lower(${t.slug})`),
  ],
);

export const postRevisions = pgTable(
  "post_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: jsonb("body").$type<Doc>().notNull(),
    savedBy: uuid("saved_by").references(() => users.id, { onDelete: "set null" }),
    note: varchar("note", { length: 255 }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("post_revisions_post_idx").on(t.postId, t.savedAt)],
);

export const postMedia = pgTable(
  "post_media",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").notNull().references(() => media.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.mediaId] })],
);

export const postRelated = pgTable(
  "post_related",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    relatedPostId: uuid("related_post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.postId, t.relatedPostId] })],
);

export const redirects = pgTable("redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromPath: varchar("from_path", { length: 512 }).notNull().unique(),
  toPath: varchar("to_path", { length: 512 }).notNull(),
  code: smallint("code").notNull().default(308),
  ...stamps,
});

/** Singleton row (id is always 1). */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  journalTitle: varchar("journal_title", { length: 255 }).notNull().default("SLIIQQUE Studio journal"),
  journalDescription: text("journal_description").notNull().default(""),
  postsPerPage: integer("posts_per_page").notNull().default(6),
  defaultShareMediaId: uuid("default_share_media_id").references(() => media.id, { onDelete: "set null" }),
  schedulerLastRunAt: timestamp("scheduler_last_run_at", { withTimezone: true }),
  indexNowLastStatus: varchar("index_now_last_status", { length: 255 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userEmail: varchar("user_email", { length: 320 }),
    action: varchar("action", { length: 80 }).notNull(),
    entity: varchar("entity", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_at_idx").on(t.at)],
);
