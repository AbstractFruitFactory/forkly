const UPLOAD_SEGMENT = '/image/upload/'

type CloudinaryOptions = {
	width?: number
	quality?: string
	format?: string
	crop?: string
}

const isCloudinaryImage = (url: string): boolean =>
	url.includes('res.cloudinary.com') && url.includes(UPLOAD_SEGMENT)

export const optimizeImageUrl = (
	url: string | undefined,
	{ width, quality = 'auto', format = 'auto', crop = 'limit' }: CloudinaryOptions = {}
): string | undefined => {
	if (!url || !isCloudinaryImage(url)) return url

	const params = [`f_${format}`, `q_${quality}`, `c_${crop}`]
	if (width) params.push(`w_${width}`)

	const [prefix, rest] = url.split(UPLOAD_SEGMENT)
	return `${prefix}${UPLOAD_SEGMENT}${params.join(',')}/${rest}`
}

export const buildImageSrcset = (
	url: string | undefined,
	widths: number[],
	options: Omit<CloudinaryOptions, 'width'> = {}
): string | undefined => {
	if (!url || !isCloudinaryImage(url)) return undefined

	return widths.map((width) => `${optimizeImageUrl(url, { ...options, width })} ${width}w`).join(', ')
}
