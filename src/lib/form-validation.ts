import * as v from 'valibot'
import { measurementUnits } from '$lib/types'
import type { MeasurementUnit } from '$lib/types'

export const ingredientSchema = v.object({
    name: v.pipe(
        v.string(),
        v.transform(input => input ?? ''),
        v.minLength(1, 'Ingredient name is required'),
        v.maxLength(100, 'Ingredient name must be less than 100 characters')
    ),
    quantity: v.pipe(
        v.number('Please enter a valid number'),
        v.minValue(0, 'Quantity must be a positive number')
    ),
    measurement: v.pipe(
        v.string(),
        v.transform(input => input ?? ''),
        v.minLength(1, 'Measurement is required'),
        v.custom<MeasurementUnit>(
            (value) => measurementUnits.includes(value as MeasurementUnit),
            'Invalid measurement unit'
        )
    )
})

export const recipeSchema = v.object({
    title: v.pipe(
        v.string(),
        v.transform(input => input ?? ''),
        v.minLength(1, 'Title is required'),
        v.maxLength(100, 'Title must be less than 100 characters')
    ),
    description: v.pipe(
        v.string(),
        v.transform(input => input ?? ''),
        v.maxLength(500, 'Description must be less than 500 characters')
    ),
    ingredients: v.array(ingredientSchema),
    instructions: v.array(v.pipe(
        v.string(),
        v.transform(input => input ?? ''),
        v.minLength(1, 'Instruction step cannot be empty'),
        v.maxLength(1000, 'Instruction step must be less than 1000 characters')
    ))
})

// Export type for the validated recipe
export type Recipe = v.InferOutput<typeof recipeSchema> 