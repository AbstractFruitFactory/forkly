ALTER TABLE "recipe" ADD CONSTRAINT "recipe_title_length" CHECK (length("recipe"."title") <= 80);
--> statement-breakpoint
