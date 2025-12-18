# Dad's Recipes

A personalized recipe web app built with Next.js, Supabase, and OpenAI. Record, manage, and cook recipes with voice input and photo parsing capabilities.

## Features

- 📱 Mobile-first design optimized for phone use
- 🎤 Voice recipe dictation with automatic transcription and parsing
- 📸 Photo-to-recipe parsing from written recipe photos
- 👨‍🍳 Step-by-step "Let's Cook" mode for guided cooking
- 📤 Easy recipe sharing (public recipes for family use)
- 🏷️ Recipe metadata: cuisine type, main ingredient, time, servings, health score

## Getting Started

### Prerequisites

- Node.js 18+ and yarn/npm
- Supabase account and project
- OpenAI API key

### Setup

1. Clone the repository and install dependencies:

```bash
yarn install
```

2. Set up environment variables. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

3. Set up Supabase:

   - Run the migration file `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor to create the necessary tables
   - Create a storage bucket named `recipe-images` in Supabase Storage
   - Make the bucket public (for family use)

4. Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/supabase/` - Supabase client configuration
- `types/` - TypeScript type definitions
- `supabase/migrations/` - Database schema migrations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: OpenAI (Whisper for transcription, GPT-4 for parsing)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
