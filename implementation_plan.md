# Ruchi Ragam — Full-Stack SaaS E-Commerce Platform

## Overview

**Ruchi Ragam** is a homemade Indian food marketplace (think Palleturi Pachallu) where home chefs list their dishes and customers browse, order, and pay. The `ruchiragam/` workspace is currently **empty**, so we build the complete platform from scratch — frontend + backend — and deploy it production-ready.

---

## User Review Required

> [!IMPORTANT]
> The `ruchiragam/` directory is **empty**. The frontend described in the prompt doesn't exist yet. We will build **both** frontend and backend as a monorepo.

> [!WARNING]
> The following credentials/keys will be needed before the platform goes live. Placeholders will be placed in `.env.example`:
> - **Supabase** project URL + anon/service_role keys
> - **Stripe** publishable + secret key + webhook secret
> - **Razorpay** key ID + key secret
> - **OpenAI** API key (GPT-4o — GPT-5.2 is not publicly available; we use the latest available model)
> - **Google OAuth** client ID + secret
> - **JWT** access & refresh secrets

> [!NOTE]
> GPT-5.2 is not a real model at this time. The AI layer will use `gpt-4o` (the most capable available model) and be written to swap models by config.

---

## Architecture Overview

```
ruchiragam/
├── frontend/          # React 18 + TypeScript + Vite + Tailwind + shadcn/ui
├── backend/           # Node.js + Express (clean architecture)
├── docker-compose.yml # Local dev orchestration
├── .github/workflows/ # CI/CD pipelines
└── README.md
```

### System Architecture Diagram

```
Browser (React SPA)
       │  HTTPS
       ▼
Cloudflare CDN / WAF
       │
  ┌────┴─────────────────────────────────┐
  │  Vercel (Frontend)  Render (Backend)  │
  └────┬──────────────────────┬──────────┘
       │                      │
  React App            Express API (REST)
  React Query     ◄───► Middleware (helmet/cors/rate-limit)
  Zustand Cart           │
                    Controllers
                         │
                    Services Layer
                    ┌────┴────┐
                    │         │
               Supabase    OpenAI
               (Postgres)  (AI features)
                    │
           ┌────────┴────────┐
           │                 │
         Stripe           Razorpay
```

---

## Proposed Changes

### 1 — Frontend (NEW)

**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + React Query + React Router v6

#### [NEW] `frontend/` — Vite React + TypeScript app

Key pages & components:
- **Homepage** — Hero, featured dishes, categories, trending section
- **Products** — Filterable/searchable product grid with AI search bar
- **Product Detail** — Images, description, variants, reviews, add to cart
- **Cart** — Zustand-managed cart with Stripe/Razorpay checkout
- **Auth** — Login/Register/Google OAuth via backend JWT
- **Order History** — User's past orders with status tracking
- **Admin Dashboard** — Product management, order management, AI description generator
- **Checkout** — Address + payment gateway selection + confirmation

Design system: Dark mode + warm saffron/turmeric color palette, glassmorphism cards, micro-animations.

---

### 2 — Backend (NEW)

**Stack**: Node.js 20 LTS + Express + Supabase (Postgres via `@supabase/supabase-js`) + JWT + bcrypt

#### [NEW] `backend/src/config/`
- `db.js` — Supabase client init
- `env.js` — Validated env vars (zod)
- `constants.js` — App-wide constants

#### [NEW] `backend/src/models/`
Supabase SQL migrations (not Mongoose — we use Supabase/Postgres):
- `users`, `roles`, `products`, `categories`, `variants`
- `carts`, `cart_items`, `orders`, `order_items`
- `payments`, `reviews`, `refresh_tokens`

#### [NEW] `backend/src/middleware/`
- `auth.js` — JWT verification + role guard
- `validate.js` — Zod schema validation wrapper
- `rateLimiter.js` — express-rate-limit configs
- `errorHandler.js` — Global error handler
- `security.js` — Helmet + CORS + CSP

#### [NEW] `backend/src/controllers/`
- `authController.js` — Register, login, refresh, logout, Google OAuth
- `productController.js` — CRUD + search + filter
- `categoryController.js`
- `cartController.js`
- `orderController.js`
- `paymentController.js` — Stripe + Razorpay
- `reviewController.js`
- `aiController.js` — AI search, recommendations, description gen
- `adminController.js`

