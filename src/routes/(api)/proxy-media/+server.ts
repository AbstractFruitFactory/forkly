import { error } from '@sveltejs/kit'

export const GET = async ({ url }) => {
  const targetUrl = url.searchParams.get('url')
  
  if (!targetUrl) {
    throw error(400, 'URL parameter is required')
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': new URL(targetUrl).origin,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    })

    if (!response.ok) {
      console.error(`Proxy failed for ${targetUrl}: ${response.status} ${response.statusText}`)
      throw error(response.status, `Failed to fetch image: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      console.warn(`Non-image content type for ${targetUrl}: ${contentType}`)
      // Don't throw error, just log warning - some servers don't set content-type correctly
    }

    const arrayBuffer = await response.arrayBuffer()
    
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (err) {
    console.error('Proxy media error for', targetUrl, ':', err)
    if (err instanceof Response) {
      throw err
    }
    throw error(500, 'Failed to proxy media')
  }
} 