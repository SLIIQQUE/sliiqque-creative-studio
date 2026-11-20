CREATE TABLE "works" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" varchar(160) NOT NULL,
	"service" varchar(200) NOT NULL,
	"year" varchar(12) NOT NULL,
	"card_media_id" uuid NOT NULL,
	"overview" text DEFAULT '' NOT NULL,
	"challenge" text DEFAULT '' NOT NULL,
	"results" text DEFAULT '' NOT NULL,
	"conclusion" text DEFAULT '' NOT NULL,
	"duo_media_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"wide_media_id" uuid,
	"service_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"age_gate" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "works_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_card_media_id_media_id_fk" FOREIGN KEY ("card_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "works" ADD CONSTRAINT "works_wide_media_id_media_id_fk" FOREIGN KEY ("wide_media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "works_sort_idx" ON "works" USING btree ("sort_order");