import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config()

async function createCommentsTable() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const client = postgres(process.env.DATABASE_URL)

  try {
    // Create the recipe_comment table
    await client`
      CREATE TABLE IF NOT EXISTS recipe_comment (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        recipe_id text NOT NULL,
        content text NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `

    // Add foreign key constraints
    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'recipe_comment_user_id_fk'
        ) THEN
          ALTER TABLE recipe_comment 
          ADD CONSTRAINT recipe_comment_user_id_fk 
          FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
        END IF;
      END
      $$
    `

    await client`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'recipe_comment_recipe_id_fk'
        ) THEN
          ALTER TABLE recipe_comment 
          ADD CONSTRAINT recipe_comment_recipe_id_fk 
          FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE;
        END IF;
      END
      $$
    `

    // Create indexes for better performance
    await client`
      CREATE INDEX IF NOT EXISTS recipe_comment_recipe_id_idx ON recipe_comment (recipe_id)
    `

    await client`
      CREATE INDEX IF NOT EXISTS recipe_comment_user_id_idx ON recipe_comment (user_id)
    `

    console.log('Recipe comments table created successfully!')
  } catch (error) {
    console.error('Error creating recipe comments table:', error)
  } finally {
    await client.end()
  }
}

createCommentsTable().catch(console.error) 