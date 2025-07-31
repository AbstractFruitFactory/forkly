import { spawn } from 'child_process'

async function testImportAPI() {
  console.log('🧪 Testing Import API with Rate Limiting...\n')
  
  const baseUrl = 'http://localhost:5173'
  const testUrl = 'https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/'
  
  console.log('📊 Testing rate limiting on import endpoint:')
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Test URL: ${testUrl}\n`)
  
  // Note: This is a basic test - you'll need to be authenticated
  // In a real scenario, you'd need to login first and get a session cookie
  
  for (let i = 1; i <= 15; i++) {
    console.log(`Request ${i}:`)
    
    try {
      const response = await fetch(`${baseUrl}/import-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here if needed
        },
        body: JSON.stringify({ url: testUrl })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        console.log(`  ✅ SUCCESS - Job ID: ${data.jobId}`)
        console.log(`  📊 Remaining: ${data.remaining}`)
      } else {
        console.log(`  ❌ ERROR - ${response.status}: ${data.error}`)
        
        if (response.status === 429) {
          console.log(`  ⏰ Rate limit headers:`)
          console.log(`    X-RateLimit-Remaining: ${response.headers.get('X-RateLimit-Remaining')}`)
          console.log(`    X-RateLimit-Reset: ${response.headers.get('X-RateLimit-Reset')}`)
        }
      }
    } catch (error) {
      console.log(`  ❌ REQUEST FAILED: ${error}`)
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n✅ API test completed!')
}

async function testRateLimitEndpoint() {
  console.log('\n📈 Testing rate limit status endpoint:')
  
  try {
    const response = await fetch('http://localhost:5173/import-recipe/limits', {
      headers: {
        // Add authentication headers here if needed
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Rate limit status:')
      console.log(`  Remaining: ${data.remaining}`)
      console.log(`  Max requests: ${data.maxRequests}`)
      console.log(`  Reset time: ${new Date(data.resetTime * 1000).toLocaleTimeString()}`)
    } else {
      console.log(`❌ Failed to get rate limit status: ${response.status}`)
    }
  } catch (error) {
    console.log(`❌ Request failed: ${error}`)
  }
}

async function main() {
  try {
    await testImportAPI()
    await testRateLimitEndpoint()
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

main() 