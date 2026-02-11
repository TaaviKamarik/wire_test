# Copilot Instructions for wire_test

## Project Overview

- This is a full-stack web application for visualizing and exploring movie and person data, built with React (frontend, in `src/`) and a PHP API (backend, in `build/api/`).
- The frontend uses React, Zustand for state management, and MUI/Ant Design for UI components. The backend exposes endpoints for movies and persons, with controllers in `build/api/controllers/`.

## Key Architectural Patterns

- **Data Flow:**
  - Frontend fetches movie/person data from the PHP API (see `useApiFetch.js`).
  - Data is visualized using force-directed graphs (`NetworkGraphView.js`, `NetworkGraphForced.js`).
  - Filtering is managed via Zustand (`useGraphFilterState.js`) and sidebar components.
- **API Integration:**
  - API endpoints are hardcoded to `https://dti.tlu.ee/errlinked/wire/api/` in `useApiFetch.js`.
  - Backend controllers (`MoviesController.php`, `PersonsController.php`) query a database and return JSON via a `Response` utility.
- **Component Structure:**
  - Major UI: `NetworkGraphView.js`, `MovieInfoSheet.js`, `PersonInfoSheet.js`, `SidebarFilters.js`.
  - Data constants: `src/const/` (genres, roles, etc).
  - Hooks: `src/hooks/` (API fetch, filter state).
  - Movie/person graph logic: `src/networkgraph/`.

## Developer Workflows

- **Start Dev Server:** `npm start` (runs React app on localhost:3000)
- **Run Tests:** `npm test` (Jest, interactive watch mode)
- **Build for Production:** `npm run build` (outputs to `build/`)
- **Backend:** PHP API is served from `build/api/`; endpoints are consumed by the frontend.

## Project-Specific Conventions

- **Data Files:**
  - Static movie/person data for the graph is in `src/processedData.js` and `public/processed_data_4.json`.
  - API expects certain data shapes (see backend controllers for details).
- **Filtering:**
  - Filters (genres, roles, types, years) are managed globally via Zustand and passed to graph components.
- **UI Patterns:**
  - Sidebar filters are implemented in `SidebarFilters.js` and used throughout the app.
  - Material UI and Ant Design are both used for UI components.
- **API Usage:**
  - Use the `useApiFetch` hook for all API calls; do not call `fetch` directly in components.

## Examples

- To add a new filter, update `useGraphFilterState.js` and the relevant sidebar component.
- To add a new API endpoint, create a controller in `build/api/controllers/` and expose it via `index.php`.

## References

- Main entry: `src/App.js`
- Graph logic: `src/NetworkGraphView.js`, `src/networkgraph/`
- API integration: `src/hooks/useApiFetch.js`, `build/api/controllers/`
- Filtering: `src/hooks/useGraphFilterState.js`, `src/components/SidebarFilters.js`
