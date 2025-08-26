export type FormFields = {
  title: string
  description: string
  servings: number
  instructions: {
    text: string
    hint?: string
    mediaUrl?: string
    mediaType?: 'image' | 'video'
    ingredients?: {
      quantity?: string
      measurement?: string
      name: string
      displayName: string
      isPrepared?: boolean
    }[]
  }[]
  tags: string[]
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc: Record<string, T[]>, item) => {
    const k = keyFn(item)
    ;(acc[k] ||= []).push(item)
    return acc
  }, {})
}

export const parseIngredientOrInstruction = (formData: FormData, keyPrefix: string) =>
  Array.from(formData.entries())
    .filter(([key]) => key.startsWith(keyPrefix))
    .map(([key, value]) => {
      const parts = key.split('-')
      const id = parts[1]
      const field = parts[2]
      return { id, field, value: value.toString() }
    })

export const parseFormData = (formData: FormData): FormFields => {
  const tags = formData.getAll('tags').map((value) => value.toString())

  const instructionEntries = parseIngredientOrInstruction(formData, 'instructions')
  const instructionById = groupBy(instructionEntries, (entry) => entry.id)

  const instructions: FormFields['instructions'] = Object.values(instructionById).map((entries) => {
    let text = ''
    let hint: string | undefined
    const ingredients: NonNullable<FormFields['instructions'][number]['ingredients']> = []

    for (const entry of entries!) {
      const { field, value } = entry
      if (field === 'text') {
        text = value
      } else if (field === 'hint') {
        hint = value
      }
    }

    const instructionId = entries![0]?.id
    if (instructionId) {
      const ingredientEntries = Array.from(formData.entries())
        .filter(([key]) => key.startsWith(`instructions-${instructionId}-ingredient-`))
        .map(([key, value]) => {
          const parts = key.split('-')
          const ingredientId = parts[3]
          const field = parts[4]
          return { id: ingredientId, field, value: value.toString() }
        })

      const ingredientById = groupBy(ingredientEntries, (entry) => entry.id)

      Object.values(ingredientById).forEach((ingredientEntries) => {
        if (ingredientEntries) {
          let name = ''
          let quantity: string | undefined
          let measurement = ''
          let isPrepared = false

          for (const entry of ingredientEntries) {
            const { field, value } = entry
            if (field === 'name') {
              name = value
            } else if (field === 'amount') {
              quantity = value
            } else if (field === 'unit') {
              measurement = value
            } else if (field === 'isPrepared') {
              isPrepared = value === 'true' || value === '1'
            }
          }

          if (name) {
            ingredients.push({
              name,
              displayName: name,
              quantity: isPrepared ? undefined : quantity,
              measurement: isPrepared ? undefined : measurement || undefined,
              isPrepared
            })
          }
        }
      })
    }

    return {
      text,
      hint,
      mediaUrl: undefined,
      mediaType: undefined,
      ingredients: ingredients.length > 0 ? ingredients : undefined
    }
  })

  return {
    title: formData.get('title')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    servings: parseInt(formData.get('servings')?.toString() ?? '1') || 1,
    instructions,
    tags
  }
} 