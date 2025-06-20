CREATE TABLE "recipe_tags" (
    "recipe_id" text PRIMARY KEY REFERENCES "recipe"("id") ON DELETE CASCADE,
    "tags" text[] NOT NULL DEFAULT '{}'::text[],
    CONSTRAINT "recipe_tags_length" CHECK (cardinality("tags") <= 3)
);
---> statement-breakpoint
INSERT INTO "recipe_tags" ("recipe_id", "tags")
SELECT "recipe_id", array_agg("tag_name" ORDER BY "tag_name")
FROM "recipe_tag"
GROUP BY "recipe_id";
---> statement-breakpoint
DROP TRIGGER IF EXISTS recipe_tag_limit_trigger ON "recipe_tag";
DROP FUNCTION IF EXISTS check_recipe_tag_limit();
DROP TABLE "recipe_tag";
