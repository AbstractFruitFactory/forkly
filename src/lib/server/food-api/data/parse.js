import fs from 'fs';
import readline from 'readline';
import path from 'path';

// File paths (update as needed)
const INPUT_FILE = path.join(process.cwd(), 'src/lib/server/food-api/data/openfoodfacts-products.jsonl');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/server/food-api/data/filtered_ingredients.jsonl');

// Define allowed categories for raw ingredients (modify as needed)
const allowedCategories = new Set([
  "en:vegetables", "en:fruits", "en:legumes", "en:nuts", "en:seeds", "en:cereals",
  "en:meats", "en:seafood", "en:dairy-substitutes", "en:olive-oils", "en:spices", "en:herbs"
]);

// Define words to filter out processed foods
const excludedKeywords = [
  "canned", "prepared", "seasoned", "smoked", "processed", "sauce",
  "juice", "syrup", "baked", "cream", "creamer", "snack", "powder", "meal"
];

async function processJSONL() {
  console.log('🚀 Processing Open Food Facts dataset...');

  const outputStream = fs.createWriteStream(OUTPUT_FILE);
  const fileStream = fs.createReadStream(INPUT_FILE);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  let saved = 0;

  for await (const line of rl) {
    try {
      const product = JSON.parse(line);

      // Extract relevant fields
      const { code, product_name, categories_tags, brands, nutriments, lang, ingredients_text_en, allergens_tags, _keywords, ingredients_analysis_tags, food_groups_tags } = product;

      // 1️⃣ Exclude branded products
      if (brands && brands.trim().length > 0) continue;

      // 2️⃣ Ensure the product is in English
      if (lang !== "en") continue;

      // 3️⃣ Filter by allowed categories (only basic raw foods)
      const categoryTags = categories_tags ? categories_tags.map(tag => tag.toLowerCase()) : [];
      const isRawIngredient = categoryTags.some(tag => allowedCategories.has(tag));

      if (!isRawIngredient) continue;

      // 4️⃣ Exclude categories with `fr:` (French-language categories)
      if (categoryTags.some(tag => tag.startsWith('fr:'))) continue;

      // 5️⃣ Exclude categories that contain "and-their-products"
      if (categoryTags.some(tag => tag.includes('and-their-products'))) continue;

      // 6️⃣ Exclude processed or composite foods
      if (excludedKeywords.some(word => product_name.toLowerCase().includes(word))) continue;

      // 7️⃣ Extract nutritional values (default to null if missing)
      const energy_kcal = nutriments?.['energy-kcal_100g'] || null;
      const proteins = nutriments?.['proteins_100g'] || null;
      const carbohydrates = nutriments?.['carbohydrates_100g'] || null;

      // 8️⃣ Extract additional useful data
      const allergens = allergens_tags || [];
      const keywords = _keywords || [];
      const dietaryLabels = ingredients_analysis_tags || [];
      const foodGroups = food_groups_tags || [];

      // 9️⃣ Construct filtered product JSON object
      const filteredProduct = {
        code,
        product_name,
        categories_tags: categoryTags,
        nutriments: {
          energy_kcal,
          proteins,
          carbohydrates
        },
        ingredients_text_en: ingredients_text_en || null,
        allergens,
        keywords,
        dietary_labels: dietaryLabels,
        food_groups: foodGroups
      };

      // 🔟 Write to JSONL file (newline-separated)
      outputStream.write(JSON.stringify(filteredProduct) + '\n');
      saved++;

      if (++count % 1000 === 0) {
        console.log(`✅ Processed ${count} products...`);
      }
    } catch (err) {
      console.warn(`⚠️ Skipping invalid JSON line: ${err.message}`);
    }
  }

  outputStream.end();
  console.log(`🎉 Done! Saved ${saved} raw ingredient entries to ${OUTPUT_FILE}`);
}

// Run the script
processJSONL().catch(err => console.error('❌ Error processing JSONL:', err));
