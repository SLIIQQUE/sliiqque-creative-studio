// Seeds the owner account, journal categories and the settings row. Safe to re-run.
// Usage: npx tsx --env-file=.env.local scripts/seed-cms.mts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, settings, users } from "../src/db/schema";

const url = process.env.DATABASE_URL;
const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
if (!url) throw new Error("DATABASE_URL is not set");
if (!ownerEmail) throw new Error("OWNER_EMAIL is not set");

const client = postgres(url, { max: 1 });
const db = drizzle(client);

// Category to service mapping mirrors CATEGORY_SERVICE in src/data/services.ts.
const CATEGORIES: [slug: string, name: string, service: string][] = [
  ["commercials", "Commercials", "ai-commercials"],
  ["digital-humans", "Digital Humans", "ai-ugc-digital-humans"],
  ["photography", "Photography", "ai-photography"],
  ["fashion", "Fashion", "ai-fashion-imagery"],
  ["studio", "Studio", "brand-launches-campaigns"],
  ["process", "Process", "ai-commercials"],
  ["post-production", "Post-production", "ai-photography"],
];

await db
  .insert(users)
  .values({ email: ownerEmail, name: "Gabriel Njoabozia", role: "owner", title: "Founder" })
  .onConflictDoNothing({ target: users.email });

for (const [slug, name, serviceSlug] of CATEGORIES) {
  await db.insert(categories).values({ slug, name, serviceSlug }).onConflictDoNothing({ target: categories.slug });
}
await db.insert(settings).values({ id: 1 }).onConflictDoNothing({ target: settings.id });

console.log(`Seeded owner ${ownerEmail}, ${CATEGORIES.length} categories and settings.`);
await client.end();
