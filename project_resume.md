🥘 Project Overview: Ruchi Ragam
Ruchi Ragam is a high-fidelity, full-stack SaaS Marketplace designed for authentic, homemade Indian food. It bridges the gap between home-chefs and customers, providing a premium platform with international and domestic capabilities.

1. System Architecture (The "Big Picture")
Structure: Monorepo with a decoupled frontend and backend.
Tech Stack:
Frontend: React (Vite) + TypeScript + Zustand + TanStack Query.
Backend: Node.js + Express.js.
Database: PostgreSQL (via Supabase).
Infrastructure: Docker, Docker Compose, GitHub Actions.
TIP

Interviewer Hook: "I chose a Monorepo for its ease of shared types and synchronized deployments, ensuring the frontend always matches our API specifications perfectly."

2. Frontend Excellence (React)
The frontend isn't just a UI; it's a high-performance Single Page Application (SPA).

Modern Design: Built a custom CSS design system called "Modern Indian Dark Mode" using Saffron/Turmeric tones, Glassmorphism, and micro-animations. It’s 100% responsive.
State Management (Zustand): Used Zustand for lightweight, boilerplate-free global state (Auth and Cart), ensuring data persists across page refreshes.
Server State (TanStack Query): Handles all API fetching. Benefits: Automatic caching, background re-fetching, and optimistic UI updates (e.g., adding to cart feels instant).
Type Safety: Used TypeScript and Zod throughout the frontend to prevent runtime errors.
3. Robust Backend (Node.js/Express)
A production-ready API focused on Scalability and Security.

Clean Architecture: Separated logic into controllers, services, routes, and middleware.
Security First:
Advanced Auth: Implemented JWT Access & Refresh Token Rotation. If an access token expires, the client uses a refresh token to stay logged in securely.
OWASP Compliance: Used Helmet.js to prevent XSS/Clickjacking and Express-Rate-Limit to stop Brute-Force attacks.
Middleware: Created custom loggers (Winston) and global error handlers to ensure the server never "crashes" but returns clean JSON errors.
4. Advanced Database & Storage (Supabase)
PostgreSQL: Relational database for handling complex relationships between Users, Products, Categories, and Orders.
Row-Level Security (RLS): This is critical. Instead of just "coding" security, I implemented it at the database level. A user can only see their orders, and only an Admin can edit products.
Supabase Auth: Integrated Google OAuth 2.0 and standard Email/Password login.
5. Dual Payment Gateway (Stripe & Razorpay)
One of the most complex parts of the project.

Why Dual? To support Global Clients (Stripe) for international cards and Domestic Clients (Razorpay) for Indian UPI and net banking.
Service-Oriented Design: I wrote a PaymentService that abstracts the logic. The frontend just calls /api/payments/pay, and the backend decides which gateway to use based on user context.
Idempotency & Webhooks: Handled Stripe/Razorpay webhooks to confirm payments asynchronously. If a user closes the browser before the payment completes, the backend still updates the order status.
6. AI Innovation (OpenAI GPT-4o)
The Idea: Traditional filters are boring. I integrated OpenAI GPT-4o to allow Natural Language Search.
How it works: A user types "Something healthy under ₹300 with less spice." The backend sends this to GPT, which responds with specific product IDs from our DB, which are then displayed to the user.
7. DevOps & Deployment (Docker)
Docker: Created Dockerfiles for both services. This ensures that the app runs exactly the same on your laptop, a night-shift server, or a production cloud environment.
CI/CD: Set up GitHub Actions to automatically run Linting and Unit Tests (Jest) every time I push code.
🎓 Key Talking Points for Wyreflow (US Shift Role)
Independent Delivery: "I built this entire marketplace from scratch, handling everything from SQL schema design to the final Docker deployment. This shows I can work independently and deliver end-to-end features."
Productivity in Global Context: "By integrating Stripe and Razorpay, I demonstrated my ability to build software for a global audience, which is essential for working with US-based clients."
Code Quality: "I prioritized Type-Safety and Security (OWASP). I don't just build things that work; I build things that are secure and maintainable long-term."
Adaptability: "I integrated cutting-edge AI (OpenAI) into a traditional Marketplace model, showing my ability to quickly learn and apply new technologies to solve business problems."