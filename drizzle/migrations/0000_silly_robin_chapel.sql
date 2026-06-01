CREATE TABLE IF NOT EXISTS "article_tag" (
	"article_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "article_tag_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "article_types" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "article_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "articles" (
	"id" integer PRIMARY KEY NOT NULL,
	"article_type_id" integer NOT NULL,
	"category_id" integer,
	"author_id" integer NOT NULL,
	"image" text,
	"title" jsonb NOT NULL,
	"summary" jsonb,
	"content" jsonb,
	"hit" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"published_at" timestamp,
	"sort" integer DEFAULT 0,
	"year" integer,
	"files" text,
	"original_files" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" integer PRIMARY KEY NOT NULL,
	"category_type_id" integer NOT NULL,
	"parent_id" integer,
	"name" jsonb NOT NULL,
	"sort" integer DEFAULT 0,
	"is_root" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category_types" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "category_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"position" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" integer PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"path" text NOT NULL,
	"description" jsonb,
	"sort" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "article_tag" ADD CONSTRAINT "article_tag_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "article_tag" ADD CONSTRAINT "article_tag_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articles" ADD CONSTRAINT "articles_article_type_id_article_types_id_fk" FOREIGN KEY ("article_type_id") REFERENCES "public"."article_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_employees_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_category_type_id_category_types_id_fk" FOREIGN KEY ("category_type_id") REFERENCES "public"."category_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_tag_article_id_idx" ON "article_tag" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_tag_tag_id_idx" ON "article_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_types_name_idx" ON "article_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_types_slug_idx" ON "article_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_article_type_id_idx" ON "articles" USING btree ("article_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_category_id_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_author_id_idx" ON "articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_is_active_idx" ON "articles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_category_type_id_idx" ON "categories" USING btree ("category_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_parent_id_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_is_active_idx" ON "categories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_types_slug_idx" ON "category_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "employees_email_idx" ON "employees" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "images_article_id_idx" ON "images" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_is_active_idx" ON "tags" USING btree ("is_active");