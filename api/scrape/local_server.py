import json
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from scraper import scrape_recipe

class LocalHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(body.decode('utf-8'))
            url = data.get("url")
            
            if not url:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "URL parameter is required"}).encode('utf-8'))
                return
            
            recipe_data = scrape_recipe(url)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(recipe_data, default=str).encode('utf-8'))
            
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response_data = {
            "message": "Recipe Scraper API (Local)",
            "status": "running",
            "usage": "Send a POST request with JSON body containing 'url' field",
            "example": {
                "url": "https://example.com/recipe"
            }
        }
        
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    server = HTTPServer(('localhost', 8000), LocalHandler)
    print("Local recipe scraper server running on http://localhost:8000")
    print("Send POST requests with JSON body: {\"url\": \"https://example.com/recipe\"}")
    server.serve_forever() 