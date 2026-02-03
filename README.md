# PR Agent Frontend

React + Vite frontend for the PR Agent workflow. It provides task management
for collaborations, shipping, and script review, plus a campaign planning view.

## Features
- My Tasks: confirm collaboration, confirm shipping with tracking number, approve script
- Tabbed task views: need_confirm, need_ship, need_script_review
- Campaign plan: list campaigns and expand to show collaborations
- Sidebar badge shows total pending tasks

## Tech Stack
- React 18
- Vite 5
- Ant Design 5
- React Router 6

## Dependency Setup
1. Install pnpm globally:
   - `npm install -g pnpm`
2. First time setup:
   - `pnpm install`
3. Never use `npm install` in this project.

Using pnpm prevents Rollup platform lock issues when switching between macOS and Windows.

## Getting Started
1. Install dependencies
   - `pnpm install`
2. Start the dev server
   - `pnpm run dev`
3. Build for production
   - `pnpm run build`
4. Preview the production build
   - `pnpm run preview`

## API Endpoints Used
- `GET /v1/dashboard/summary`
- `GET /v1/tasks?type=need_confirm`
- `GET /v1/tasks?type=need_ship`
- `GET /v1/tasks?type=need_script_review`
- `POST /v1/tasks/{collaboration_id}/actions/approve-collaboration`
- `POST /v1/tasks/{collaboration_id}/actions/confirm-ship`
- `POST /v1/tasks/{collaboration_id}/actions/approve-script`
- `GET /v1/campaigns`
- `GET /v1/collaborations`

## Notes
- The API base path is assumed to be the same origin as the frontend.
- Task data is loaded on demand when switching tabs.
