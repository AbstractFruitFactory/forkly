CREATE TABLE "recipe_instruction" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"text" text NOT NULL,
	"media_url" text,
	"media_type" text,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingredient" DROP CONSTRAINT "ingredient_name_unique";--> statement-breakpoint
ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "recipe_ingredient_recipe_id_ingredient_id_display_name_pk";--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipe_id_instruction_id_ingredient_id_pk" PRIMARY KEY("recipe_id","instruction_id","ingredient_id");--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD COLUMN "instruction_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_instruction" ADD CONSTRAINT "recipe_instruction_recipe_id_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_instruction_id_recipe_instruction_id_fk" FOREIGN KEY ("instruction_id") REFERENCES "public"."recipe_instruction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe" DROP COLUMN "instructions";