# Flashbuild

Your Product Roadmap, Autocompleted. Flashbuild bridges the gap between customer feedback and code.

## Features

- **Landing Page**: Hero section with split-screen visual showing the transformation from messy data to clean specs
- **Concepts Hub**: Intelligence center with AI-generated and manual concepts, search, filters, and Kanban view
- **Workspace**: Split-screen manifestation zone with spec editor and live UI preview
- **Integrations**: Connectivity gallery for Feedback, Usage, and Build connectors
- **Theme System**: Light (default) and Dark mode with smooth transitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

## Project Structure

```
├── app/
│   ├── page.tsx          # Landing page
│   ├── concepts/         # Concepts hub page
│   ├── workspace/        # Workspace page
│   ├── integrations/     # Integrations page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Sidebar.tsx       # Persistent navigation sidebar
│   └── ThemeProvider.tsx # Theme context provider
└── package.json
```

## Color Palette

### Light Theme (Default)
- Background: #FFFFFF (Pure White)
- Primary Action: #FF6600 (Bright Orange)
- Secondary Action: #0066FF (Vibrant Blue)
- Borders: #EAEAEA (Light Gray)
- Text: #000000 (Deep Black)

### Dark Theme
- Background: #0D0D0D (Deep Black)
- Primary Action: #FF6600 (Bright Orange)
- Secondary Action: #0052FF (Vibrant Blue)
- Borders: #333333 (Dark Gray)
- Text: #EDEDED (Off-white)

## Pages

### Landing Page (/)
Hero section with primary and secondary CTAs, split-screen visual demonstration.

### Concepts (/concepts)
- Search and filter concepts
- Toggle between List and Kanban views
- AI-Generated and Manual concept badges
- Match scores and Manifest buttons

### Workspace (/workspace)
- Split-screen interface: Spec Editor (left) and Flash Preview (right)
- Vibe-prompt bar for real-time updates
- "Mark Ready for Dev" button

### Integrations (/integrations)
- Connector cards grouped by category (Feedback, Usage, Build)
- Connection status indicators
- Last sync timestamps for active integrations

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```