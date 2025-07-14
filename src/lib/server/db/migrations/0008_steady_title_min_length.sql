ALTER TABLE "recipe" DROP CONSTRAINT "recipe_title_length";
ALTER TABLE "recipe" ADD CONSTRAINT "recipe_title_length" CHECK (length("recipe"."title") >= 5 AND length("recipe"."title") <= 80);
--> statement-breakpoint
