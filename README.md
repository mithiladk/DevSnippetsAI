# DevSnippets AI

An offline-first code snippet manager with AI explanations.

## Tech Stack
- Expo 55 + React Native + TypeScript
- SQLite (offline-first storage)
- Expo SecureStore (API key storage)
- Multi-provider AI (Anthropic Claude, OpenAI, Gemini)

## Features
- Create, edit, delete code snippets
-  Search snippets by title, language, tags, code
-  Favorite snippets
-  AI code explanation (Claude/GPT/Gemini)
-  Export snippets (JSON/JS/TXT)
-  Dark theme, orange accent

## How to Run
```bash
npm install
npx expo start --clear
```
Scan QR with Expo Go app on mobile.

<img width="765" height="1600" alt="WhatsApp Image 2026-05-30 at 11 29 31 PM" src="https://github.com/user-attachments/assets/18fea819-06a7-40cf-873f-63a05d6d8bac" />


## Project Structure
- `src/database/` — SQLite setup and queries
- `src/hooks/` — React hooks
- `src/components/` — Reusable UI components  
- `src/app/` — Expo Router screens
- `src/services/` — AI API integration
- `src/utils/` — Export utilities
- `src/constants/` — Theme and language config
