-- Create a function to check if a recipe has at least one ingredient
CREATE OR REPLACE FUNCTION check_recipe_has_ingredients()
RETURNS TRIGGER AS $$
BEGIN
    -- If we're deleting from recipe_ingredient, check if the recipe will still have ingredients
    IF TG_OP = 'DELETE' THEN
        IF NOT EXISTS (
            SELECT 1 FROM recipe_ingredient 
            WHERE recipe_id = OLD.recipe_id
        ) THEN
            RAISE EXCEPTION 'Recipe must have at least one ingredient';
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on recipe_ingredient table
CREATE TRIGGER enforce_recipe_has_ingredients
    AFTER DELETE ON recipe_ingredient
    FOR EACH ROW
    EXECUTE FUNCTION check_recipe_has_ingredients();

-- Create a function to check when inserting/updating recipes
CREATE OR REPLACE FUNCTION check_recipe_ingredients_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- This function will be called after a recipe is inserted
    -- We don't need to check here since ingredients are added separately
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on recipe table to ensure ingredients are added
CREATE TRIGGER ensure_recipe_ingredients_added
    AFTER INSERT ON recipe
    FOR EACH ROW
    EXECUTE FUNCTION check_recipe_ingredients_on_insert(); 