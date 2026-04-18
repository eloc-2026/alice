# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Todo List application built with Vite, using vanilla JavaScript and ES modules.

## Development Commands

```bash
# Start development server (accessible on 0.0.0.0 for remote access)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

- **Entry point**: `index.html` loads `main.js` as an ES module
- **Styling**: `style.css` provides basic page styling
- **Build tool**: Vite handles dev server, hot module replacement, and production builds
- **Server config**: Vite dev server is configured to listen on `0.0.0.0` with `allowedHosts: true` in `vite.config.js`
- **Output**: Production builds are written to `dist/` directory
