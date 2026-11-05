# TatagMarinduque

A Next.js and Express prototype for a Marinduque micro-enterprise directory, wholesale quote requests, and a local sourcing bulletin. All makers and records in the included demo data are fictional sample data; replace them only with information that has been confirmed and approved for publication.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

1. Install the root and API dependencies:

   ```powershell
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`. Keep `.env` private.
3. Seed the database with clearly labeled sample records (optional):

   ```powershell
   npm run seed
   ```

4. Start the frontend and API together:

   ```powershell
   npm run dev
   ```

The frontend runs at `http://localhost:3000`; the API runs at `http://localhost:4000`. The homepage currently uses in-browser sample listings. The Express API is available under `/api` and requires MongoDB for data-backed routes.

## Workspace commands

- `npm run dev:client` starts Next.js.
- `npm run dev:server` starts Express.
- `npm run lint` checks the frontend.
- `npm run build` makes a production build of the frontend.
- `npm run seed` inserts six sample vendors, products, and three sample bulletin posts. The seed script removes the matching sample rows before recreating them.
- `npm run test:server` runs the backend unit tests.

## Environment variables

- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: long, private signing secret for session tokens.
- `CLIENT_URL`: allowed browser origin for the API (default `http://localhost:3000`).
- `PORT`: API port (default `4000`).

## Current prototype boundaries

The home and `/directory` screens use local sample listings. The `/bulletin` post form is a browser-only preview. Registration, login, `/quote/[vendorId]`, the maker dashboard, and officer review screens call the Express API and require a configured MongoDB database. The quote request requires a buyer account and a verified vendor. The seeded records use stable sample IDs for the included quote links.

The maker dashboard accepts an image URL but does not upload image files. Sample photography is illustrative and should be replaced with approved product images. No real vendor information, certifications, DTI decisions, payment handling, production deployment, or instructor submission requirements are included. Treat this as a development prototype, not a live marketplace.

Image credit: woven bamboo basket photograph by Rajesh Dangi, Wikimedia Commons, licensed under CC BY-SA 3.0. The remaining illustrative product photographs are loaded from Unsplash.
