ALTER TABLE "media" DROP CONSTRAINT "media_url_unique";--> statement-breakpoint
CREATE INDEX "media_url_idx" ON "media" USING btree ("url");