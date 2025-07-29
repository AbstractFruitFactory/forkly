# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Management
- `pnpm db:start` - Start PostgreSQL database via Docker Compose
- `pnpm db:push` - Push schema changes to database and seed data  
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data
- `pnpm db:studio` - Open Drizzle Studio for database inspection
- `pnpm db:reset` - Drop, recreate, and seed database

### Development & Testing
- `pnpm dev` - Start development server with recipe import worker
- `pnpm build` - Build production version
- `pnpm check` - Run Svelte type checking
- `pnpm format` - Format code with Prettier
- `pnpm lint` - Check code formatting with Prettier
- `pnpm test` - Run test suite with Vitest
- `pnpm test:watch` - Run tests in watch mode

### Storybook
- `pnpm storybook` - Start Storybook development server
- `pnpm build-storybook` - Build static Storybook

## Architecture

### Tech Stack
- **Frontend**: SvelteKit with Svelte 5 syntax, TypeScript, SCSS
- **Backend**: SvelteKit server routes with PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM 
- **Authentication**: Custom session-based auth with Google OAuth
- **Deployment**: Vercel with adapter-vercel
- **Component Library**: Custom components with Storybook documentation

### Database schema
The database uses PostgreSQL with the following main entities defined in `src/lib/server/db/schema.ts`:
- `user` - User accounts with authentication
- `recipe` - Recipe records with ingredients, instructions, and metadata
- `recipeDraft` - Draft recipes before publication
- `ingredient` - Normalized ingredient master list
- `recipeIngredient` - Junction table linking recipes to ingredients with quantities
- `recipeInstruction` - Step-by-step cooking instructions with optional media
- `recipeLike`, `recipeBookmark` - User interactions with recipes
- `collection` - User-created recipe collections
- `recipeComment` - Recipe comments with optional images
- `tag`, `recipeTag` - Recipe categorization system

### Component Architecture
Components are organized in `src/lib/components/` with:
- Each component in its own folder with `.svelte` file and `.stories.svelte` file
- Shared utilities in `src/lib/utils/`
- Server-side logic in `src/lib/server/`
- Pages as full-page components in `src/lib/pages/`

### Key Features
- Recipe creation with ingredient parsing and instruction steps
- Recipe scraping from external URLs using OpenAPI
- Media upload with Cloudinary integration
- Real-time search with ingredient and tag filtering
- User authentication with email verification
- Recipe collections and social features (likes, comments, bookmarks)
- Nutrition facts calculation
- Unit conversion system
- Cooking mode with step-by-step guidance

### External Services
- **Recipe Scraping**: Python FastAPI service in `/api/scrape/` for parsing recipe URLs
- **Media Storage**: Cloudinary for image/video hosting
- **Background Jobs**: BullMQ with Redis for async processing
- **Email**: Resend for transactional emails
- **Food Data**: Spoonacular API and OpenFoodFacts for nutrition/ingredient data

### Development Notes
- Always use Svelte 5 syntax for `.svelte` files
- Follow existing component patterns and naming conventions
- Database migrations are managed with Drizzle Kit
- Tests use Vitest with separate test database
- Components should have corresponding Storybook stories
- Media files are validated on both client and server
- Use existing utility functions for common operations like unit conversion

### Important Files
- `src/lib/server/db/schema.ts` - Database schema definitions
- `src/hooks.server.ts` - Authentication middleware
- `src/lib/server/auth.ts` - Session management
- `drizzle.config.ts` - Database configuration
- `src/lib/utils/` - Shared utility functions