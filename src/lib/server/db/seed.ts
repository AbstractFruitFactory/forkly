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
        title: 'Classic Spaghetti Carbonara',
        description: 'A traditional Italian pasta dish made with eggs, cheese, pancetta and black pepper.',
        ingredients: [
          { name: 'spaghetti', quantity: 400, measurement: 'grams' as MeasurementUnit, custom: false },
          { name: 'eggs', quantity: 4, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'pecorino romano', quantity: 100, measurement: 'grams' as MeasurementUnit, custom: false },
          { name: 'pancetta', quantity: 200, measurement: 'grams' as MeasurementUnit, custom: false },
          { name: 'black pepper', quantity: 2, measurement: 'teaspoons' as MeasurementUnit, custom: false }
        ] satisfies Ingredient[],
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
        }
      },
      {
        id: generateId(),
        title: 'Classic Chocolate Chip Cookies',
        description: 'Soft and chewy cookies with melty chocolate chips - a timeless favorite!',
        ingredients: [
          { name: 'all-purpose flour', quantity: 2.25, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'butter', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'brown sugar', quantity: 0.75, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'granulated sugar', quantity: 0.75, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'eggs', quantity: 2, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'vanilla extract', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false },
          { name: 'chocolate chips', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false }
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
        userId: null,
        nutrition: {
          totalNutrition: { 
            calories: 2400, 
            protein: 24, 
            carbs: 300, 
            fat: 120 
          },
          hasCustomIngredients: false
        }
      },
      {
        id: generateId(),
        title: 'Fresh Garden Salad',
        description: 'A light and refreshing salad packed with seasonal vegetables and a zesty vinaigrette.',
        ingredients: [
          { name: 'mixed salad greens', quantity: 6, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'cherry tomatoes', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'cucumber', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'red onion', quantity: 0.5, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'olive oil', quantity: 3, measurement: 'tablespoons' as MeasurementUnit, custom: false },
          { name: 'balsamic vinegar', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false },
          { name: 'honey', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false }
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
        userId: null,
        nutrition: {
          totalNutrition: { 
            calories: 320, 
            protein: 4, 
            carbs: 18, 
            fat: 28 
          },
          hasCustomIngredients: false
        }
      },
      {
        id: generateId(),
        title: 'Homemade Pizza',
        description: 'A delicious pizza with a crispy crust and classic toppings.',
        ingredients: [
          { name: 'pizza dough', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'tomato sauce', quantity: 1, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'mozzarella cheese', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'pepperoni', quantity: 4, measurement: 'ounces' as MeasurementUnit, custom: false },
          { name: 'olive oil', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false },
          { name: 'dried oregano', quantity: 1, measurement: 'teaspoons' as MeasurementUnit, custom: false }
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
        userId: null,
        nutrition: {
          totalNutrition: { 
            calories: 2000, 
            protein: 80, 
            carbs: 220, 
            fat: 90 
          },
          hasCustomIngredients: false
        }
      },
      {
        id: generateId(),
        title: 'Chicken Stir-Fry',
        description: 'A quick and healthy Asian-inspired stir-fry with colorful vegetables.',
        ingredients: [
          { name: 'chicken breast', quantity: 1, measurement: 'pounds' as MeasurementUnit, custom: false },
          { name: 'broccoli florets', quantity: 2, measurement: 'cups' as MeasurementUnit, custom: false },
          { name: 'carrots', quantity: 2, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'bell pepper', quantity: 1, measurement: 'pieces' as MeasurementUnit, custom: false },
          { name: 'soy sauce', quantity: 3, measurement: 'tablespoons' as MeasurementUnit, custom: false },
          { name: 'ginger', quantity: 1, measurement: 'tablespoons' as MeasurementUnit, custom: false },
          { name: 'garlic', quantity: 2, measurement: 'cloves' as MeasurementUnit, custom: false },
          { name: 'vegetable oil', quantity: 2, measurement: 'tablespoons' as MeasurementUnit, custom: false }
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
        userId: null,
        nutrition: {
          totalNutrition: { 
            calories: 850, 
            protein: 75, 
            carbs: 40, 
            fat: 45 
          },
          hasCustomIngredients: false
        }
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
