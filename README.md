<div align="center">
  <h1>🔍 SupplyLens</h1>
  <p><strong>Production-ready, end-to-end supply chain visibility — inventory, suppliers, orders, alerts & demand forecasting in one dashboard.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express_5-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-ISC-blue.svg" alt="License: ISC" />
    <img src="https://img.shields.io/badge/auth-JWT_%2B_Google_OAuth-success.svg" alt="Auth" />
    <img src="https://img.shields.io/badge/RBAC-admin_%2F_manager_%2F_staff-informational.svg" alt="RBAC" />
  </p>
</div>

---

## 📖 What is SupplyLens?

**SupplyLens** is a full-stack, multi-tenant supply-chain operations platform. It gives ops teams a single pane of glass for:

- **Inventory** — products, SKUs, stock levels, sales & adjustments with atomic, oversell-safe updates
- **Suppliers** — vendor records with reliability scoring and on-time delivery tracking
- **Purchase orders** — full lifecycle (`pending → shipped → delivered / cancelled`) with automatic stock reconciliation
- **Alerts** — low-stock, reorder and supplier-delay notifications with priority sorting
- **Demand forecasting** — moving-average + exponential-smoothing weekly demand prediction per product
- **Dashboard** — inventory value, reorder queues, delay counts and success rate at a glance

Built on a hardened MERN stack with strict organization scoping, role-based access control, and a fast code-split React frontend.

---

## ✨ Features

| Area | What you get |
| :--- | :--- |
| 📊 **Dashboard** | Total products, inventory value, success rate, reorder queues, delay counts; sample reliability trend chart |
| 📦 **Inventory** | Search + status filters, stock bars, sale/adjust modals, safe delete confirmation, memoized filtering |
| 🤝 **Suppliers** | Score rings, add-supplier modal, `reliabilityScore` from delivered vs. expected dates (`deliveredAt`) |
| 🧾 **Orders** | Order table + detail drawer, delivered-confirmation modal, duplicate-product guard, server-computed totals |
| 📈 **Forecast** | Per-product selector, confidence %, low-data warnings, illustrative projection chart |
| 🔔 **Alerts** | Unread-first tabs (All/High/Medium/Low), dismiss-to-mark-read, correct priority ordering |
| 🔐 **Auth** | Dual JWT (Bearer header + HttpOnly cookie) + Google OAuth 2.0; `admin / manager / staff` RBAC |
| 🛡️ **Security** | Helmet, auth rate-limiting, NoSQL-injection sanitization, whitelisted updates, no stack leaks |
| ⚡ **Performance** | Lazy routes + `Suspense`, vendor chunk splitting (`react / charts / motion / state`), 15s API timeouts, single alert poller |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Redux Toolkit, React Router 7, Tailwind CSS 4, Recharts, Framer Motion, Sonner, Lucide |
| **Backend** | Node.js 22, Express 5, Mongoose 9, JWT, Google Auth Library, bcrypt |
| **Hardening** | Helmet, express-rate-limit, express-mongo-sanitize |
| **Database** | MongoDB (Atlas or local) with per-org compound indexes |
| **Tooling** | pnpm, ESLint, Vite preview |

> Note: legacy animation libs (GSAP / react-spring / react-countup) were removed — Framer Motion is the single animation system.

---

## 🔑 Roles & Permissions

| Capability | staff | manager | admin |
| :--- | :---: | :---: | :---: |
| View dashboard / inventory / orders / alerts | ✅ | ✅ | ✅ |
| Record sales, stock in/out | ✅ | ✅ | ✅ |
| Create purchase orders | ❌ | ✅ | ✅ |
| Mark orders delivered (reconciles stock) | ❌ | ✅ | ✅ |
| Adjust stock corrections | ❌ | ✅ | ✅ |
| Manage suppliers & forecasts | ❌ | ✅ | ✅ |
| Manage team roles / settings | ❌ | ❌ | ✅ |

Pick a role at signup — `staff` or `manager` is granted directly. The first member of a brand-new workspace automatically becomes its `admin` (founder rule, so an org is never admin-less). Requesting `admin` in an existing workspace joins you as `staff` with a notice; admins promote via **Settings → Team Management**.

---

## 🔌 API Reference

Base URL: `/api` (proxied to `http://localhost:5000` in dev). All routes require auth unless noted.

