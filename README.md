# frontend

Frontend UI for the PR Agent platform.

This repository contains the React + Vite web application used to manage campaigns, collaborations, task queues, and selected workflow actions such as collaboration approval, shipping confirmation, and script review.

---

## What this repo does

This repo is the **product frontend**.

Its responsibilities are to:

- present task-oriented UI for operators
- display dashboard task counts
- show campaign and collaboration views
- call backend APIs for task actions and data loading

This repo does **not**:

- own the business database
- process inbound messages
- run the reply-generation workflow
- send WeChat messages directly

---

## Role in the overall system

Typical UI-facing chain:

1. user opens the frontend in the browser
2. frontend calls `pragent-api-backend` through `/v1/...`
3. backend returns dashboard, task, campaign, and collaboration data
4. frontend renders the operator workflow

In short:

- **upstream:** browser / human operator
- **main backend dependency:** `pragent-api-backend`

For most local development work, this repo is paired directly with `pragent-api-backend`.

---

## Main features

- My Tasks summary
- task tabs for:
  - `need_confirm`
  - `need_ship`
  - `need_script_review`
- collaboration actions:
  - approve collaboration
  - confirm shipping with tracking number
  - approve script
- campaign plan view
- pending task badge in the sidebar

---

## Main API dependencies

This frontend currently uses APIs such as:

- `GET /v1/dashboard/my-tasks`
- `GET /v1/tasks?type=need_confirm`
- `GET /v1/tasks?type=need_ship`
- `GET /v1/tasks?type=need_script_review`
- `POST /v1/tasks/{collaboration_id}/actions/approve-collaboration`
- `POST /v1/tasks/{collaboration_id}/actions/confirm-ship`
- `POST /v1/tasks/{collaboration_id}/actions/approve-script`
- `GET /v1/campaigns`
- `POST /v1/campaigns`
- `POST /v1/campaigns/{campaign_id}/publish`
- `GET /v1/collaborations`

This means the main integration target for this repo is:

- `pragent-api-backend`

---

## Tech stack

- React 18
- Vite 7
- Ant Design 5
- React Router 6

---

## Dependency setup

1. Install `pnpm` globally if needed:
   - `npm install -g pnpm`
2. Install project dependencies:
   - `pnpm install`
3. Do **not** use `npm install` in this project.

Using `pnpm` helps avoid platform-specific Rollup lock issues when switching between macOS and Windows.

---

## Environment variables

### Optional

```env
VITE_API_BASE_URL=https://your-backend-service.example.com
```

### Recommended local development example

```env
VITE_API_BASE_URL=http://localhost:8000
```

Behavior:

- if `VITE_API_BASE_URL` is unset, the frontend uses same-origin `/v1/...` requests
- if `VITE_API_BASE_URL` is set, the frontend sends API requests to that backend origin

You can start from `.env.example` and create `.env.local`.

---

## Local run

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm run dev
```

Build for production:

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```

Run tests:

```bash
pnpm run test
```

---

## Local verification

### Recommended local pairing

Run `pragent-api-backend` locally on:

```text
http://localhost:8000
```

Then set:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend and verify that:

- dashboard task counts load
- task tabs load data successfully
- campaign list loads successfully
- task actions return successful responses

---

## Local integration

### Primary local integration path

This repo is primarily intended to be run together with:

- `pragent-api-backend`

That is the clearest and most stable local integration path in the current workspace.

### Important boundary

This frontend is not the direct UI for the lower-level message orchestration services such as:

- `conversation-engine`
- `ai_mvp_agentic_workflow`
- `channel-sender`
- `channel-gateway`

Those services belong to the automation side of the system and should be documented separately in the system overview.

---

## Current status and limitations

### What is already in place

- task-oriented UI exists
- campaign plan view exists
- task actions are wired to backend APIs
- backend base URL can be configured through env
- frontend can run independently from a separately deployed backend

### Current limitations

- this repo depends on backend API availability for meaningful testing
- it does not by itself validate the lower-level message automation chain
- full system behavior still depends on backend data quality and server-side integrations

---

## Deploy to Vercel

1. Import the repository into Vercel.
2. Set the build command to `pnpm run build`.
3. Set the output directory to `dist`.
4. Add the `VITE_API_BASE_URL` environment variable for Production and Preview.
5. Deploy.

---

## Recommended companion repos

For handoff and integration understanding, read these next:

- `pragent-api-backend` — the main backend used by this frontend
- system-level overview doc — for repository map, current development status, and local integration guidance across the workspace
