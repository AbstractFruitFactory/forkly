CREATE TABLE IF NOT EXISTS "recipe_bookmark" (
  "user_id" text NOT NULL,
  "recipe_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "recipe_bookmark_user_id_recipe_id_pk" PRIMARY KEY("user_id","recipe_id"),
  CONSTRAINT "recipe_bookmark_user_id_fk" FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "recipe_bookmark_recipe_id_fk" FOREIGN KEY("recipe_id") REFERENCES "recipe"("id") ON DELETE CASCADE
); 