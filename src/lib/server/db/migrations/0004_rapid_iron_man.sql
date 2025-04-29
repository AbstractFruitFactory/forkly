ALTER TABLE "ingredient" DROP CONSTRAINT "ingredient_spoonacular_id_unique";--> statement-breakpoint
ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "recipe_ingredient_recipe_id_ingredient_id_pk";--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipe_id_ingredient_id_display_name_pk" PRIMARY KEY("recipe_id","ingredient_id","display_name");--> statement-breakpoint
ALTER TABLE "recipe_ingredient" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredient" DROP COLUMN "spoonacular_id";--> statement-breakpoint
ALTER TABLE "ingredient" DROP COLUMN "custom";