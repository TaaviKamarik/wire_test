# Wire Test: Movie & Person Data Explorer

## Overview

Wire Test is a full-stack web application for visualizing, filtering, and exploring movie and person data. It features interactive force-directed graphs, advanced filtering, and multiple data exploration tools. The project is built with a React frontend and a PHP backend API.

## Features

- **Interactive Graphs:** Visualize movies, people, and their relationships using force-directed and other network graphs.
- **Filtering:** Filter by genres, roles, types, and years using a global sidebar powered by Zustand state management.
- **Multiple Views:** Includes tools for video keyword search, object identification, scene clustering, temporal flow, Sankey diagrams, and more.
- **API Integration:** Fetches data from a PHP backend with endpoints for movies and persons.
- **Modern UI:** Uses Material UI and Ant Design for a responsive, user-friendly interface.

## Project Structure

```
├── src/
│   ├── appcomponents/         # All main React components used in App.js
│   ├── components/            # Shared UI components (e.g., SidebarFilters)
│   ├── filmDashboard/         # Specialized dashboard and visualization components
│   ├── hooks/                 # Custom React hooks (API fetch, filter state)
│   ├── moviekeyword/          # Video keyword search components
│   ├── networkgraph/          # Graph logic and supporting components
│   ├── utils/                 # Utility functions and constants
│   ├── videoexplainer/        # Video explainer tool
│   ├── videoobjects/          # Video object identifier tool
│   ├── App.js                 # Main application entry
│   └── ...
├── public/                    # Static assets and processed data
├── build/api/                 # PHP backend API controllers
├── movie_jsons/               # Raw movie scene data (JSON)
├── package.json               # Project metadata and dependencies
└── README.md                  # Project overview (this file)
```

## Developer Workflow

- **Start Dev Server:** `npm start` (runs React app on localhost:3000)
- **Run Tests:** `npm test` (Jest, interactive watch mode)
- **Build for Production:** `npm run build` (outputs to `build/`)
- **Backend:** PHP API is served from `build/api/`; endpoints are consumed by the frontend.

## Key Files & Folders

- **src/App.js:** Main entry point, routing, and layout
- **src/appcomponents/:** All main UI components used in App.js
- **src/filmDashboard/:** Advanced data visualizations and dashboards
- **src/hooks/useApiFetch.js:** API integration hook
- **src/hooks/useGraphFilterState.js:** Global filter state (Zustand)
- **src/components/SidebarFilters.js:** Sidebar filter UI
- **src/networkgraph/:** Graph logic and supporting components
- **build/api/controllers/:** PHP API controllers for movies/persons

## Data Flow

- Frontend fetches movie/person data from the PHP API (see `useApiFetch.js`).
- Data is visualized using force-directed and other graphs.
- Filtering is managed globally and passed to graph components.

## Conventions

- **API Usage:** Use the `useApiFetch` hook for all API calls.
- **Filtering:** Managed via Zustand and sidebar components.
- **Component Organization:** All main components are in `src/appcomponents/` for clarity.

## Getting Started

1. Install dependencies: `npm install`
2. Start the frontend: `npm start`
3. (Optional) Set up the PHP backend in `build/api/` if developing API endpoints

## License

MIT (or specify your license here)

---

For more details, see code comments and the `.github/copilot-instructions.md` file.
