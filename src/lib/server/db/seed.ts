import { recipe, ingredient, recipeIngredient, recipeNutrition } from './schema'
import { generateId } from '../id'
import type { MeasurementUnit } from '$lib/types'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = postgres(process.env.DATABASE_URL as string)
export const db = drizzle(client)

export const seed = async () => {
  // Check if we already have recipes
  const existingRecipes = await db.select().from(recipe).limit(1)

  if (existingRecipes.length > 0) {
    console.log('Database already seeded, skipping...')
    return
  }

  // Sample recipes data (without ingredients and nutrition)
  const sampleRecipes = [
    {
      id: generateId(),
      title: 'Grilled Salmon with Asparagus',
      description: 'Perfectly grilled salmon fillet served with fresh asparagus and creamy mashed potatoes, garnished with lemon and microgreens.',
      instructions: [
        'Peel and quarter potatoes. Boil until tender, about 15-20 minutes.',
        'While potatoes cook, season salmon with salt, pepper, and olive oil.',
        'Trim asparagus ends and toss with olive oil, salt, and pepper.',
        'Preheat grill or grill pan to medium-high heat.',
        'Grill salmon for 4-5 minutes per side until desired doneness.',
        'Grill asparagus for 3-4 minutes, turning occasionally.',
        'Mash potatoes with butter, milk, salt, and pepper until creamy.',
        'Plate mashed potatoes, arrange asparagus, and top with grilled salmon.',
        'Garnish with lemon wedges and microgreens. Serve immediately.'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80',
      userId: null,
      diets: ['pescatarian'] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Classic Spaghetti Carbonara',
      description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
      instructions: [
        'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
        'While pasta cooks, cut pancetta into small cubes and fry until crispy.',
        'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.',
        'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.',
        'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80',
      userId: null,
      diets: [] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Classic Chocolate Chip Cookies',
      description: 'Soft and chewy cookies with melty chocolate chips - a timeless favorite!',
      instructions: [
        'Preheat oven to 375°F (190°C)',
        'Cream together butter and sugars until light and fluffy',
        'Beat in eggs one at a time, then stir in vanilla',
        'Combine flour, baking soda, and salt; gradually blend into the butter mixture',
        'Stir in chocolate chips',
        'Drop by rounded tablespoons onto ungreased baking sheets',
        'Bake for 9 to 11 minutes or until golden brown'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80',
      userId: null,
      diets: ['vegetarian'] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Fresh Garden Salad',
      description: 'A light and refreshing salad packed with seasonal vegetables and a zesty vinaigrette.',
      instructions: [
        'Wash and dry all vegetables thoroughly',
        'Slice cucumber and red onion thinly',
        'Halve the cherry tomatoes',
        'In a small bowl, whisk together olive oil, balsamic vinegar, and honey',
        'Combine all vegetables in a large bowl',
        'Drizzle with dressing just before serving',
        'Toss gently and serve immediately'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
      userId: null,
      diets: [] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Homemade Pizza',
      description: 'A delicious pizza with a crispy crust and classic toppings.',
      instructions: [
        'Preheat oven to 450°F (230°C)',
        'Roll out pizza dough on a floured surface',
        'Brush the dough with olive oil',
        'Spread tomato sauce evenly over the dough',
        'Top with mozzarella cheese and pepperoni',
        'Sprinkle with dried oregano',
        'Bake for 15-20 minutes until crust is golden and cheese is bubbly'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80',
      userId: null,
      diets: [] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Chicken Stir-Fry',
      description: 'A quick and healthy Asian-inspired stir-fry with colorful vegetables.',
      instructions: [
        'Cut chicken into bite-sized pieces',
        'Slice vegetables into uniform pieces',
        'Heat oil in a large wok or skillet over high heat',
        'Stir-fry chicken until cooked through, remove from pan',
        'Add vegetables, ginger, and garlic to the pan',
        'Return chicken to pan, add soy sauce',
        'Stir-fry until vegetables are crisp-tender',
        'Serve hot over rice'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80',
      userId: null,
      diets: [] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    },
    {
      id: generateId(),
      title: 'Vegan Quinoa Buddha Bowl',
      description: 'A nutrient-packed vegan and gluten-free bowl with quinoa, roasted vegetables, avocado, and a tahini dressing.',
      instructions: [
        'Rinse quinoa thoroughly and cook according to package instructions.',
        'Preheat oven to 425°F (220°C).',
        'Toss sweet potatoes and chickpeas with olive oil, cumin, paprika, salt, and pepper.',
        'Spread on a baking sheet and roast for 25-30 minutes until golden.',
        'Prepare the tahini dressing by whisking tahini, lemon juice, garlic, water, and salt.',
        'Assemble bowls with quinoa as the base, topped with roasted vegetables, chickpeas, avocado, and kale.',
        'Drizzle with tahini dressing and sprinkle with sesame seeds.',
        'Garnish with fresh herbs and serve immediately.'
      ],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
      userId: null,
      diets: ['vegan', 'gluten-free'] as ("gluten-free" | "dairy-free" | "nut-free" | "vegan" | "vegetarian" | "pescatarian")[]
    }
  ]

  // Sample ingredients with their data
  const allIngredients = [
    // Salmon recipe ingredients
    { id: generateId(), name: 'salmon fillet', spoonacularId: 15076 },
    { id: generateId(), name: 'asparagus', spoonacularId: 11011 },
    { id: generateId(), name: 'potatoes', spoonacularId: 11352 },
    { id: generateId(), name: 'butter', spoonacularId: 1001 },
    { id: generateId(), name: 'milk', spoonacularId: 1077 },
    { id: generateId(), name: 'lemon', spoonacularId: 9150 },
    { id: generateId(), name: 'black pepper', spoonacularId: 1002030 },
    { id: generateId(), name: 'salt', spoonacularId: 2047 },
    { id: generateId(), name: 'olive oil', spoonacularId: 4053 },
    { id: generateId(), name: 'microgreens', spoonacularId: 11001 },

    // Carbonara ingredients
    { id: generateId(), name: 'spaghetti', spoonacularId: 11420 },
    { id: generateId(), name: 'eggs', spoonacularId: 1123 },
    { id: generateId(), name: 'pecorino romano', spoonacularId: 1038 },
    { id: generateId(), name: 'pancetta', spoonacularId: 10123 },

    // Cookie ingredients
    { id: generateId(), name: 'all-purpose flour', spoonacularId: 20081 },
    { id: generateId(), name: 'brown sugar', spoonacularId: 19334 },
    { id: generateId(), name: 'granulated sugar', spoonacularId: 19335 },
    { id: generateId(), name: 'vanilla extract', spoonacularId: 2050 },
    { id: generateId(), name: 'chocolate chips', spoonacularId: 10019146 },

    // Salad ingredients
    { id: generateId(), name: 'mixed salad greens', spoonacularId: 21052 },
    { id: generateId(), name: 'cherry tomatoes', spoonacularId: 10311529 },
    { id: generateId(), name: 'cucumber', spoonacularId: 11206 },
    { id: generateId(), name: 'red onion', spoonacularId: 10011282 },
    { id: generateId(), name: 'balsamic vinegar', spoonacularId: 2069 },
    { id: generateId(), name: 'honey', spoonacularId: 19296 },

    // Pizza ingredients
    { id: generateId(), name: 'pizza dough', spoonacularId: 93610 },
    { id: generateId(), name: 'tomato sauce', spoonacularId: 11549 },
    { id: generateId(), name: 'mozzarella cheese', spoonacularId: 1026 },
    { id: generateId(), name: 'pepperoni', spoonacularId: 7057 },
    { id: generateId(), name: 'dried oregano', spoonacularId: 2027 },

    // Stir-fry ingredients
    { id: generateId(), name: 'chicken breast', spoonacularId: 5062 },
    { id: generateId(), name: 'broccoli florets', spoonacularId: 10011090 },
    { id: generateId(), name: 'carrots', spoonacularId: 11124 },
    { id: generateId(), name: 'bell pepper', spoonacularId: 10211821 },
    { id: generateId(), name: 'soy sauce', spoonacularId: 16124 },
    { id: generateId(), name: 'ginger', spoonacularId: 11216 },
    { id: generateId(), name: 'garlic', spoonacularId: 11215 },
    { id: generateId(), name: 'vegetable oil', spoonacularId: 4513 },

    // Vegan Buddha Bowl ingredients
    { id: generateId(), name: 'quinoa', spoonacularId: 20035 },
    { id: generateId(), name: 'sweet potato', spoonacularId: 11507 },
    { id: generateId(), name: 'chickpeas', spoonacularId: 16057 },
    { id: generateId(), name: 'avocado', spoonacularId: 9037 },
    { id: generateId(), name: 'kale', spoonacularId: 11233 },
    { id: generateId(), name: 'tahini', spoonacularId: 12698 },
    { id: generateId(), name: 'lemon juice', spoonacularId: 9152 },
    { id: generateId(), name: 'cumin', spoonacularId: 1002014 },
    { id: generateId(), name: 'paprika', spoonacularId: 2028 },
    { id: generateId(), name: 'sesame seeds', spoonacularId: 12023 }
  ]

  // Recipe-ingredient relationships
  const recipeIngredients = [
    // Salmon recipe ingredients
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[0].id, quantity: 6, measurement: 'ounces' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[1].id, quantity: 8, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[2].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[3].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[4].id, quantity: 0.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[5].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[6].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[7].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[8].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[9].id, quantity: 0.5, measurement: 'cups' as MeasurementUnit },

    // Carbonara ingredients
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[10].id, quantity: 400, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[11].id, quantity: 4, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[12].id, quantity: 100, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[13].id, quantity: 200, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[6].id, quantity: 2, measurement: 'teaspoons' as MeasurementUnit },

    // Cookie ingredients
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[14].id, quantity: 2.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[3].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[15].id, quantity: 0.75, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[16].id, quantity: 0.75, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[11].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[17].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[18].id, quantity: 2, measurement: 'cups' as MeasurementUnit },

    // Salad ingredients
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[19].id, quantity: 6, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[20].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[21].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[22].id, quantity: 0.5, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[8].id, quantity: 3, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[23].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[24].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },

    // Pizza ingredients
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[25].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[26].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[27].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[28].id, quantity: 4, measurement: 'ounces' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[8].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[29].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },

    // Stir-fry ingredients
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[30].id, quantity: 1, measurement: 'pounds' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[31].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[32].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[33].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[34].id, quantity: 3, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[35].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[36].id, quantity: 2, measurement: 'cloves' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[37].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },

    // Vegan Buddha Bowl ingredients
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[38].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[39].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[40].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[41].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[42].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[43].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[44].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[36].id, quantity: 1, measurement: 'cloves' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[8].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[45].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[46].id, quantity: 0.5, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[47].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit }
  ]

  // Nutrition data for each recipe
  const recipeNutritionData = [
    {
      recipeId: sampleRecipes[0].id,
      calories: 580,
      protein: 42,
      carbs: 35,
      fat: 32
    },
    {
      recipeId: sampleRecipes[1].id,
      calories: 1200,
      protein: 45,
      carbs: 120,
      fat: 55
    },
    {
      recipeId: sampleRecipes[2].id,
      calories: 180,
      protein: 2,
      carbs: 24,
      fat: 9
    },
    {
      recipeId: sampleRecipes[3].id,
      calories: 320,
      protein: 4,
      carbs: 18,
      fat: 28
    },
    {
      recipeId: sampleRecipes[4].id,
      calories: 2000,
      protein: 80,
      carbs: 220,
      fat: 90
    },
    {
      recipeId: sampleRecipes[5].id,
      calories: 850,
      protein: 75,
      carbs: 40,
      fat: 45
    },
    {
      recipeId: sampleRecipes[6].id,
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 18
    }
  ]

  console.log('Inserting recipes...')
  await db.insert(recipe).values(sampleRecipes)

  console.log('Inserting ingredients...')
  await db.insert(ingredient).values(allIngredients)

  console.log('Inserting recipe-ingredient relationships...')
  await db.insert(recipeIngredient).values(recipeIngredients)

  console.log('Inserting nutrition data...')
  await db.insert(recipeNutrition).values(recipeNutritionData)
}

seed().catch((err) => {
  console.error('Failed to seed database:', err)
  process.exit(1)
}).then(() => {
  console.log('Database seeded successfully!')
  process.exit(0)
})
