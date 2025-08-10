import { v2 as cloudinary } from 'cloudinary'
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '$env/static/private'

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

const TMP_FOLDERS = ['recipe-images-tmp', 'recipe-videos-tmp', 'instruction-media-tmp'] as const
const TTL_HOURS = Number(process.env.TEMP_MEDIA_TTL_HOURS || 48)

async function deleteByPrefixOlderThan(folder: string, olderThan: Date) {
  const expr = `folder=${folder} AND uploaded_at<${olderThan.toISOString()}`
  let nextCursor: string | undefined
  let total = 0
  do {
    const res = await cloudinary.search
      .expression(expr)
      .with_field('public_id')
      .max_results(100)
      .next_cursor(nextCursor)
      .execute() as any

    const ids: string[] = (res.resources || []).map((r: any) => r.public_id)
    if (ids.length > 0) {
      const del = await cloudinary.api.delete_resources(ids, { resource_type: 'image' } as any)
      const delVid = await cloudinary.api.delete_resources(ids, { resource_type: 'video' } as any)
      total += ids.length
    }
    nextCursor = res.next_cursor
  } while (nextCursor)
  return total
}

async function run() {
  const cutoff = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000)
  for (const folder of TMP_FOLDERS) {
    try {
      const n = await deleteByPrefixOlderThan(folder, cutoff)
      console.log(`Deleted ${n} assets from ${folder} older than ${TTL_HOURS}h`)
    } catch (e) {
      console.error(`Failed to clean ${folder}`, e)
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
}) 