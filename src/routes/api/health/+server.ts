import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { sql } from 'drizzle-orm'

export const GET = async () => {
  try {
    console.log('Health check endpoint called')
    
    // Test database connection
    const result = await db.execute(sql`SELECT 1 as test`)
    console.log('Database connection test result:', result)
    
    return json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 