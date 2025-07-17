from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import urlparse
from .scraper import scrape_recipe

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        self._set_headers()
        response = {
            "message": "Recipe Scraper API",
            "usage": "POST JSON to this endpoint with a 'url' field",
            "example": { "url": "https://example.com/some-recipe" }
        }
        self.wfile.write(json.dumps(response).encode("utf-8"))

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            url = data.get("url")
            if not url:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Missing 'url' field"}).encode("utf-8"))
                return

            recipe = scrape_recipe(url)
            self._set_headers(200)
            self.wfile.write(json.dumps(recipe).encode("utf-8"))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({ "error": str(e) }).encode("utf-8"))
