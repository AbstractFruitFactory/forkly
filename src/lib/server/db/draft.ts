import { and, eq } from "drizzle-orm"
import { db } from "."
import { recipeDraft, type RecipeDraft } from "./schema"

export const saveDraft = async (draft: RecipeDraft) => {
  await db.insert(recipeDraft).values(draft)
}

export const getDraft = async (draftId: string, userId: string) => {
  const existing = await db.select().from(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId))).limit(1)
  if (!existing.length) return undefined
  return existing[0]
}

export const updateDraft = async (draftId: string, userId: string, draft: RecipeDraft) => {
  await db.update(recipeDraft).set(draft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId)))
}

export const deleteDraft = async (draftId: string, userId: string) => {
  await db.delete(recipeDraft).where(and(eq(recipeDraft.id, draftId), eq(recipeDraft.userId, userId)))
}
