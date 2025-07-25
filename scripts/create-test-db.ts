import { Client } from 'pg'
import dotenv from 'dotenv'
import { parse } from 'pg-connection-string'

// Load .env.test for test DB URL
dotenv.config({ path: '.env.test' })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.test')
  process.exit(1)
}

const config = parse(process.env.DATABASE_URL)
const testDbName = config.database
if (!testDbName) {
  console.error('No database name found in DATABASE_URL')
  process.exit(1)
}

async function ensureTestDb() {
  // Connect to default db (postgres)
  const adminConfig = { ...config, database: 'postgres' }
  const client = new Client(adminConfig)
  await client.connect()

  // Check if test DB exists
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDbName])
  if (res.rowCount === 0) {
    console.log(`Creating test database: ${testDbName}`)
    await client.query(`CREATE DATABASE "${testDbName}"`)
  } else {
    console.log(`Test database '${testDbName}' already exists.`)
  }
  await client.end()
}

ensureTestDb().catch(e => {
  console.error(e)
  process.exit(1)
}) 