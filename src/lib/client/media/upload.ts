export type UploadResult = { url: string; type: 'image' | 'video' }

export async function getCloudinarySignature(
  folder: string,
  resourceType: 'image' | 'video'
): Promise<{ cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }> {
  const params = new URLSearchParams({ folder, resource_type: resourceType })
  const res = await fetch(`/cloudinary/sign?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to get upload signature')
  return res.json()
}

export async function uploadMedia(file: File, fieldName: string): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/')
  const folder = fieldName.startsWith('instructions-')
    ? 'instruction-media'
    : isVideo
      ? 'recipe-videos'
      : 'recipe-images'
  const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image'
  const sig = await getCloudinarySignature(folder, resourceType)

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('signature', sig.signature)
  form.append('folder', sig.folder)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`
  const resp = await fetch(uploadUrl, { method: 'POST', body: form })
  if (!resp.ok) throw new Error('Cloudinary upload failed')
  const data = await resp.json()
  return { url: data.secure_url as string, type: isVideo ? 'video' : 'image' }
} 