import nlp from 'compromise'

const PREP_ADJECTIVES = [
  // Prep techniques
  'beaten', 'blended', 'broken', 'bruised', 'chopped', 'crumbled', 'cubed', 'cut',
  'deveined', 'diced', 'drained', 'filleted', 'grated', 'ground', 'halved',
  'infused', 'julienned', 'mashed', 'minced', 'peeled', 'pitted', 'pressed',
  'pureed', 'rinsed', 'scooped', 'scraped', 'seeded', 'separated', 'shaved',
  'shredded', 'sliced', 'smashed', 'spiralized', 'split', 'squashed', 'trimmed',
  'washed', 'zested',

  // Cooking methods/states
  'baked', 'blanched', 'boiled', 'braised', 'broiled', 'cooked', 'fried', 'grilled',
  'pan-fried', 'poached', 'roasted', 'sauteed', 'scorched', 'seared', 'simmered',
  'slow-cooked', 'smoked', 'steamed', 'stewed', 'toasted', 'wilted',

  // Condition/state descriptors
  'aged', 'boneless', 'canned', 'clarified', 'concentrated', 'crumbed',
  'defrosted', 'dehydrated', 'deshelled', 'dried', 'frozen', 'hydrated',
  'marinated', 'organic', 'packaged', 'pickled', 'powdered', 'preserved',
  'raw', 'rehydrated', 'rindless', 'salted', 'shelled', 'skinless', 'softened',
  'strained', 'thawed', 'unflavored', 'unpeeled', 'unsalted', 'whole'
]

export const normalizeIngredientName = (input: string): string => {
  let name = input.toLowerCase().trim()

  // Step 1: Remove parentheses
  name = name.replace(/\(.*?\)/g, '').trim()

  // Step 2: Remove punctuation
  name = name.replace(/[.,/#!$%^&*;:{}=\-_`~()\[\]"]/g, '').trim()

  // Step 3: Remove "for ..." phrases (usage notes)
  name = name.replace(/\bfor\b.*$/, '').trim()

  // Step 4: Strip known safe prep adjectives
  const tokens = name.split(/\s+/).filter(word => !PREP_ADJECTIVES.includes(word))
  const cleaned = tokens.join(' ')

  // Step 5: Normalize nouns
  const doc = nlp(cleaned)

  const normalized = doc.nouns().toSingular().out('text').trim()

  if (normalized == '') {
    return cleaned
  }

  return normalized
}
