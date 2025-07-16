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
        
        # Try to split by common step indicators
        step_patterns = [
            r'\d+\.\s*',  # 1., 2., etc.
            r'[a-z]\.\s*',  # a., b., etc.
            r'Step\s+\d+:\s*',  # Step 1:, Step 2:, etc.
            r'^\s*[-•]\s*',  # Bullet points
        ]
        
        for pattern in step_patterns:
            steps = re.split(pattern, instructions, flags=re.IGNORECASE | re.MULTILINE)
            if len(steps) > 1:
                steps = [step.strip() for step in steps if step.strip()]
                if steps:
                    return steps
        
        # If no step patterns found, split by double newlines or periods
        if '\n\n' in instructions:
            steps = [step.strip() for step in instructions.split('\n\n') if step.strip()]
        else:
            # Split by sentences (period followed by space or newline)
            steps = re.split(r'\.\s+', instructions)
            steps = [step.strip() + '.' for step in steps if step.strip()]
        
        return steps if steps else [instructions]
    
    # If it's something else, try to convert to list
    try:
        # Don't convert strings to character lists
        if isinstance(instructions, str):
            return [instructions]
        return list(instructions)
    except:
        return [str(instructions)]

def scrape_recipe_handler(request_body, request_headers):
    """Main handler function for recipe scraping"""
    try:
        # Parse the request body
        if isinstance(request_body, str):
            data = json.loads(request_body)
        else:
            data = request_body
        
        url = data.get("url")
        
        if not url:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
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
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(recipe_data, default=str)
        }
        
    except Exception as e:
        # Log the full error for debugging
        print(f"Error in recipe scraper: {str(e)}", file=sys.stderr)
        print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
        
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": str(e)})
        }

# Vercel serverless function entry point
def handler(request, context):
    """Vercel serverless function handler"""
    try:
        # Handle different HTTP methods
        if request.method == 'GET':
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({
                    "message": "Recipe Scraper API",
                    "status": "running",
                    "usage": "Send a POST request with JSON body containing 'url' field",
                    "example": {
                        "url": "https://example.com/recipe"
                    }
                })
            }
        
        elif request.method == 'OPTIONS':
            # Handle CORS preflight requests
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": ""
            }
        
        elif request.method == 'POST':
            # Handle recipe scraping
            return scrape_recipe_handler(request.body, request.headers)
        
        else:
            return {
                "statusCode": 405,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"error": "Method not allowed"})
            }
            
    except Exception as e:
        print(f"Error in handler: {str(e)}", file=sys.stderr)
        print(f"Traceback: {traceback.format_exc()}", file=sys.stderr)
        
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": "Internal server error"})
        }

# For local development
if __name__ == "__main__":
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import urllib.parse
    
    class LocalHandler(BaseHTTPRequestHandler):
        def do_POST(self):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b'{}'
            
            # Create a mock request object
            class MockRequest:
                def __init__(self, body, headers):
                    self.body = body.decode('utf-8')
                    self.headers = headers
                    self.method = 'POST'
            
            request = MockRequest(body, dict(self.headers))
            
            response = handler(request, None)
            
            self.send_response(response["statusCode"])
            for key, value in response["headers"].items():
                self.send_header(key, value)
            self.end_headers()
            
            self.wfile.write(response["body"].encode('utf-8'))
        
        def do_GET(self):
            class MockRequest:
                def __init__(self):
                    self.method = 'GET'
                    self.headers = {}
            
            request = MockRequest()
            response = handler(request, None)
            
            self.send_response(response["statusCode"])
            for key, value in response["headers"].items():
                self.send_header(key, value)
            self.end_headers()
            
            self.wfile.write(response["body"].encode('utf-8'))
    
    server = HTTPServer(('localhost', 8000), LocalHandler)
    print("Server running on http://localhost:8000")
    server.serve_forever() 