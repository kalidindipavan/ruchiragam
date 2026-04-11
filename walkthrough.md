# Ruchi Ragam — Platform Build Complete

We have successfully transformed the frontend scaffolding into a complete, production-ready full-stack SaaS marketplace for authentic Indian food.

## Architecture & Foundation

The platform has been structured as a monorepo with dedicated `frontend` and `backend` directories. 

## 1. Backend Implementation
We built a highly robust, clean-architecture Node.js/Express API.

* **Security First:** Implemented strict OWASP compliance using `Helmet`, custom CORS configurations, Rate Limiting (differentiated limits for API, Auth, AI, and Payments), and `Zod` request validation.
* **Database & Schema:** Created comprehensive Supabase/PostgreSQL migrations (`001_initial_schema.sql`) covering Users, Roles, Categories, Products, Variants, Carts, Orders, Payments, and Reviews, along with Row-Level Security (RLS) policies and triggers. Seeded the database with traditional Indian food categories (`002_seed_data.sql`).
* **Advanced Auth:** Integrated JWT access/refresh token rotation, bcrypt password hashing, and Google OAuth via Passport.js.
* **Dual Payments:** Abstracted a clean `PaymentService` that routes and normalizes transactions between **Stripe** (International) and **Razorpay** (Domestic UPI/Cards), with robust idempotency and webhook handlers.
* **AI Engine:** Integrated **OpenAI GPT-4o** for natural language product filtering and recommendation processing.
* **DevOps Ready:** Created a non-root production `Dockerfile` with multi-stage builds, a `docker-compose.yml` for local testing, and comprehensive GitHub Action pipelines for CI (testing, linting, security audits) and CD (Render/Vercel deployments).

> [!TIP]
> **To start the backend**
> Ensure you copy `.env.example` to `.env` and fill in your Supabase, Stripe, Razorpay, and OpenAI keys. You can then run `npm run dev` in the backend folder.

## 2. Frontend Implementation
We implemented a beautiful, performant React application tailored with a custom Indian-themed design language.

* **State Management:** Set up zero-boilerplate local state using Zustand (`authStore.ts` with local storage persistence and `cartStore.ts` synced with the API). Used `@tanstack/react-query` for high-performance server-state fetching and caching.
* **Design System Framework:** Authored a complete `index.css` implementing a stunning "Modern Indian Dark Mode" aesthetic (Saffron, Turmeric, Deep Charcoal tones, Glassmorphism, and micro-animations) without relying solely on generic Tailwind configs.
* **Authentication Flow:** Built sleek Google OAuth & Email/Password Login and Registration pages (`/auth/login`, `/auth/register`) strictly typed with `react-hook-form` and `zod`.
* **Dynamic Cart:** Created a slide-in Cart Sidebar with real-time calculations and variant tracking.
* **Checkout:** Implemented a secure checkout experience (`/checkout`) integrating the dual payment gateway UX. Users can select Razorpay for India-specific payment methods or Stripe for international cards.
* **AI-Assisted Menus:** The main Products page (`/products`) includes a dynamic layout and integrates the OpenAI search endpoint, allowing users to type *"Spicy veg curries under ₹200"* to automatically filter the list.
* **Product Discovery:** Added a rich `ProductDetail` page showcasing HD images, dietary badges (Veg, Vegan, Spice Level), variants, prep times, and dynamic customer reviews.

> [!NOTE]
> **API Integration**
> The `apiClient.ts` custom Axios instance automatically handles JWT injection and seamless refresh token flows on 401 errors, meaning users stay logged in securely without disruption.

## Next Steps

1. **Deploy DB Migrations:** Copy the SQL in `backend/supabase/migrations/` and execute it in your Supabase SQL Editor.
2. **Setup Env Variables:** Create your `.env` files in both frontend and backend using the `.env.example` files provided.
3. **Launch Platform:** 
   *(Terminal 1)* `cd backend && npm run dev`
   *(Terminal 2)* `cd frontend && npm run dev`
