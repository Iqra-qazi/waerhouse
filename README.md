# WareHub

WareHub is a warehouse operations application with a React/Vite frontend and an Express/MongoDB API. The frontend and backend can be deployed as separate Vercel projects.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB

## Environment

For local development, copy `warehouse-project/frontend/.env.example` to `warehouse-project/frontend/.env` and set:

```env
VITE_API_URL=http://localhost:5000/api
```

Backend: copy `warehouse-project/backend/.env.example` to `warehouse-project/backend/.env` and set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/warehouse
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

## Run

Start MongoDB, then:

```powershell
cd warehouse-project/backend
npm install
npm start
```

In another terminal:

```powershell
cd warehouse-project/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The backend health endpoint is `GET http://localhost:5000/api/health`.

## Roles and access

Roles come from `warehouse-project/frontend/src/config/roles.js`:

- `admin`: users, warehouses, products, stock, transactions, orders, supply requests, reports, and dashboards.
- `manager`: dashboard, assigned warehouse summary, products, stock, transactions, orders, supply requests, and reports.
- `sales`: dashboard, products, order creation, and own orders.
- `supplier`: dashboard, own products, and own supply requests.

Blocked routes render the `/unauthorized` page. Authentication is preserved in browser storage and refreshed from `/api/auth/me`.

## Frontend structure

```text
warehouse-project/frontend/src/
  api/
  components/
    features/
    layout/
    ui/
  config/
  context/
  hooks/
  pages/
  routes/
  services/
  App.jsx
  main.jsx
```

Pages compose feature components. API calls live in `src/services`, state and actions live in `src/hooks`, and role permission decisions use `usePermissions`.

## Build and lint

```powershell
cd warehouse-project/frontend
npm run build
npm run lint
```

`npm run lint` uses the repository's valid, minimal Oxlint configuration.

## Deploy as two Vercel projects

Create two Vercel projects from this repository. Use these settings:

| Setting | Backend project | Frontend project |
|---|---|---|
| Root Directory | `warehouse-project/backend` | `warehouse-project/frontend` |
| Framework Preset | Other | Vite |
| Build Command | Leave blank (Vercel installs dependencies) | `npm run build` |
| Output Directory | Leave blank (Node function) | `dist` |

### Backend environment variables

Set these in the backend Vercel project:

- `MONGO_URI` — reachable MongoDB connection string.
- `JWT_SECRET` — strong, private signing secret.
- `JWT_EXPIRES_IN` — optional; defaults to `7d`.
- `CLIENT_URL` — frontend origin(s), comma-separated if needed; trailing slashes are normalized.
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` — required only for image uploads.

`PORT` is only used for local startup; Vercel supplies the serverless runtime. Never put backend secrets in the frontend project.

### Frontend environment variable

Set `VITE_API_URL` in the frontend Vercel project to the deployed backend URL with its API prefix, for example:

```text
https://your-backend-project.vercel.app/api
```

### Deployment order

1. Provision MongoDB and allow connections from the deployed backend.
2. Create the backend Vercel project with root directory `warehouse-project/backend`. Set its environment variables, including `CLIENT_URL` to the intended frontend origin, then deploy.
3. Check `https://<backend-domain>/api/health` returns `{"ok":true}`.
4. Create the frontend Vercel project with root directory `warehouse-project/frontend`. Set `VITE_API_URL` to `https://<backend-domain>/api`, then deploy.
5. If the frontend uses a custom domain or a different preview origin, add that exact origin to the backend `CLIENT_URL` list and redeploy the backend.

The backend permits `http://localhost:5173` for local development and normalizes trailing slashes when comparing origins. Preview deployment domains must still be listed explicitly in `CLIENT_URL`.

Image uploads use Multer memory storage and ImageKit; no uploaded file is written to the function's local filesystem. The route allows files up to 5 MB, so very large uploads may still meet Vercel's request-size limit. MongoDB must accept connections from the deployed function, and ImageKit credentials must be configured for uploads to work.

## Backend contract

`warehouse-project/backend/BACKEND_API_GUIDE.md` is the source of truth. Frontend requests use only documented URLs, field names, request bodies, and role values.

## Backend vs. task-spec differences

- Manager data is not server-scoped for warehouses, stock, stock history, orders, supply requests, dashboard statistics, or low-stock/transaction reports. The affected pages show clear warnings and do not perform unsafe client-side filtering.
- Order statuses are `pending`, `confirmed`, `shipped`, `delivered`, and `cancelled`, rather than the initial task names `Pending`, `Processing`, `Completed`, and `Cancelled`.
- Only sales can create orders; the guide does not allow admin order creation. Order creation validates inventory with the order endpoint.
- Sales cannot call the admin-or-manager stock endpoints, so the order form cannot precalculate available stock and relies on documented backend insufficient-stock errors.
- The warehouse model and guide have no capacity field.
- There is no profile update, profile-image update, or password-change endpoint. Profile editing and password controls are omitted; `/api/auth/me` is read-only.
- Supply requests support `pending`, `approved`, and `rejected` statuses, and supplier creation/admin-manager review are implemented.
- Missing search/status/date endpoint filter parameters are not invented; reports and some list pages filter already-fetched documented rows client-side.
