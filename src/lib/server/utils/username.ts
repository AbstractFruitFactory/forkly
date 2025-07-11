export const sanitizeUsername = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
}

import { db } from '../db'
import * as table from '../db/schema'
import { eq } from 'drizzle-orm'

export const generateAvailableUsername = async (name: string): Promise<string> => {
  let base = sanitizeUsername(name)
  if (base.length < 3) {
    base = (base + '_user').slice(0, 31)
  } else if (base.length > 31) {
    base = base.slice(0, 31)
  }

  let candidate = base
  while (true) {
    const exists = await db
      .select()
      .from(table.user)
      .where(eq(table.user.username, candidate))
      .limit(1)

    if (!exists.length) {
      return candidate
    }

    const bytes = crypto.getRandomValues(new Uint8Array(2))
    const suffix = Array.from(bytes)
      .map((b) => b.toString(36))
      .join('')
      .slice(0, 3)
    const trimmed = base.slice(0, 31 - suffix.length - 1)
    candidate = `${trimmed}_${suffix}`
  }
}
