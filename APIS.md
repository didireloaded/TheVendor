# API Keys & Environment Variables

This document outlines all the API keys and environment variables used across the project. 

## Currently in `.env`
These variables are currently defined in the `.env` file at the root of the project:

*   **`VITE_MAPBOX_TOKEN`**: `your_mapbox_token_here` *(Placeholder: Replace with a real Mapbox token for the map to render)*
*   **`VITE_SUPABASE_URL`**: `https://dtvopanvvjsrhsjvrvpw.supabase.co` *(The Supabase project URL)*
*   **`VITE_SUPABASE_ANON_KEY`**: `sb_publishable_ZDt8K2L4H-2Lj4gV-LTTjQ_ng7zMSxi` *(Public publishable key for client-side Supabase access)*
*   **`DATABASE_URL`**: `postgresql://postgres:[YOUR-PASSWORD]@db.dtvopanvvjsrhsjvrvpw.supabase.co:5432/postgres` *(Connection string for the database)*
*   **`SUPABASE_SERVICE_ROLE_KEY`**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` *(Secret key for bypassing row level security - keep this safe)*

## Required by Codebase (Not in `.env`)
These variables are expected by scripts or specific features but are not currently populated in `.env`:

*   **`VITE_GOOGLE_AI_KEY`**: Expected by `js/lib/ai.js` for interacting with Google Generative AI (Gemini) in the frontend.
*   **`GEMINI_API_KEY`**: Expected by `seeding-engine/llm-tagger.js` in the backend seeding engine for text analysis.
*   **`OPENAI_API_KEY`**: Referenced in `supabase/config.toml` for Edge Functions or Supabase OpenAI integrations.
*   **`S3_SECRET_KEY`**: Referenced in the Supabase config file for AWS S3 storage.

> **Note:** To ensure all features (such as maps and AI integrations) work fully locally, add your active `VITE_MAPBOX_TOKEN`, `VITE_GOOGLE_AI_KEY`, and `GEMINI_API_KEY` to the `.env` file before running the dev server.
