# Recipe Scraper API

A Python serverless function that scrapes recipe data from various cooking websites using the `recipe-scrapers` library.

## Setup

### 1. Install Dependencies

```bash
cd api/scrape
pip install -r requirements.txt
```

### 2. Test Locally

Start the local server:
```bash
python index.py
```

In another terminal, test the scraper:
```bash
python test_scraper.py
```

### 3. Deploy to Vercel

The function is already configured for Vercel deployment. When you push to your repository, Vercel will automatically deploy the Python function.

## Usage

### API Endpoint

**POST** `/api/scrape`

### Request Body

```json
{
  "url": "https://example.com/recipe-url"
}
```

### Response

```json
{
  "title": "Recipe Title",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "yields": "4 servings",
  "total_time": "45 minutes",
  "image": "https://example.com/recipe-image.jpg",
  "host": "example.com",
  "canonical_url": "https://example.com/recipe",
  "language": "en",
  "author": "Chef Name",
  "ratings": 4.5,
  "reviews_count": 123,
  "nutrients": {...},
  "difficulty": "Easy",
  "prep_time": "15 minutes",
  "cook_time": "30 minutes",
  "description": "Recipe description",
  "category": "Main Course",
  "cuisine": "Italian",
  "tags": ["tag1", "tag2"]
}
```

### Example Usage

```javascript
// Using fetch in your SvelteKit app
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/'
  })
});

const recipeData = await response.json();
console.log(recipeData.title);
```

## Supported Websites

The `recipe-scrapers` library supports many popular recipe websites including:
- AllRecipes
- Food Network
- Epicurious
- Bon Appétit
- Serious Eats
- And many more...

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing URL)
- `500`: Server error (scraping failed)

## Local Development

1. Install Python dependencies: `pip install -r requirements.txt`
2. Run the server: `python index.py`
3. Test with: `python test_scraper.py`
4. The server will be available at `http://localhost:8000`

## Deployment

The function is automatically deployed to Vercel when you push to your repository. The `vercel.json` file configures the Python runtime and routing. 