# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a responsive web application for the book "凭什么" (Why Should I?) - a guide on effective communication and self-defense in verbal conflicts. The app provides an interactive, mobile-friendly reading experience with AI-powered features.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Styling**: Inline CSS with CSS variables (mobile-first design)
- **Icons**: Lucide React
- **Markdown**: React Markdown

## Key Features

1. **Responsive Reading Experience**
   - Mobile-first design with tablet and desktop breakpoints
   - Chapter navigation with progress tracking
   - Rich markdown content rendering
   - High-quality images from Pexels

2. **User Authentication**
   - Email/password login and registration
   - Session management with Supabase Auth
   - Protected routes for personalized features

3. **Progress Tracking**
   - Mark chapters as completed
   - Track reading progress
   - View statistics and achievements

4. **Interactive Practice Tool**
   - Real-world scenario simulations
   - Multiple-choice practice exercises
   - Contextual hints and feedback

5. **AI Assistant**
   - Context-aware Q&A
   - Personalized advice based on user situations
   - Conversation history (for logged-in users)

6. **Quick Guide**
   - Visual reference cards
   - Core principles and techniques
   - Scenario-based examples

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout wrapper
│   ├── Header.jsx          # App header with auth
│   └── Navigation.jsx      # Bottom navigation bar
├── pages/
│   ├── Home.jsx            # Landing page with chapter list
│   ├── ChapterReader.jsx   # Reading interface
│   ├── QuickGuide.jsx      # Visual quick reference
│   ├── Practice.jsx        # Interactive practice scenarios
│   ├── AIAssistant.jsx     # AI chat interface
│   └── Progress.jsx        # User progress dashboard
├── lib/
│   └── supabase.js         # Supabase client setup
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
└── index.css               # Global styles with CSS variables

scripts/
└── seed-data.js            # Database seeding script
```

## Database Schema

### Tables

1. **chapters** - Book content
   - slug, title, subtitle, content (markdown)
   - chapter_order, chapter_type, reading_time
   - image_url
   - RLS: Public read, restricted write

2. **user_progress** - Reading progress
   - user_id, chapter_id, completed, last_position
   - RLS: Users can only access their own data

3. **bookmarks** - Saved content
   - user_id, chapter_id, content_excerpt, note
   - RLS: Users can only access their own data

4. **ai_conversations** - Chat history
   - user_id, question, answer, context
   - RLS: Users can only access their own data

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (auto-starts on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Seed database with book content
node scripts/seed-data.js
```

## Design System

### Color Palette
- Primary: Blue (#2563eb)
- Success: Green (#10b981)
- Warning: Yellow/Orange (#f59e0b)
- Error: Red (#ef4444)
- Neutral tones for text and backgrounds

### Typography
- Sans-serif: System font stack for UI
- Serif: Noto Serif SC for headings and content
- Base size: 16px (desktop), scales for mobile

### Spacing
- Base unit: 8px
- Consistent spacing scale using CSS variables

### Responsive Breakpoints
- Mobile: < 768px (default)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Key Implementation Details

### Authentication Flow
- Modal-based login/signup
- Session persistence with Supabase
- onAuthStateChange listener in App.jsx

### Data Loading
- Chapters loaded from Supabase on Home page
- Progress data fetched per user
- Optimistic UI updates for better UX

### Mobile Optimization
- Touch-friendly tap targets (min 44px)
- Sticky header and bottom navigation
- Responsive images with proper sizing
- Optimized font sizes for readability

### AI Assistant
- Currently uses mock responses
- Ready for integration with real AI API
- Conversation context management
- User-specific chat history

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Image Sources

All images are from Pexels (free stock photos):
- Hero images for chapters
- Scenario illustrations
- Background images
