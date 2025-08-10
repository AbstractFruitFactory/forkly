export type UploadResult = { url: string; type: 'image' | 'video' }

async function loadImageBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    if (typeof (globalThis as any).createImageBitmap === 'function') {
      return await (globalThis as any).createImageBitmap(file, { imageOrientation: 'from-image' })
    }
    throw new Error('createImageBitmap not available')
  } catch {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = URL.createObjectURL(file)
    })
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

function getFileBaseName(name: string): string {
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.slice(0, idx) : name
}

async function compressImageIfBeneficial(
  file: File,
  opts: { maxWidth: number; maxHeight: number; quality: number } = { maxWidth: 1600, maxHeight: 1600, quality: 0.8 }
): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.type === 'image/gif') return file
  if (file.size < 300 * 1024) return file

  try {
    const bitmap = await loadImageBitmap(file)
    const srcWidth = 'width' in bitmap ? bitmap.width : (bitmap as any).naturalWidth
    const srcHeight = 'height' in bitmap ? bitmap.height : (bitmap as any).naturalHeight

    const widthScale = opts.maxWidth / srcWidth
    const heightScale = opts.maxHeight / srcHeight
    const scale = Math.min(1, widthScale, heightScale)

    const targetWidth = Math.max(1, Math.round(srcWidth * scale))
    const targetHeight = Math.max(1, Math.round(srcHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.imageSmoothingEnabled = true
    ;(ctx as any).imageSmoothingQuality = 'high'

    if ('close' in bitmap && typeof (bitmap as any).close === 'function') {
      ctx.drawImage(bitmap as ImageBitmap, 0, 0, targetWidth, targetHeight)
      try { (bitmap as any).close() } catch {}
    } else {
      ctx.drawImage(bitmap as HTMLImageElement, 0, 0, targetWidth, targetHeight)
    }

    let blob = await canvasToBlob(canvas, 'image/webp', opts.quality)
    if (!blob) blob = await canvasToBlob(canvas, 'image/jpeg', opts.quality)
    if (!blob) return file

    if (blob.size >= file.size * 0.95) return file

    const name = `${getFileBaseName(file.name)}.webp`
    return new File([blob], name, { type: blob.type })
  } catch {
    return file
  }
}

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

  let fileToUpload = file
  if (!isVideo) {
    fileToUpload = await compressImageIfBeneficial(file)
  }

  const sig = await getCloudinarySignature(folder, resourceType)

  const form = new FormData()
  form.append('file', fileToUpload)
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