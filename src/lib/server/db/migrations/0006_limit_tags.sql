ALTER TABLE "recipe" ADD CONSTRAINT "recipe_max_three_tags" CHECK (jsonb_array_length("tags") <= 3);
