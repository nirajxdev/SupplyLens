<div align="center">
  <h1>🔍 SupplyLens</h1>
  <p><strong>End-to-end supply chain visibility — powered by real-time data and intelligent analytics.</strong></p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

---

## 📖 About the Project

**SupplyLens** is a comprehensive, full-stack supply-chain visibility platform designed to help modern businesses track, analyze, and optimize their supply chain operations in real time. Built with a scalable MERN architecture, it provides stakeholders with a bird's-eye view of their inventory, suppliers, and order lifecycles while enforcing strict security via Role-Based Access Control (RBAC).

## ✨ Key Features

- **📊 Centralized Dashboard:** Real-time analytics and data visualization (powered by Recharts).
- **📦 Inventory & Product Management:** Seamless CRUD operations for tracking stock levels.
- **🤝 Supplier Relations:** Manage vendor data and purchase lifecycles effectively.
- **🔐 Secure Authentication:** Stateless JWT authentication stored in HttpOnly cookies, combined with Google OAuth 2.0 Single Sign-On.
- **🛡️ Role-Based Access Control (RBAC):** Granular permissions ensuring users and administrators have scoped access to system features.
- **⚡ Proactive Alerting:** System-generated notifications for critical supply chain events or low stock.
- **✨ Premium UI/UX:** A highly responsive, glassmorphic interface utilizing Framer Motion and GSAP for micro-interactions.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Redux Toolkit, React Router DOM, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication**| JWT, Google Auth Library, bcrypt |
| **Animations** | GSAP, Framer Motion, React Spring |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- `npm` or `pnpm`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/SupplyLens.git
cd SupplyLens
```

### 2. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory and add the following configuration:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

**Start the server:**
```bash
npm run dev
```
The backend server should now be running on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

**Start the development server:**
```bash
npm run dev
```
The application will be accessible at **http://localhost:5173**.

### 4. Build for Production

To build the frontend for production deployment:
```bash
cd frontend
npm run build
```
*(Note: If deploying separately, ensure `VITE_API_URL` is set to the backend base URL before building).*

---

## 📂 Project Structure

```text
SupplyLens/
├── backend/          # Express backend application & API
│   ├── config/       # Database & environment configurations
│   ├── controllers/  # Route logic & request handling
│   ├── models/       # Mongoose database schemas
│   ├── routes/       # API endpoints definitions
│   └── server.js     # Backend entry point
├── frontend/         # React (Vite) frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application views/pages
│   │   ├── redux/      # State management slices & store
│   │   └── ...
│   └── index.html
└── README.md
```

---



<p align="center">
  Made with ❤️ by the SupplyLens Team
</p>
