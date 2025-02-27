import { recipe } from './schema'
import { generateId } from '../id'
import type { Ingredient, MeasurementUnit } from '$lib/types'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = postgres(process.env.DATABASE_URL as string)
export const db = drizzle(client)

export const seed = async () => {
  try {
    // Check if we already have recipes
    const existingRecipes = await db.select().from(recipe).limit(1)

    if (existingRecipes.length > 0) {
      console.log('Database already seeded, skipping...')
      return
    }

    const sampleRecipes = [
      {
        id: generateId(),
        title: 'Grilled Salmon with Asparagus',
        description: 'Perfectly grilled salmon fillet served with fresh asparagus and creamy mashed potatoes, garnished with lemon and microgreens.',
        ingredients: [
          { name: 'salmon fillet', quantity: 6, measurement: 'ounces' as MeasurementUnit, custom: false, spoonacularId: 15076 },
          { name: 'asparagus', quantity: 8, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 11011 },
          { name: 'potatoes', quantity: 2, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 11352 },
          { name: 'butter', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 1001 },
          { name: 'milk', quantity: 0.25, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 1077 },
          { name: 'lemon', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 9150 },
          { name: 'black pepper', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 1002030 },
          { name: 'salt', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 2047 },
          { name: 'olive oil', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 4053 },
          { name: 'microgreens', quantity: 0.5, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 11001 }
        ] satisfies Ingredient[],
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
        nutrition: {
          totalNutrition: {
            calories: 580,
            protein: 42,
            carbs: 35,
            fat: 32
          },
          hasCustomIngredients: false
        },
        diets: ['pescatarian']
      },
      {
        id: generateId(),
        title: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
        ingredients: [
          { name: 'spaghetti', quantity: 400, measurement: 'grams' as MeasurementUnit, custom: false, spoonacularId: 11420 },
          { name: 'eggs', quantity: 4, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 1123 },
          { name: 'pecorino romano', quantity: 100, measurement: 'grams' as MeasurementUnit, custom: false, spoonacularId: 1038 },
          { name: 'pancetta', quantity: 200, measurement: 'grams' as MeasurementUnit, custom: false, spoonacularId: 10123 },
          { name: 'black pepper', quantity: 2, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 1002030 }
        ] satisfies Ingredient[],
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=80',
        instructions: [
          'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.',
          'While pasta cooks, cut pancetta into small cubes and fry until crispy.',
          'In a bowl, whisk together eggs, grated pecorino romano, and black pepper.',
          'Drain pasta, reserving some pasta water. While pasta is still very hot, quickly stir in the egg mixture and pancetta.',
          'Add pasta water as needed to create a creamy sauce. Serve immediately with extra cheese and black pepper.'
        ],
        userId: null,
        nutrition: {
          totalNutrition: {
            calories: 1200,
            protein: 45,
            carbs: 120,
            fat: 55
          },
          hasCustomIngredients: false
        },
        diets: []
      },
      {
        id: generateId(),
        title: 'Classic Chocolate Chip Cookies',
        description: 'Soft and chewy cookies with melty chocolate chips - a timeless favorite!',
        ingredients: [
          { name: 'all-purpose flour', quantity: 2.25, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100902 },
          { name: 'butter', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100400 },
          { name: 'brown sugar', quantity: 0.75, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100101200 },
          { name: 'granulated sugar', quantity: 0.75, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100101200 },
          { name: 'eggs', quantity: 2, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 1123 },
          { name: 'vanilla extract', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 100100903 },
          { name: 'chocolate chips', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100110300 }
        ] satisfies Ingredient[],
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
        nutrition: {
          totalNutrition: {
            calories: 180,
            protein: 2,
            carbs: 24,
            fat: 9
          },
          hasCustomIngredients: false
        },
        diets: ['vegetarian']
      },
      {
        id: generateId(),
        title: 'Fresh Garden Salad',
        description: 'A light and refreshing salad packed with seasonal vegetables and a zesty vinaigrette.',
        ingredients: [
          { name: 'mixed salad greens', quantity: 6, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'cherry tomatoes', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'cucumber', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'red onion', quantity: 0.5, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'olive oil', quantity: 3, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100902 },
          { name: 'balsamic vinegar', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100400 },
          { name: 'honey', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 100101200 }
        ] satisfies Ingredient[],
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
        nutrition: {
          totalNutrition: {
            calories: 320,
            protein: 4,
            carbs: 18,
            fat: 28
          },
          hasCustomIngredients: false
        },
        diets: []
      },
      {
        id: generateId(),
        title: 'Homemade Pizza',
        description: 'A delicious pizza with a crispy crust and classic toppings.',
        ingredients: [
          { name: 'pizza dough', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 100100902 },
          { name: 'tomato sauce', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100800 },
          { name: 'mozzarella cheese', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 10080 },
          { name: 'pepperoni', quantity: 4, measurement: 'ounces' as MeasurementUnit, custom: false, spoonacularId: 10020 },
          { name: 'olive oil', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100902 },
          { name: 'dried oregano', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false, spoonacularId: 10020 }
        ] satisfies Ingredient[],
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
        nutrition: {
          totalNutrition: {
            calories: 2000,
            protein: 80,
            carbs: 220,
            fat: 90
          },
          hasCustomIngredients: false
        },
        diets: []
      },
      {
        id: generateId(),
        title: 'Chicken Stir-Fry',
        description: 'A quick and healthy Asian-inspired stir-fry with colorful vegetables.',
        ingredients: [
          { name: 'chicken breast', quantity: 1, measurement: 'pounds' as MeasurementUnit, custom: false, spoonacularId: 100100902 },
          { name: 'broccoli florets', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'carrots', quantity: 2, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'bell pepper', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false, spoonacularId: 100100200 },
          { name: 'soy sauce', quantity: 3, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100903 },
          { name: 'ginger', quantity: 1, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100903 },
          { name: 'garlic', quantity: 2, measurement: 'cloves' as MeasurementUnit, custom: false, spoonacularId: 100100903 },
          { name: 'vegetable oil', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false, spoonacularId: 100100902 }
        ] satisfies Ingredient[],
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
        nutrition: {
          totalNutrition: {
            calories: 850,
            protein: 75,
            carbs: 40,
            fat: 45
          },
          hasCustomIngredients: false
        },
        diets: []
      }
    ]

    // Insert sample recipes
    await db.insert(recipe).values(sampleRecipes)
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seed().catch((err) => {
  console.error('Failed to seed database:', err)
  process.exit(1)
}).then(() => {
  console.log('Database seeded successfully!')
  process.exit(0)
})
