DELETE FROM "recipe" WHERE "user_id" IS NULL;
DELETE FROM "ingredient" i WHERE NOT EXISTS (
	SELECT 1 FROM "recipe_ingredient" ri WHERE ri."ingredient_id" = i."id"
);
ALTER TABLE "recipe" ALTER COLUMN "user_id" SET NOT NULL;