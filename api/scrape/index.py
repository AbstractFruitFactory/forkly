from recipe_scrapers import scrape_me
import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import re

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

def handler(request):
    try:
        # Parse the request body
        content_length = int(request.headers.get('Content-Length', 0))
        body = request.rfile.read(content_length) if content_length > 0 else b'{}'
        
        # Try to parse as JSON
        try:
            data = json.loads(body.decode('utf-8'))
            url = data.get("url")
        except json.JSONDecodeError:
            # If not JSON, try to parse as form data
            url = None
            if body:
                body_str = body.decode('utf-8')
                params = parse_qs(body_str)
                url = params.get('url', [None])[0]
        
        if not url:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "URL parameter is required"})
            }
        
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
        
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(recipe_data, default=str)
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }

# Vercel serverless function handler
class VercelHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        response = handler(self)
        
        self.send_response(response["statusCode"])
        for key, value in response["headers"].items():
            self.send_header(key, value)
        self.end_headers()
        
        self.wfile.write(response["body"].encode('utf-8'))
    
    def do_GET(self):
        # For testing purposes, allow GET requests
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        response = {
            "message": "Recipe Scraper API",
            "usage": "Send a POST request with JSON body containing 'url' field",
            "example": {
                "url": "https://example.com/recipe"
            }
        }
        
        self.wfile.write(json.dumps(response).encode('utf-8'))

# For local development
if __name__ == "__main__":
    from http.server import HTTPServer
    server = HTTPServer(('localhost', 8000), VercelHandler)
    print("Server running on http://localhost:8000")
    server.serve_forever() 