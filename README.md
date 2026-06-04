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
- Vite 7
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
2. Configure environment variables when you want the frontend to call a separately deployed backend
   - copy `.env.example` to `.env.local`
   - set `VITE_API_BASE_URL` to your deployed backend origin, for example `https://your-api.run.app`
3. Start the dev server
   - `pnpm run dev`
4. Build for production
   - `pnpm run build`
5. Preview the production build
   - `pnpm run preview`
6. Run tests
   - `pnpm run test`

## API Endpoints Used
- `GET /v1/dashboard/my-tasks`
- `GET /v1/tasks?type=need_confirm`
- `GET /v1/tasks?type=need_ship`
- `GET /v1/tasks?type=need_script_review`
- `POST /v1/tasks/{collaboration_id}/actions/approve-collaboration`
- `POST /v1/tasks/{collaboration_id}/actions/confirm-ship`
- `POST /v1/tasks/{collaboration_id}/actions/approve-script`
- `GET /v1/campaigns`
- `GET /v1/collaborations`

## Notes
- If `VITE_API_BASE_URL` is unset, the frontend uses same-origin `/v1/...` requests.
- If `VITE_API_BASE_URL` is set, the frontend sends API requests to that backend origin.
- Task data is loaded on demand when switching tabs.

## Deploy To Vercel
1. Import the repository into Vercel.
2. Set the build command to `pnpm run build`.
3. Set the output directory to `dist`.
4. Add the `VITE_API_BASE_URL` environment variable for Production and Preview.
5. Deploy.
