import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  throw new Error('DATABASE_URL is not set')
}

console.log('Initializing database connection...')
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)

const client = postgres(process.env.DATABASE_URL, {
  onnotice: (notice) => console.log('Database notice:', notice),
  onparameter: (parameterStatus) => console.log('Database parameter:', parameterStatus)
})

export const db = drizzle(client)
