import { sanitizeIngredientQueue } from '../src/lib/server/queue'
import { redis } from '../src/lib/server/redis'
import dotenv from 'dotenv'

dotenv.config()

async function testSanitizeIngredient() {
  console.log('🧪 Testing Ingredient Sanitization System...\n')

  const baseUrl = process.env.BASE_URL || 'http://localhost:5173'
  const testRecipeId = 'test-recipe-123'

  console.log('📝 Testing manual sanitization trigger:')
  
  try {
    const response = await fetch(`${baseUrl}/sanitize-ingredient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here if needed
      },
      body: JSON.stringify({ 
        recipeId: testRecipeId
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log(`  ✅ SUCCESS - Job ID: ${data.jobId}`)
      console.log(`  📊 Message: ${data.message}`)
      
      // Test status endpoint
      console.log('\n📊 Testing status endpoint:')
      const statusResponse = await fetch(`${baseUrl}/sanitize-ingredient/status/${data.jobId}`)
      const statusData = await statusResponse.json()
      
      if (statusResponse.ok) {
        console.log(`  ✅ Status check successful`)
        console.log(`  📊 Status: ${JSON.stringify(statusData, null, 2)}`)
      } else {
        console.log(`  ❌ Status check failed: ${statusData.error}`)
      }
    } else {
      console.log(`  ❌ ERROR - ${response.status}: ${data.error}`)
    }
  } catch (error) {
    console.log(`  ❌ REQUEST FAILED: ${error}`)
  }

  console.log('\n📝 Testing queue directly:')
  
  try {
    const job = await sanitizeIngredientQueue.add('sanitize', {
      recipeId: testRecipeId
    })
    
    console.log(`  ✅ Job queued successfully - Job ID: ${job.id}`)
    
    // Wait a bit and check status
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = await redis.get(`sanitize-ingredient:result:${job.id}`)
    if (result) {
      console.log(`  📊 Job result: ${result}`)
    } else {
      console.log(`  ⏳ Job still pending...`)
    }
  } catch (error) {
    console.log(`  ❌ Queue test failed: ${error}`)
  }

  console.log('\n✅ Test completed!')
}

testSanitizeIngredient().catch(console.error) 