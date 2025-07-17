from recipe_scrapers import scrape_me
import json
import re
import sys
import traceback

def safe_scrape_method(scraper, method_name, default_value=None):
    """Safely call a scraper method, returning default_value if the method doesn't exist"""
    try:
        method = getattr(scraper, method_name)
        if callable(method):
            return method()
        return default_value
    except (AttributeError, Exception):
        return default_value

def normalize_instructions(instructions):
    if not instructions:
        return []
    if isinstance(instructions, list):
        return instructions
    if isinstance(instructions, str):
        instructions = instructions.strip()
        # Split by newlines first
        steps = [step.strip() for step in instructions.split('\n') if step.strip()]
        if len(steps) > 1:
            return steps
        # If still only one step, split by period+space
        steps = [step.strip() for step in re.split(r'\.\s+', instructions) if step.strip()]
        return steps if steps else [instructions]
    return [str(instructions)]

def validate_recipe_data(recipe_data):
    """Validate that essential recipe data is present"""
    errors = []
    
    if not recipe_data.get("title"):
        errors.append("Recipe title could not be extracted")
    
    if not recipe_data.get("ingredients") or len(recipe_data["ingredients"]) == 0:
        errors.append("Recipe ingredients could not be extracted")
    
    if not recipe_data.get("instructions") or len(recipe_data["instructions"]) == 0:
        errors.append("Recipe instructions could not be extracted")
    
    return errors

def scrape_recipe(url):
    """Core recipe scraping function"""
    if not url:
        raise ValueError("URL parameter is required")
    
    try:
        # Scrape the recipe
        scraper = scrape_me(url)
        
        # Get raw instructions first
        raw_instructions = safe_scrape_method(scraper, "instructions", [])
        
        # Extract recipe data with safe method calls
        recipe_data = {
            "title": safe_scrape_method(scraper, "title", ""),
            "ingredients": safe_scrape_method(scraper, "ingredients", []),
            "instructions": normalize_instructions(raw_instructions),
            "yields": safe_scrape_method(scraper, "yields", ""),
            "total_time": safe_scrape_method(scraper, "total_time", ""),
            "image": safe_scrape_method(scraper, "image", ""),
            "host": safe_scrape_method(scraper, "host", ""),
            "canonical_url": safe_scrape_method(scraper, "canonical_url", ""),
            "language": safe_scrape_method(scraper, "language", ""),
            "author": safe_scrape_method(scraper, "author", ""),
            "ratings": safe_scrape_method(scraper, "ratings", None),
            "reviews_count": safe_scrape_method(scraper, "reviews_count", None),
            "nutrients": safe_scrape_method(scraper, "nutrients", {}),
            "difficulty": safe_scrape_method(scraper, "difficulty", ""),
            "prep_time": safe_scrape_method(scraper, "prep_time", ""),
            "cook_time": safe_scrape_method(scraper, "cook_time", ""),
            "description": safe_scrape_method(scraper, "description", ""),
            "category": safe_scrape_method(scraper, "category", ""),
            "cuisine": safe_scrape_method(scraper, "cuisine", ""),
            "tags": safe_scrape_method(scraper, "tags", []),
        }
        
        # Validate the scraped data
        validation_errors = validate_recipe_data(recipe_data)
        if validation_errors:
            error_message = "Failed to extract recipe data: " + "; ".join(validation_errors)
            raise ValueError(error_message)
        
        return recipe_data
        
    except ValueError as e:
        # Re-raise validation errors
        raise e
    except Exception as e:
        # Handle other scraping errors
        error_type = type(e).__name__
        if "HTTPError" in error_type or "ConnectionError" in error_type:
            raise ValueError(f"Unable to access the recipe URL. Please check if the URL is correct and accessible.")
        elif "TimeoutError" in error_type:
            raise ValueError(f"The recipe website took too long to respond. Please try again.")
        elif "NoSchemaFoundInWildMode" in str(e):
            raise ValueError(f"This recipe website is not supported. Please try a different recipe URL.")
        else:
            raise ValueError(f"Failed to scrape recipe: {str(e)}") 