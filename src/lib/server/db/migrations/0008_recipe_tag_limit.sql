-- Reimplement tag limit using trigger on recipe_tag table
-- ensures a recipe has at most 3 tags

CREATE OR REPLACE FUNCTION check_recipe_tag_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM recipe_tag WHERE recipe_id = NEW.recipe_id) >= 3 THEN
        RAISE EXCEPTION 'A recipe can have at most 3 tags';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recipe_tag_limit_trigger ON recipe_tag;
CREATE TRIGGER recipe_tag_limit_trigger
BEFORE INSERT ON "recipe_tag"
FOR EACH ROW EXECUTE FUNCTION check_recipe_tag_limit();
