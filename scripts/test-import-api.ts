import { spawn } from 'child_process'

async function testImportAPI() {
  console.log('🧪 Testing Import API with Rate Limiting...\n')
  
  const baseUrl = 'http://localhost:5173'
  const testUrl = 'https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/'
  const testText = `
Chocolate Chip Cookies

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup (2 sticks) butter, softened
- 3/4 cup granulated sugar
- 3/4 cup packed brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F (190°C)
2. Mix flour, baking soda, and salt in a small bowl
3. Beat butter, granulated sugar, and brown sugar until creamy
4. Add eggs and vanilla; beat well
5. Gradually mix in flour mixture
6. Stir in chocolate chips
7. Drop by rounded tablespoon onto ungreased baking sheets
8. Bake for 9 to 11 minutes or until golden brown
9. Cool on baking sheets for 2 minutes; remove to wire racks to cool completely

Makes about 5 dozen cookies.
  `.trim()
  
  console.log('📊 Testing rate limiting on import endpoint:')
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Test URL: ${testUrl}`)
  console.log(`Test Text: ${testText.substring(0, 100)}...\n`)
  
  // Note: This is a basic test - you'll need to be authenticated
  // In a real scenario, you'd need to login first and get a session cookie
  
  console.log('🔗 Testing URL-based imports:')
  for (let i = 1; i <= 5; i++) {
    console.log(`URL Request ${i}:`)
    
    try {
      const response = await fetch(`${baseUrl}/import-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here if needed
        },
        body: JSON.stringify({ 
          url: testUrl,
          inputType: 'url'
        })
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

  console.log('\n📝 Testing text-based imports:')
  for (let i = 1; i <= 5; i++) {
    console.log(`Text Request ${i}:`)
    
    try {
      const response = await fetch(`${baseUrl}/import-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here if needed
        },
        body: JSON.stringify({ 
          text: testText,
          inputType: 'text'
        })
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

  console.log('\n❌ Testing invalid input types:')
  
  // Test invalid input type
  try {
    const response = await fetch(`${baseUrl}/import-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: testUrl,
        inputType: 'invalid'
      })
    })
    
    const data = await response.json()
    console.log(`Invalid input type test: ${response.status === 400 ? '✅' : '❌'} - ${data.error}`)
  } catch (error) {
    console.log(`  ❌ REQUEST FAILED: ${error}`)
  }

  // Test missing input type
  try {
    const response = await fetch(`${baseUrl}/import-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: testUrl
      })
    })
    
    const data = await response.json()
    console.log(`Missing input type test: ${response.status === 400 ? '✅' : '❌'} - ${data.error}`)
  } catch (error) {
    console.log(`  ❌ REQUEST FAILED: ${error}`)
  }

  // Test text too short
  try {
    const response = await fetch(`${baseUrl}/import-recipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: 'Too short',
        inputType: 'text'
      })
    })
    
    const data = await response.json()
    console.log(`Short text test: ${response.status === 400 ? '✅' : '❌'} - ${data.error}`)
  } catch (error) {
    console.log(`  ❌ REQUEST FAILED: ${error}`)
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