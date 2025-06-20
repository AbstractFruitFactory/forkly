CREATE TABLE "tag" (
    "name" text PRIMARY KEY,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "tag_length" CHECK (length("name") < 15)
);
---> statement-breakpoint
CREATE TABLE "recipe_tag" (
    "recipe_id" text NOT NULL REFERENCES "recipe"("id") ON DELETE CASCADE,
    "tag_name" text NOT NULL REFERENCES "tag"("name") ON DELETE CASCADE,
    CONSTRAINT "recipe_tag_pk" PRIMARY KEY ("recipe_id", "tag_name")
);
---> statement-breakpoint
INSERT INTO "tag" ("name")
SELECT DISTINCT jsonb_array_elements_text(tags) AS tag
FROM recipe
WHERE jsonb_array_length(tags) > 0
ON CONFLICT DO NOTHING;
---> statement-breakpoint
INSERT INTO "recipe_tag" ("recipe_id", "tag_name")
SELECT id, tag
FROM recipe, jsonb_array_elements_text(tags) AS tag;
---> statement-breakpoint
ALTER TABLE "recipe" DROP COLUMN "tags";
---> statement-breakpoint
CREATE FUNCTION check_recipe_tag_limit() RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM recipe_tag WHERE recipe_id = NEW.recipe_id) >= 3 THEN
        RAISE EXCEPTION 'A recipe can have at most 3 tags';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
---> statement-breakpoint
CREATE TRIGGER recipe_tag_limit_trigger
BEFORE INSERT ON "recipe_tag"
FOR EACH ROW EXECUTE FUNCTION check_recipe_tag_limit();
