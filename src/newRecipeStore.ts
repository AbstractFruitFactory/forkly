import { writable, Writable } from 'svelte/store'

type Ingredient = {
    name: string,
    quantity: number,
    measurement: string
}

export const ingredients: Writable<Ingredient[]> = writable([])