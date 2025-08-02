ALTER TABLE "recipe_draft" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_draft" ADD COLUMN "tags" jsonb;