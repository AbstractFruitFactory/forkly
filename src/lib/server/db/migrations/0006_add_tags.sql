CREATE TABLE "tag" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "tag_name_length" CHECK (length(name) < 15)
);

CREATE TABLE "recipe_tag" (
    "recipe_id" text NOT NULL REFERENCES "recipe"("id") ON DELETE CASCADE,
    "tag_id" text NOT NULL REFERENCES "tag"("id") ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "recipe_tag_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id", "tag_id")
);
