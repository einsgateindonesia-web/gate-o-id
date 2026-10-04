CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"category" text DEFAULT 'Lainnya' NOT NULL,
	"image" text DEFAULT '',
	"link" text NOT NULL,
	"badge" text DEFAULT '',
	"desc" text DEFAULT '',
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