| Method & Path | Description |
| :--- | :--- |
| `POST /api/auth/register` | Register with role request + founder-admin rule (public) |
| `POST /api/auth/login` | Email + password login (public) |
| `POST /api/auth/google` | Google OAuth login (public) |
| `POST /api/auth/logout` | Clear auth cookie |
| `GET /api/auth/me` | Current user |
| `GET /api/users` | List org users (admin) |
| `PUT /api/users/:id/role` | Update role (admin, last-admin guarded) |
| `GET /api/products` | Paginated products (`page, limit≤100, sortBy`) |
| `POST /api/products` | Create product |
| `GET /api/products/:id` | Single product |
| `PUT /api/products/:id` | Update (whitelisted fields) |
| `DELETE /api/products/:id` | Delete product |
| `POST /api/products/:id/movements` | Manual stock movement (`in/out/adjustment`) |
| `GET /api/products/:id/movements` | Movement history |
| `GET /api/products/:id/reorder-point` | Read-only reorder calculation |
| `GET /api/suppliers` | Paginated suppliers |
| `POST /api/suppliers` | Create supplier |
| `GET /api/suppliers/:id` | Single supplier |
| `PUT /api/suppliers/:id` | Update (whitelisted) |
| `DELETE /api/suppliers/:id` | Delete supplier |
| `GET /api/suppliers/:id/score-breakdown` | On-time delivery breakdown |
| `GET /api/orders` | Paginated purchase orders |
| `POST /api/orders` | Create order (manager/admin) |
| `GET /api/orders/:id` | Single order |
| `PUT /api/orders/:id/status` | Transition status (delivery = manager/admin) |
| `POST /api/stock/in` | Atomic stock receipt |
| `POST /api/stock/out` | Atomic stock issue (oversell-safe) |
| `POST /api/stock/sell` | Record sale + low-stock alerts |
| `POST /api/stock/adjust` | Correction (`ADD`/`REMOVE`, manager/admin) |
| `GET /api/stock/history/:productId` | Paginated movement history |
| `GET /api/dashboard/stats` | Aggregated stats + priority alerts |
| `GET /api/alerts?read=false` | Notifications (priority-sorted) |
| `PUT /api/alerts/:id/read` · `PATCH /api/alerts/:id` | Mark read |
| `POST /api/alerts/scan` | Overdue-order scan (manager/admin, cron target) |
| `GET /api/forecast/:productId` | MA + exponential-smoothing forecast |
| `GET /api/health` | Liveness probe (public) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18+** (v22 recommended)
- [MongoDB](https://www.mongodb.com/) — local instance or Atlas cluster
- [pnpm](https://pnpm.io/) (or `npm`)

### 1. Clone

```bash
git clone https://github.com/nirajxdev/SupplyLens.git
cd SupplyLens
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # then edit values
pnpm install
pnpm run dev           # or: pnpm start
```

Backend runs at `http://localhost:5000`. Health check: `GET /api/health`.

**`backend/.env`:**

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/supplylens
JWT_SECRET=change-me-to-a-long-random-string
NODE_ENV=development
GOOGLE_CLIENT_ID=                      # optional — Google login disabled if empty
```

> The server fails fast on boot if `MONGO_URI` or `JWT_SECRET` is missing, and cookies are `lax`/non-secure in dev, `none`/secure in production.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

App runs at **http://localhost:5173** (API proxied to `:5000`).

**`frontend/.env` (optional):**

```env
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=     # optional — app runs without OAuth provider if empty
```

### 4. Seed demo data

```bash
cd backend
node seed.js
```

Demo login: **`admin@demo.com` / `password123`** (org: `Demo Corp`).

### 5. Production build

```bash
cd frontend
pnpm run build
pnpm run preview
```

`dist/` is code-split (`vendor-react`, `vendor-charts`, `vendor-motion`, per-page chunks). Serve `dist/` statically and point `VITE_API_URL` at your API origin.

---

## 🚢 Deployment Notes

- Set `NODE_ENV=production`, a long `JWT_SECRET`, real `MONGO_URI`, and comma-separated `FRONTEND_URL` (e.g. `https://app.example.com`).
- Requires HTTPS in production for `Secure` cookies (`sameSite=none`).
- Put a cron on `POST /api/alerts/scan` (manager/admin token) instead of scanning on every `GET`.
- MongoDB needs the compound indexes declared in `models/` (created automatically on first write).

---

## 📂 Project Structure

```text
SupplyLens/
├── backend/
│   ├── config/db.js            # Validated connect + fail-fast
│   ├── controllers/            # auth, users, products, suppliers, orders, stock, alerts, forecast, dashboard
│   ├── middleware/authMiddleware.js  # Bearer-or-cookie protect + authorize()
│   ├── models/                 # User, Product, Supplier, PurchaseOrder (+deliveredAt), StockMovement, Notification
│   ├── routes/                 # REST endpoints incl. /health, /alerts/scan, /orders/:id
│   ├── seed.js                 # Demo Corp seed (clean disconnect)
│   ├── server.js               # helmet, rate-limit, sanitize, CORS whitelist, error handler
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/         # app/* (Sidebar/Navbar/StatCard/StatusPill/ChartTooltip), auth/*, landing/*
│   │   ├── pages/              # Dashboard, Inventory, AddProduct, Suppliers, Orders, CreateOrder, Forecast, Alerts, Settings
│   │   ├── redux/              # auth, products, suppliers, dashboard slices
│   │   ├── routes/routes.jsx   # Lazy routes + Suspense + 404
│   │   ├── Instance/API.js     # fetch wrapper (dual auth, 15s timeout, status errors)
│   │   └── main.jsx            # Optional Google provider, AuthBootstrap gate
│   ├── vite.config.js          # Port 5173, proxy, manualChunks
│   └── index.html
└── README.md
```

---

## 🧪 Scripts

| Location | Command | Purpose |
| :--- | :--- | :--- |
| `backend/` | `pnpm run dev` | Watch-mode API server |
| `backend/` | `pnpm start` | Production API server |
| `backend/` | `node seed.js` | Seed demo org |
| `frontend/` | `pnpm run dev` | Vite dev server |
| `frontend/` | `pnpm run build` | Production build (verified ✅) |
| `frontend/` | `pnpm run preview` | Preview production build |
| `frontend/` | `pnpm run lint` | ESLint |

---

## 📌 Status

Production-ready: build passes, authz closed, stock ops atomic, GETs side-effect free, paginated + indexed queries, code-split bundle, 404 + loading/error/empty states throughout.

<p align="center">
  Made with ❤️ by the SupplyLens Team · ISC License
</p>
