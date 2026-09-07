# Kartly — E-Commerce Prototype

<p align="center">
  A full-stack e-commerce prototype built for evaluation and research, featuring product discovery, authentication, cart and checkout flows, user account management, admin tooling, sales reporting, and an AI shopping-assistant interface.
</p>

<p align="center">
  <strong>React + Vite</strong> · <strong>Node.js + Express</strong> · <strong>SQLite</strong> · <strong>JWT</strong>
</p>

---

## Overview

Kartly is a marketplace-style e-commerce prototype designed to demonstrate a complete shopping workflow in a controlled evaluation environment. It includes a customer-facing storefront, authentication, shopping cart, order handling, user account settings, an administrator dashboard, product and customer management, and sales reporting.
Kartly Screenshot/Customer pannel.png
The project is intended as a **research/evaluation prototype**, not a production commerce platform. No real payment processing is performed.

### Research / Evaluation Notebook

The accompanying Google Colab notebook can be used for the project's research and evaluation workflow:

**[Open PIS Data collection ](https://colab.research.google.com/drive/1BL52_LGpELWkLfpPHCaguQtJ3kEfVOaB?authuser=3#scrollTo=ef5f6abf)**

---

## Screenshots

### Storefront

The main storefront provides category navigation, product search, sorting, ratings, pricing, and quick access to the shopping cart and account area.

![Kartly storefront](./Kartly%20Screenshot/Screenshot%202026-08-26%20132425.png)




### AI Shopping Assistant

The prototype also includes an AI shopping-assistant interface for product-related interaction and recommendation support.

![Kartly AI shopping assistant](./Kartly%20Screenshot/With%20AI%20chatbot.png)


### Customer Storefront

A logged-in customer can browse products while retaining access to account features and the assistant interface.

![Kartly customer storefront](./Kartly%20Screenshot/Customer%20pannel.png)

### Sign In

Users can authenticate through a dedicated sign-in page before accessing account-specific features.

![Kartly login page](./Kartly%20Screenshot/Login%20page.png)

### Shopping Cart

The cart provides a focused shopping state and supports the customer journey from product selection toward checkout.

![Kartly shopping cart](./Kartly%20Screenshot/cart.png)

### Account Settings

Registered users can manage profile information, profile imagery, email details, and password changes.

![Kartly account settings](./Kartly%20Screenshot/useraccount%20setting.png)

### Admin Dashboard

Administrators can monitor key platform metrics such as customer count, product count, order count, and total revenue.

![Kartly admin dashboard](./Kartly%20Screenshot/admin%20pannel.png)

### Sales Reporting

The sales view provides revenue summaries, sold-item counts, payment-method breakdowns, recent orders, and daily trend visualisations.

![Kartly sales dashboard](./Kartly%20Screenshot/Sales.png)

---

## Core Features

### Storefront

- Product grid with category filtering
- Keyword search
- Product sorting by price, rating, and newest
- Product detail pages
- Product ratings and stock information
- Add-to-cart workflow
- Browser-persisted cart using `localStorage`
- Responsive marketplace-style navigation

### Registered Users

- User registration and sign in
- JWT-based authentication
- User account settings
- Profile information management
- Password update flow
- Checkout with shipping address
- Order creation and order history
- Live order status progression

### AI Shopping Assistant

- Customer-facing assistant panel integrated into the storefront UI
- Product and recommendation-oriented interaction surface
- Designed to support the evaluation of AI-assisted shopping experiences

> The repository documentation describes this as a prototype interface. Any model-specific or Colab-based evaluation logic should be documented alongside the accompanying research notebook where applicable.

### Administrator

- Admin-only dashboard access
- Dashboard overview with key platform metrics
- Product creation, editing, and deletion
- Order management
- Order status updates
- Customer listing
- Sales and revenue reporting

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, JSX, Vite |
| Routing | React Router |
| Styling | Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite with `better-sqlite3` / `PostGreSQL` |
| RAG | with `Customer-support`|
| Authentication | JWT + bcrypt |
| Access Control | Role-based access (`user` / `admin`) |
| Local Development | Vite dev server + Express API |
| Research / Evaluation | Google Colab notebook |


---

## Project Structure

```text
ecommerce-prototype/
├── backend/
│   ├── db/
│   │   └── index.js          # Database schema and seed data
│   ├── middleware/
│   │   └── auth.js           # JWT auth and admin guard
│   ├── routes/               # Auth, products, orders, admin routes
│   ├── server.js             # Express application entry point
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js      # Pre-configured API client
    │   ├── context/          # AuthContext, CartContext
    │   ├── components/       # Navbar, ProductCard, Footer, ProtectedRoute
    │   └── pages/            # Home, Login, Register, ProductDetail,
    │                         # Cart, Checkout, Orders, Admin pages
    └── vite.config.js        # Proxies /api requests to localhost:5000
```

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### 1. Start the Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Alternatively:

```bash
npm start
```

The API runs at:

```text
http://localhost:5000
```

On first startup, the backend creates the SQLite database at:

```text
backend/db/shop.db
```

It also seeds the prototype with an administrator account, product categories, and sample products.

### 2. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Vite proxies `/api/*` requests to the Express backend running on port `5000`.

---

## Prototype Accounts

| Role | Username | Password | Access |
|---|---|---|---|
| Admin | `admin` | `suadmin` | Admin dashboard and management features |
| User | Created through registration | User-defined | Customer shopping and account features |

> **Important:** These credentials are suitable only for a local evaluation prototype. Do not reuse them in a production environment.

Public registration of the reserved `admin` username is blocked, and the seeded administrator account is used to access the admin dashboard.

---

## API Overview

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a user |
| `POST` | `/api/auth/login` | Public | Sign in as user or admin |
| `GET` | `/api/auth/me` | Token | Get current user profile |
| `GET` | `/api/products` | Public | List, search, or filter products |
| `GET` | `/api/products/:id` | Public | Get product details |
| `POST` | `/api/products` | Admin | Create a product |
| `PUT` | `/api/products/:id` | Admin | Update a product |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |
| `POST` | `/api/orders` | Token | Place an order |
| `GET` | `/api/orders/mine` | Token | Get current user's order history |
| `GET` | `/api/orders` | Admin | View all orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update an order status |
| `GET` | `/api/admin/users` | Admin | List customers |
| `GET` | `/api/admin/stats` | Admin | Get dashboard summary statistics |

---

## Evaluation Context

Kartly is intentionally presented as a prototype storefront rather than a commercial deployment. This makes it suitable for controlled demonstrations and research activities involving areas such as:

- Product search and navigation
- Shopping task completion
- User experience evaluation
- Interface comparison
- AI-assisted product discovery
- Customer-support interactions
- Administrative workflow demonstrations

For experiment-specific analysis, datasets, questionnaires, or statistical processing, use the linked Google Colab notebook and document the exact evaluation procedure used in the study.

---

## Production Considerations

Before adapting the project for real-world deployment, consider the following improvements:

- Store JWT secrets and administrator credentials in a secure secrets manager
- Replace prototype credentials with secure account provisioning
- Add real payment processing such as Stripe
- Add HTTPS everywhere
- Add rate limiting
- Add CSRF protection where applicable
- Strengthen server-side input validation
- Add production-grade logging and monitoring
- Add server-side pagination for large product and order datasets
- Implement secure image upload/storage instead of relying only on URLs
- Add automated testing and CI/CD
- Review authentication token storage and session security

---

## Prototype Notice

This application is a **demo storefront built for evaluation purposes**. It is not intended to process real payments or operate as a production e-commerce service.

---

## Google Colab

<p align="center">
  <a href="https://colab.research.google.com/drive/1BL52_LGpELWkLfpPHCaguQtJ3kEfVOaB?authuser=3#scrollTo=ef5f6abf">
    <strong>Open Research & Evaluation Notebook in Google Colab</strong>
  </a>
</p>

---

## License

If this repository is part of an academic project, add the required licence or institutional usage statement here before publishing it publicly.