#### [NEW] `backend/src/services/`
- `authService.js`
- `productService.js`
- `orderService.js`
- `paymentService.js` — Provider selection logic
- `stripeService.js`
- `razorpayService.js`
- `aiService.js`
- `emailService.js` (Nodemailer/Resend)

#### [NEW] `backend/src/routes/`
- `auth.routes.js`
- `product.routes.js`
- `category.routes.js`
- `cart.routes.js`
- `order.routes.js`
- `payment.routes.js`
- `review.routes.js`
- `ai.routes.js`
- `admin.routes.js`

#### [NEW] `backend/src/utils/`
- `jwt.js` — Token generation/verification
- `crypto.js` — Webhook signature verification
- `apiResponse.js` — Standardized response format
- `logger.js` — Winston logger
- `idempotency.js` — Payment idempotency

#### [NEW] `backend/src/app.js` + `backend/src/server.js`

---

### 3 — Database (Supabase/Postgres)

#### [NEW] `backend/supabase/migrations/`
- `001_initial_schema.sql` — Full schema with indexes, RLS policies
- `002_seed_data.sql` — Categories + sample products

---

### 4 — DevOps

#### [NEW] `backend/Dockerfile`
#### [NEW] `docker-compose.yml`
#### [NEW] `.github/workflows/ci.yml` — Lint + test + build
#### [NEW] `.github/workflows/deploy.yml` — Auto-deploy on main push
#### [NEW] `.env.example` — All required env vars documented

---

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login + return tokens |
| POST | `/api/auth/refresh` | — | Rotate refresh token |
| POST | `/api/auth/logout` | User | Blacklist refresh token |
| GET | `/api/auth/google` | — | Google OAuth redirect |
| GET | `/api/products` | — | List + filter products |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | All categories |
| GET | `/api/cart` | User | Get user cart |
| POST | `/api/cart` | User | Add/update cart item |
| DELETE | `/api/cart/:itemId` | User | Remove cart item |
| POST | `/api/orders` | User | Place order |
| GET | `/api/orders/me` | User | My orders |
| GET | `/api/orders/:id` | User/Admin | Order detail |
| POST | `/api/payments/stripe/create` | User | Create Stripe session |
| POST | `/api/payments/razorpay/create` | User | Create Razorpay order |
| POST | `/api/payments/stripe/webhook` | — | Stripe webhook |
| POST | `/api/payments/razorpay/webhook` | — | Razorpay webhook |
| POST | `/api/payments/razorpay/verify` | User | Verify Razorpay payment |
| GET | `/api/reviews/:productId` | — | Product reviews |
| POST | `/api/reviews` | User | Submit review |
| POST | `/api/ai/search` | — | AI natural language search |
| GET | `/api/ai/recommendations` | — | Personalized recommendations |
| POST | `/api/ai/generate-description` | Admin | AI product description |

---

## Open Questions

> [!IMPORTANT]
> **1. Payment Gateway**: Should Stripe be default for international and Razorpay for Indian IP? Or let the user choose?

> [!IMPORTANT]
> **2. Image Storage**: Where should product images be stored? Options:
> - Supabase Storage (free tier: 1GB)
> - Cloudinary (generous free tier, better image transforms)
> - AWS S3 (production scale)
>
> **Recommendation: Supabase Storage** for simplicity since we're already using Supabase.

> [!IMPORTANT]
> **3. Email**: Should we set up transactional emails (order confirmation, etc.)? Options: Resend (easiest), SendGrid, Nodemailer+SMTP.

> [!NOTE]
> **4. Deployment**: The plan targets Vercel (frontend) + Render (backend) + Supabase (DB). Is this correct?

---

## Verification Plan

### Automated Tests
```bash
# Backend unit tests
cd backend && npm test

# API integration tests
cd backend && npm run test:api

# E2E (Playwright)
cd frontend && npx playwright test
```

### Manual Verification
- Auth flow: register → login → Google OAuth
- Product browsing + search + AI search
- Cart add/remove + persist across sessions
- Checkout with Stripe test card `4242 4242 4242 4242`
- Checkout with Razorpay test mode
- Admin dashboard: create/edit/delete product
- AI description generator
- Order history page
- Mobile responsive check (375px, 768px, 1280px)
