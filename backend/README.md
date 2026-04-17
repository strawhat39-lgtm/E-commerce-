# Sustainable E-Commerce + Circular Economy Backend

A clean, modular Node.js backend prototype using Express, TypeScript, and Supabase. Designed for the hackathon MVP.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Make a copy of `.env.example` named `.env` and fill in your Supabase credentials:
   ```env
   PORT=5000
   SUPABASE_URL=your_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_admin_key
   ```
   > **Note**: We use the Service Role Key to intentionally bypass Row-Level Security for the hackathon prototype.

3. **Database Setup**
   Go to your Supabase SQL Editor and execute:
   1. `supabase/schema.sql` (Creates all tables)
   2. `supabase/seed.sql` (Inserts mock users, listings, requests, food rescue, and upcycle items)

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Example API Requests

### Check API Health
```bash
curl -X GET http://localhost:5000/health
```

### Get All Marketplace Listings
```bash
curl -X GET http://localhost:5000/api/listings
```

### Add Item to Carbon Footprint Cart
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "b3c8f8d5-1c3f-4e0a-a5f1-3d7c5e8c1b2a",
    "product_name": "Organic Cotton T-Shirt",
    "category": "Clothing",
    "quantity": 2
  }'
```

### Claim Food Rescue Item
```bash
curl -X PATCH http://localhost:5000/api/food-rescue/1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6/claim \
  -H "Content-Type: application/json" \
  -d '{
    "claimer_id": "f6b8a2c1-9d4e-4f7b-8c1a-2e3d5b4a6f7c",
    "message": "I can pick this up in 30 mins."
  }'
```

### Get Admin Dashboard Summary
```bash
curl -X GET http://localhost:5000/api/admin/summary
```
