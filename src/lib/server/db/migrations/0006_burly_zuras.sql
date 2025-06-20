CREATE TABLE "recipe_tag" (
	"recipe_id" text NOT NULL,
	"tag_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_tag_recipe_id_tag_name_pk" PRIMARY KEY("recipe_id","tag_name")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"name" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tag_name_length" CHECK (length("tag"."name") < 15)
);
--> statement-breakpoint
ALTER TABLE "recipe_tag" ADD CONSTRAINT "recipe_tag_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tag" ADD CONSTRAINT "recipe_tag_tag_name_tag_name_fk" FOREIGN KEY ("tag_name") REFERENCES "public"."tag"("name") ON DELETE cascade ON UPDATE no action;