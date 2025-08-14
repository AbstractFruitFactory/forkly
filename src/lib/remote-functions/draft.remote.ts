import { command, getRequestEvent } from "$app/server"
import { error, redirect } from "@sveltejs/kit"
import * as v from 'valibot'
import { RecipeSchema, instructionSchema } from "./schemas"
import { db } from '$lib/server/db'
import { recipe, recipeDraft, recipeInstruction } from '$lib/server/db/schema'
import { generateId } from '$lib/server/id'
import { getDraft, deleteDraft as deleteDraftDb, updateDraft as updateDraftDb } from "$lib/server/db/draft"
import { deleteImage, moveMediaFromTmpFolder } from "$lib/server/cloudinary"
import { deleteVideo } from "$lib/server/cloudinary"
import { eq } from 'drizzle-orm'

const DraftRecipeSchema = v.intersect([
  v.partial(v.omit(RecipeSchema, ['instructions'])),
  v.object({
    title: v.string(),
    instructions: v.optional(
      v.array(
        v.intersect([
          v.partial(v.omit(instructionSchema, ['text'])),
          v.object({ text: v.optional(v.string()) })
        ])
      )
    )
  })
])

const UpdateDraftSchema = v.intersect([
  DraftRecipeSchema,
  v.object({ id: v.string(), createdAt: v.date() })
])

async function isUrlReferenced(url: string): Promise<boolean> {
  const recipeRef = await db.select().from(recipe).where(eq(recipe.imageUrl, url)).limit(1)
  if (recipeRef.length) return true
  const instrRef = await db.select().from(recipeInstruction).where(eq(recipeInstruction.mediaUrl, url)).limit(1)
  return instrRef.length > 0
}

export const saveDraft = command(DraftRecipeSchema, async (recipe) => {
  const { locals } = getRequestEvent()
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const draftId = generateId()

  await db.insert(recipeDraft).values({
    id: draftId,
    userId: locals.user.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    servings: recipe.servings,
    instructions: recipe.instructions,
    tags: recipe.tags,
    createdAt: new Date()
  })

  await moveMediaFromTmpFolder(recipe.imageUrl, recipe.instructions)

  return { id: draftId, redirectTo: `/user/${locals.user.username}?tab=Drafts` }
})

export const updateDraft = command(UpdateDraftSchema, async (recipe) => {
  const { locals } = getRequestEvent()
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const existing = await getDraft(recipe.id, locals.user.id)
  if (!existing) error(404, { message: 'Draft not found or not owned by user' })

  try {
    await updateDraftDb(recipe.id, locals.user.id, {
      ...recipe,
      userId: locals.user.id
    })
  } catch (e) {
    console.error('Failed to update draft', e)
    error(500, { message: 'Failed to update draft' })
  }

  const oldUrls = new Set<string>()
  if (existing.imageUrl) oldUrls.add(existing.imageUrl)
  const oldInstructions = Array.isArray(existing.instructions) ? existing.instructions : []
  for (const ins of oldInstructions) {
    if (ins?.mediaUrl) oldUrls.add(ins.mediaUrl)
  }

  const newUrls = new Set<string>()
  if (recipe.imageUrl) newUrls.add(recipe.imageUrl)
  const newInstructions = Array.isArray(recipe.instructions) ? recipe.instructions : []
  for (const ins of newInstructions) {
    if (ins?.mediaUrl) newUrls.add(ins.mediaUrl)
  }

  const toDelete = [...oldUrls].filter((u) => !newUrls.has(u))

  for (const url of toDelete) {
    try {
      const referenced = await isUrlReferenced(url)
      if (referenced) continue
      const ins = oldInstructions.find((i) => i?.mediaUrl === url)
      const type = ins?.mediaType === 'video' ? 'video' : 'image'
      if (type === 'video') await deleteVideo(url)
      else await deleteImage(url)
    } catch (e) {
      console.error('Failed to delete draft media from Cloudinary', url, e)
    }
  }
})

export const deleteDraft = command(v.object({ id: v.string() }), async ({ id }) => {
  const { locals } = getRequestEvent()
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const existing = await getDraft(id, locals.user.id)
  if (!existing) error(404, { message: 'Draft not found or not owned by user' })

  await deleteDraftDb(id, locals.user.id)

  const urls: { url: string; type: 'image' | 'video' }[] = []
  if (existing.imageUrl) urls.push({ url: existing.imageUrl, type: 'image' })
  const instructions: any[] = Array.isArray(existing.instructions) ? existing.instructions : []
  for (const ins of instructions) {
    if (ins?.mediaUrl) urls.push({ url: ins.mediaUrl, type: ins.mediaType === 'video' ? 'video' : 'image' })
  }

  for (const item of urls) {
    try {
      const referenced = await isUrlReferenced(item.url)
      if (referenced) continue
      if (item.type === 'video') await deleteVideo(item.url)
      else await deleteImage(item.url)
    } catch (e) {
      console.error('Failed to delete draft media from Cloudinary', item.url, e)
    }
  }
})