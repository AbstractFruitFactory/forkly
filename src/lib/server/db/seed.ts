import { recipe, ingredient, recipeIngredient, recipeNutrition } from './schema'
import { generateId } from '../id'
import type { MeasurementUnit } from '$lib/types'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as dotenv from 'dotenv'
import { sql } from 'drizzle-orm'

dotenv.config()

const client = postgres(process.env.DATABASE_URL as string)
export const db = drizzle(client)

export const seed = async () => {
  // Force reseed: clean up existing data first
  console.log('Cleaning up existing data to force reseed...')
  try {
    await db.delete(recipeIngredient)
    await db.delete(recipeNutrition)
    await db.delete(recipe)
    await db.delete(ingredient)
  } catch (error) {
    console.log('Error cleaning up data:', error)
  }

  // Sample recipes data (without ingredients and nutrition)
  const sampleRecipes = [
    {
      id: generateId(),
      title: 'Chef John\'s Fresh Salmon Cakes',
      description: 'Delicious salmon cakes made with fresh salmon, sautéed vegetables, and seasonings. A perfect emergency meal that\'s easy to add to anyone\'s rotation.',
      instructions: [
        { text: 'Heat extra virgin olive oil in a skillet over medium heat. Cook and stir onion, red pepper, celery, and a pinch of salt until onion is soft and translucent, about 5 minutes.' },
        { text: 'Add capers; cook and stir until fragrant, about 2 minutes. Remove from heat and cool to room temperature.' },
        { text: 'Stir salmon, onion mixture, mayonnaise, bread crumbs, garlic, mustard, cayenne, seafood seasoning, salt, and ground black pepper together in a bowl until well-mixed.' },
        { text: 'Cover the bowl with plastic wrap and refrigerate until firmed and chilled, 1 to 2 hours.' },
        { text: 'Form salmon mixture into four 1-inch thick patties; sprinkle remaining panko bread crumbs over each patty.' },
        { text: 'Heat olive oil in a skillet over medium-heat. Cook patties in hot oil until golden and cooked through, 3 to 4 minutes per side.' }
      ],
      imageUrl: 'https://www.allrecipes.com/thmb/vtJaLavws0DJyHAbSbL6WyuuRQk=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/4470536-chef-johns-fresh-salmon-cakes-Chef-John-1x1-1-217fa762bb5c4d098ee1cb0044994758.jpg',
      userId: null,
      tags: ['pescatarian', 'seafood', 'quick']
    },
    {
      id: generateId(),
      title: 'Grilled Salmon with Asparagus',
      description: 'Perfectly grilled salmon fillet served with fresh asparagus and creamy mashed potatoes, garnished with lemon and microgreens.',
      instructions: [
        { text: 'Peel and quarter potatoes. Boil until tender, about 15-20 minutes.' },
        { text: 'While potatoes cook, season salmon with salt, pepper, and olive oil.' },
        { text: 'Trim asparagus ends and toss with olive oil, salt, and pepper.' },
        { text: 'Preheat grill or grill pan to medium-high heat.' },
        { text: 'Grill salmon for 4-5 minutes per side until desired doneness.' },
        { text: 'Grill asparagus for 3-4 minutes, turning occasionally.' },
        { text: 'Mash potatoes with butter, milk, salt, and pepper until creamy.' },
        { text: 'Plate mashed potatoes, arrange asparagus, and top with grilled salmon.' },
        { text: 'Garnish with lemon wedges and microgreens. Serve immediately.' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['pescatarian', 'healthy', 'grilled']
    },
    {
      id: generateId(),
      title: 'Classic Spaghetti Carbonara',
      description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
      instructions: [
        { text: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.' },
        { text: 'While pasta cooks, cut pancetta into small cubes and fry until crispy.' },
        { text: 'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.' },
        { text: 'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.' },
        { text: 'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['italian', 'pasta', 'easy']
    },
    {
      id: generateId(),
      title: 'Classic Chocolate Chip Cookies',
      description: 'Soft and chewy cookies with melty chocolate chips - a timeless favorite!',
      instructions: [
        { text: 'Preheat oven to 375°F (190°C)' },
        {
          text: 'Cream together butter and sugars until light and fluffy',
          mediaUrl: 'https://images.unsplash.com/photo-1612207339340-8fa5ed562f88?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        },
        { text: 'Beat in eggs one at a time, then stir in vanilla' },
        { text: 'Combine flour, baking soda, and salt; gradually blend into the butter mixture' },
        {
          text: 'Stir in chocolate chips',
          mediaUrl: 'https://images.unsplash.com/photo-1621236378699-8597faf6a176?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        },
        { text: 'Drop by rounded tablespoons onto ungreased baking sheets' },
        {
          text: 'Bake for 9 to 11 minutes or until golden brown',
          mediaUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['vegetarian', 'dessert', 'baking']
    },
    {
      id: generateId(),
      title: 'Fresh Garden Salad',
      description: 'A light and refreshing salad packed with seasonal vegetables and a zesty vinaigrette.',
      instructions: [
        { text: 'Wash and dry all vegetables thoroughly' },
        { text: 'Slice cucumber and red onion thinly' },
        { text: 'Halve the cherry tomatoes' },
        { text: 'In a small bowl, whisk together olive oil, balsamic vinegar, and honey' },
        { text: 'Combine all vegetables in a large bowl' },
        { text: 'Drizzle with dressing just before serving' },
        { text: 'Toss gently and serve immediately' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['salad', 'healthy', 'fresh']
    },
    {
      id: generateId(),
      title: 'Homemade Pizza',
      description: 'A delicious pizza with a crispy crust and classic toppings.',
      instructions: [
        { text: 'Preheat oven to 450°F (230°C)' },
        { text: 'Roll out pizza dough on a floured surface', mediaUrl: 'https://videos.pexels.com/video-files/3209831/3209831-uhd_2560_1440_25fps.mp4', mediaType: 'video' as const },
        { text: 'Brush the dough with olive oil' },
        { text: 'Spread tomato sauce evenly over the dough', mediaUrl: 'https://videos.pexels.com/video-files/6603320/6603320-uhd_2560_1440_25fps.mp4', mediaType: 'video' as const },
        { text: 'Top with mozzarella cheese and pepperoni', mediaUrl: 'https://videos.pexels.com/video-files/7008568/7008568-hd_1920_1080_25fps.mp4', mediaType: 'video' as const },
        { text: 'Sprinkle with dried oregano', mediaUrl: 'https://videos.pexels.com/video-files/18775889/18775889-uhd_2560_1440_25fps.mp4', mediaType: 'video' as const },
        { text: 'Bake for 15-20 minutes until crust is golden and cheese is bubbly', mediaUrl: 'https://videos.pexels.com/video-files/30627970/13111089_1440_2560_25fps.mp4', mediaType: 'video' as const }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['italian', 'cheese', 'dinner']
    },
    {
      id: generateId(),
      title: 'Chicken Stir-Fry',
      description: 'A quick and healthy Asian-inspired stir-fry with colorful vegetables.',
      instructions: [
        { text: 'Cut chicken into bite-sized pieces' },
        { text: 'Slice vegetables into uniform pieces' },
        { text: 'Heat oil in a large wok or skillet over high heat' },
        { text: 'Stir-fry chicken until cooked through, remove from pan' },
        { text: 'Add vegetables, ginger, and garlic to the pan' },
        { text: 'Return chicken to pan, add soy sauce' },
        { text: 'Stir-fry until vegetables are crisp-tender' },
        { text: 'Serve hot over rice' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['asian', 'chicken', 'quick']
    },
    {
      id: generateId(),
      title: 'Vegan Quinoa Buddha Bowl',
      description: 'A nutrient-packed vegan and gluten-free bowl with quinoa, roasted vegetables, avocado, and a tahini dressing.',
      instructions: [
        { text: 'Rinse quinoa thoroughly and cook according to package instructions.' },
        { text: 'Preheat oven to 425°F (220°C).' },
        {
          text: 'Toss sweet potatoes and chickpeas with olive oil, cumin, paprika, salt, and pepper.',
          mediaUrl: 'https://images.unsplash.com/photo-1604328727766-a151d1045ab4?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        },
        {
          text: 'Spread on a baking sheet and roast for 25-30 minutes until golden.',
          mediaUrl: 'https://images.unsplash.com/photo-1592415499556-74fcb9f18667?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        },
        { text: 'Prepare the tahini dressing by whisking tahini, lemon juice, garlic, water, and salt.' },
        {
          text: 'Assemble bowls with quinoa as the base, topped with roasted vegetables, chickpeas, avocado, and kale.',
          mediaUrl: 'https://images.unsplash.com/photo-1546007600-8c2e5a9b8ea3?auto=format&fit=crop&q=80',
          mediaType: 'image' as const
        },
        { text: 'Drizzle with tahini dressing and sprinkle with sesame seeds.' },
        { text: 'Garnish with fresh herbs and serve immediately.' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
      userId: null,
      tags: ['vegan', 'gluten-free', 'healthy', 'bowl']
    }
  ]

  // Sample ingredients with their data
  const allIngredients = [
    // Chef John's Fresh Salmon Cakes ingredients
    { id: generateId(), name: 'fresh wild salmon', spoonacularId: 15247 },
    { id: generateId(), name: 'extra-virgin olive oil', spoonacularId: 1034053 },
    { id: generateId(), name: 'onion', spoonacularId: 11282 },
    { id: generateId(), name: 'red bell pepper', spoonacularId: 11821 },
    { id: generateId(), name: 'celery', spoonacularId: 11143 },
    { id: generateId(), name: 'capers', spoonacularId: 2054 },
    { id: generateId(), name: 'mayonnaise', spoonacularId: 4025 },
    { id: generateId(), name: 'panko bread crumbs', spoonacularId: 10018079 },
    { id: generateId(), name: 'garlic', spoonacularId: 11215 },
    { id: generateId(), name: 'Dijon mustard', spoonacularId: 1002046 },
    { id: generateId(), name: 'cayenne pepper', spoonacularId: 2031 },
    { id: generateId(), name: 'seafood seasoning', spoonacularId: 1032034 },
    { id: generateId(), name: 'salt', spoonacularId: 2047 },
    { id: generateId(), name: 'black pepper', spoonacularId: 1002030 },
    { id: generateId(), name: 'olive oil', spoonacularId: 4053 },

    // Salmon recipe ingredients
    { id: generateId(), name: 'salmon fillet', spoonacularId: 15076 },
    { id: generateId(), name: 'asparagus', spoonacularId: 11011 },
    { id: generateId(), name: 'potatoes', spoonacularId: 11352 },
    { id: generateId(), name: 'butter', spoonacularId: 1001 },
    { id: generateId(), name: 'milk', spoonacularId: 1077 },
    { id: generateId(), name: 'lemon', spoonacularId: 9150 },
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
    // Chef John's Fresh Salmon Cakes ingredients
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[0].id, quantity: 1.25, measurement: 'pounds' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[1].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[2].id, quantity: 0.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[3].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[4].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[5].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[6].id, quantity: 0.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[7].id, quantity: 0.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[8].id, quantity: 2, measurement: 'cloves' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[9].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[10].id, quantity: 1, measurement: 'pinch' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[11].id, quantity: 1, measurement: 'pinch' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[12].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[13].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[0].id, ingredientId: allIngredients[14].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },

    // Salmon recipe ingredients
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[15].id, quantity: 6, measurement: 'ounces' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[16].id, quantity: 8, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[17].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[18].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[19].id, quantity: 0.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[20].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[13].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[12].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[14].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[1].id, ingredientId: allIngredients[21].id, quantity: 0.5, measurement: 'cups' as MeasurementUnit },

    // Carbonara ingredients
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[10].id, quantity: 400, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[11].id, quantity: 4, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[12].id, quantity: 100, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[13].id, quantity: 200, measurement: 'grams' as MeasurementUnit },
    { recipeId: sampleRecipes[2].id, ingredientId: allIngredients[6].id, quantity: 2, measurement: 'teaspoons' as MeasurementUnit },

    // Cookie ingredients
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[14].id, quantity: 2.25, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[3].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[15].id, quantity: 0.75, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[16].id, quantity: 0.75, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[11].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[17].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[3].id, ingredientId: allIngredients[18].id, quantity: 2, measurement: 'cups' as MeasurementUnit },

    // Salad ingredients
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[19].id, quantity: 6, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[20].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[21].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[22].id, quantity: 0.5, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[8].id, quantity: 3, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[23].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[4].id, ingredientId: allIngredients[24].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },

    // Pizza ingredients
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[25].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[26].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[27].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[28].id, quantity: 4, measurement: 'ounces' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[8].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[5].id, ingredientId: allIngredients[29].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },

    // Stir-fry ingredients
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[30].id, quantity: 1, measurement: 'pounds' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[31].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[32].id, quantity: 2, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[33].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[34].id, quantity: 3, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[35].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[36].id, quantity: 2, measurement: 'cloves' as MeasurementUnit },
    { recipeId: sampleRecipes[6].id, ingredientId: allIngredients[37].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },

    // Vegan Buddha Bowl ingredients
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[38].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[39].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[40].id, quantity: 1, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[41].id, quantity: 1, measurement: 'pieces' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[42].id, quantity: 2, measurement: 'cups' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[43].id, quantity: 2, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[44].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[36].id, quantity: 1, measurement: 'cloves' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[8].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[45].id, quantity: 1, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[46].id, quantity: 0.5, measurement: 'teaspoons' as MeasurementUnit },
    { recipeId: sampleRecipes[7].id, ingredientId: allIngredients[47].id, quantity: 1, measurement: 'tablespoons' as MeasurementUnit }
  ]

  // Nutrition data for each recipe
  const recipeNutritionData = [
    {
      recipeId: sampleRecipes[0].id,
      calories: 460,
      protein: 32,
      carbs: 9,
      fat: 34
    },
    {
      recipeId: sampleRecipes[1].id,
      calories: 580,
      protein: 42,
      carbs: 35,
      fat: 32
    },
    {
      recipeId: sampleRecipes[2].id,
      calories: 1200,
      protein: 45,
      carbs: 120,
      fat: 55
    },
    {
      recipeId: sampleRecipes[3].id,
      calories: 180,
      protein: 2,
      carbs: 24,
      fat: 9
    },
    {
      recipeId: sampleRecipes[4].id,
      calories: 320,
      protein: 4,
      carbs: 18,
      fat: 28
    },
    {
      recipeId: sampleRecipes[5].id,
      calories: 2000,
      protein: 80,
      carbs: 220,
      fat: 90
    },
    {
      recipeId: sampleRecipes[6].id,
      calories: 850,
      protein: 75,
      carbs: 40,
      fat: 45
    },
    {
      recipeId: sampleRecipes[7].id,
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 18
    }
  ]

  console.log('Inserting recipes...')
  await db.insert(recipe).values(sampleRecipes)

  console.log('Inserting ingredients with conflict handling...')
  // Insert ingredients with onConflictDoNothing to handle existing ingredients
  for (const ingredientData of allIngredients) {
    await db.insert(ingredient)
      .values(ingredientData)
      .onConflictDoNothing({ target: ingredient.name })
  }

  console.log('Resolving ingredient IDs for recipe relationships...')
  // Ensure we have the correct ingredient IDs (in case some already existed)
  const ingredientMap = new Map()
  for (const ingredientData of allIngredients) {
    const result = await db.select({ id: ingredient.id })
      .from(ingredient)
      .where(sql`${ingredient.name} = ${ingredientData.name}`)
      .limit(1)
    
    if (result.length > 0) {
      ingredientMap.set(ingredientData.id, result[0].id)
    }
  }

  // Update recipe-ingredient relationships with resolved ingredient IDs
  const updatedRecipeIngredients = recipeIngredients.map(ri => {
    const resolvedIngredientId = ingredientMap.get(ri.ingredientId) || ri.ingredientId
    return {
      ...ri,
      ingredientId: resolvedIngredientId
    }
  })

  console.log('Inserting recipe-ingredient relationships...')
  await db.insert(recipeIngredient).values(updatedRecipeIngredients)

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
