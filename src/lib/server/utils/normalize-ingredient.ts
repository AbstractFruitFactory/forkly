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
  'strained', 'thawed', 'unflavored', 'unpeeled', 'unsalted', 'whole', 'crushed'
]

export const normalizeIngredientName = (input: string): string => {
  let name = input.toLowerCase().trim()

  // Remove parentheses
  name = name.replace(/\(.*?\)/g, '').trim()

  // Remove numbers
  name = name.replace(/[0-9]/g, '')

  // Remove emoji (unicode emoji ranges)
  name = name.replace(/[\p{Emoji}\uFE0F]/gu, '').trim()

  // Remove all special characters (punctuation), keep only letters (including accents), spaces, and hyphens
  name = name.replace(/[^\p{L}\s-]/gu, '').trim()

  // Remove 'for ...' phrases (usage notes)
  name = name.replace(/\bfor\b.*$/, '').trim()

  // Strip known safe prep adjectives
  const tokens = name.split(/\s+/).filter(word => !PREP_ADJECTIVES.includes(word))
  const cleaned = tokens.join(' ')

  //  Normalize nouns (preserve accents)
  // compromise may remove accents, so fallback to cleaned if accents are lost
  const doc = nlp(cleaned)
  let normalized = doc.nouns().toSingular().out('text').trim()
  if (normalized && !/[\u00C0-\u017F]/.test(normalized) && /[\u00C0-\u017F]/.test(cleaned)) {
    normalized = cleaned
  }
  if (normalized == '') {
    return cleaned
  }
  // Fallback: singularize common accented Spanish/Portuguese plurals
  normalized = normalized.replace(/([aeiouáéíóú])s\b/g, '$1')

  // Replace dashes with spaces
  normalized = normalized.replace(/-/g, ' ')
  return normalized
}
