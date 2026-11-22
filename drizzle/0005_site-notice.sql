CREATE TABLE "site_notice" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"label" varchar(40),
	"message" text NOT NULL,
	"link_label" varchar(60),
	"link_href" varchar(512),
	"hide_after" varchar(10),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
