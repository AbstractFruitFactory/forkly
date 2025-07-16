# Recipe Scraper Deployment Guide

This guide will help you set up and deploy the Python recipe scraper as a serverless function on Vercel.

## 📁 Project Structure

Your project now has the following structure for the recipe scraper:

```
forkly/
├── api/
│   └── scrape/
│       ├── index.py          # Python serverless function
│       ├── requirements.txt  # Python dependencies
│       ├── vercel.json       # Vercel configuration
│       ├── test_scraper.py   # Local testing script
│       └── README.md         # Detailed usage instructions
├── src/
│   ├── routes/
│   │   └── api/
│   │       └── scrape/
│   │           └── +server.ts # SvelteKit API proxy
│   ├── lib/
│   │   ├── utils/
│   │   │   └── recipeScraper.ts # Utility functions
│   │   └── components/
│   │       └── recipe-scraper/
│   │           └── RecipeScraper.svelte # Example component
└── DEPLOYMENT_GUIDE.md       # This file
```

## 🚀 Setup Steps

### 1. Install Python Dependencies

```bash
cd api/scrape
pip install -r requirements.txt
```

### 2. Test Locally

Start the Python server:
```bash
cd api/scrape
python index.py
```

In another terminal, test the scraper:
```bash
cd api/scrape
python test_scraper.py
```

### 3. Test with SvelteKit

Start your SvelteKit development server:
```bash
npm run dev
```

Visit `http://localhost:5173/api/scrape` to test the API endpoint.

### 4. Deploy to Vercel

The Python function will be automatically deployed when you push to your repository. Vercel will:

1. Detect the Python function in `api/scrape/`
2. Install dependencies from `requirements.txt`
3. Deploy the function to `/api/scrape`

## 🔧 Configuration

### Vercel Configuration (`api/scrape/vercel.json`)

```json
{
  "functions": {
    "api/scrape/index.py": {
      "runtime": "python3.9"
    }
  },
  "routes": [
    {
      "src": "/api/scrape",
      "dest": "/api/scrape/index.py"
    }
  ]
}
```

### Environment Variables (Optional)

You can add environment variables in your Vercel dashboard:

- `PYTHON_VERSION`: Set to `3.9` (default)
- `RECIPE_SCRAPER_TIMEOUT`: Set timeout for scraping (default: 30s)

## 📡 API Usage

### Endpoint

**POST** `/api/scrape`

### Request

```json
{
  "url": "https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/"
}
```

### Response

```json
{
  "title": "Alysia's Basic Meat Lasagna",
  "ingredients": ["1 pound ground beef", "1 onion, chopped", ...],
  "instructions": ["Preheat oven to 350°F", "Brown the beef", ...],
  "yields": "8 servings",
  "total_time": "1 hour 30 minutes",
  "image": "https://example.com/recipe-image.jpg",
  "host": "allrecipes.com",
  "author": "Alysia",
  "difficulty": "Easy",
  "prep_time": "30 minutes",
  "cook_time": "1 hour",
  "description": "A classic meat lasagna recipe...",
  "category": "Main Course",
  "cuisine": "Italian",
  "tags": ["lasagna", "beef", "pasta"]
}
```

## 🧪 Testing

### Test URLs

Try these URLs to test the scraper:

- AllRecipes: `https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/`
- Food Network: `https://www.foodnetwork.com/recipes/food-network-kitchen/pancakes-recipe-1913844`
- Epicurious: `https://www.epicurious.com/recipes/food/views/classic-chocolate-chip-cookies-51210490`

### Using the Example Component

Add the RecipeScraper component to any page:

```svelte
<script>
  import RecipeScraper from '$lib/components/recipe-scraper/RecipeScraper.svelte'
</script>

<RecipeScraper />
```

## 🔍 Troubleshooting

### Common Issues

1. **Python function not found**
   - Ensure `api/scrape/index.py` exists
   - Check that `requirements.txt` is in the same directory

2. **Import errors**
   - Verify all dependencies are in `requirements.txt`
   - Check Python version compatibility

3. **Timeout errors**
   - Some recipe sites may be slow to respond
   - Consider increasing timeout in Vercel settings

4. **CORS issues**
   - The SvelteKit proxy (`+server.ts`) handles CORS
   - Direct calls to Python function may have CORS restrictions

### Debugging

1. Check Vercel function logs in the dashboard
2. Test locally first with `python index.py`
3. Use the test script: `python test_scraper.py`

## 📚 Integration Examples

### In a SvelteKit Page

```svelte
<script lang="ts">
  import { scrapeRecipe } from '$lib/utils/recipeScraper'
  
  let url = ''
  let recipe: any = null
  
  async function handleScrape() {
    const result = await scrapeRecipe(url)
    if (!('error' in result)) {
      recipe = result
    }
  }
</script>

<input bind:value={url} placeholder="Recipe URL" />
<button on:click={handleScrape}>Scrape Recipe</button>

{#if recipe}
  <h2>{recipe.title}</h2>
  <p>Time: {recipe.total_time}</p>
  <p>Servings: {recipe.yields}</p>
{/if}
```

### In a Server Action

```typescript
// src/routes/recipes/+page.server.ts
import { scrapeRecipe } from '$lib/utils/recipeScraper'

export const actions = {
  scrape: async ({ request }) => {
    const data = await request.formData()
    const url = data.get('url') as string
    
    const result = await scrapeRecipe(url)
    return { success: !('error' in result), data: result }
  }
}
```

## 🎯 Next Steps

1. **Customize the scraper**: Modify `index.py` to extract additional fields
2. **Add caching**: Implement Redis or database caching for scraped recipes
3. **Rate limiting**: Add rate limiting to prevent abuse
4. **Error handling**: Improve error messages and fallback behavior
5. **Testing**: Add comprehensive tests for different recipe sites

## 📞 Support

If you encounter issues:

1. Check the Vercel function logs
2. Test locally with the provided test script
3. Verify the recipe URL is from a supported site
4. Check the `recipe-scrapers` library documentation for supported sites

The scraper supports many popular recipe websites including AllRecipes, Food Network, Epicurious, Bon Appétit, and many more! 