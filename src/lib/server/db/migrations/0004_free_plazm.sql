CREATE TABLE "collection" (
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_user_id_name_pk" PRIMARY KEY("user_id","name")
);
--> statement-breakpoint
ALTER TABLE "recipe_bookmark" ADD COLUMN "collection_name" text;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_bookmark" ADD CONSTRAINT "recipe_bookmark_user_id_collection_name_collection_user_id_name_fk" FOREIGN KEY ("user_id","collection_name") REFERENCES "public"."collection"("user_id","name") ON DELETE cascade ON UPDATE no action;