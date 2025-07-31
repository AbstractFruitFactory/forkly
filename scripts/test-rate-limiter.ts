import { importRecipeLimiter, globalImportLimiter } from '../src/lib/server/rate-limit'

async function testRateLimiter() {
  console.log('🧪 Testing Rate Limiter...\n')
  
  const testUserId = 'test-user-123'
  
  // Test per-user rate limiting
  console.log('📊 Testing per-user rate limiting (10 requests per hour):')
  
  for (let i = 1; i <= 12; i++) {
    const result = await importRecipeLimiter.checkLimit(testUserId)
    const status = result.allowed ? '✅ ALLOWED' : '❌ BLOCKED'
    console.log(`Request ${i}: ${status} - Remaining: ${result.remaining}`)
    
    if (!result.allowed) {
      console.log(`   Reset time: ${new Date(result.resetTime * 1000).toLocaleTimeString()}`)
    }
  }
  
  console.log('\n🌍 Testing global rate limiting (100 requests per hour):')
  
  // Test global rate limiting
  for (let i = 1; i <= 5; i++) {
    const result = await globalImportLimiter.checkLimit('global')
    const status = result.allowed ? '✅ ALLOWED' : '❌ BLOCKED'
    console.log(`Global request ${i}: ${status} - Remaining: ${result.remaining}`)
  }
  
  console.log('\n📈 Testing getRemaining:')
  const remaining = await importRecipeLimiter.getRemaining(testUserId)
  console.log(`User ${testUserId} has ${remaining.remaining} requests remaining`)
  console.log(`Reset time: ${new Date(remaining.resetTime * 1000).toLocaleTimeString()}`)
  
  console.log('\n✅ Rate limiter test completed!')
}

// Test with different user IDs
async function testMultipleUsers() {
  console.log('\n👥 Testing multiple users...')
  
  const users = ['user1', 'user2', 'user3']
  
  for (const user of users) {
    console.log(`\nTesting user: ${user}`)
    
    for (let i = 1; i <= 3; i++) {
      const result = await importRecipeLimiter.checkLimit(user)
      const status = result.allowed ? '✅ ALLOWED' : '❌ BLOCKED'
      console.log(`  Request ${i}: ${status} - Remaining: ${result.remaining}`)
    }
  }
}

async function main() {
  try {
    await testRateLimiter()
    await testMultipleUsers()
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

main() 