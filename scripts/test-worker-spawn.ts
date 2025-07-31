import { spawnImportWorker } from './spawn-worker'

async function testWorkerSpawn() {
  console.log('Testing worker spawn...')
  
  try {
    await spawnImportWorker()
    console.log('✅ Worker spawned and completed successfully')
  } catch (error) {
    console.error('❌ Worker spawn failed:', error)
    process.exit(1)
  }
}

testWorkerSpawn() 