# StockDatabase

Inventory management system for tracking stock levels, lists, and supplier data.

## Stack

- **Backend**: Node.js / Express, MongoDB
- **Frontend**: React / Vite

## Setup

```bash
# backend
cd app/backend
npm install
cp .env.example .env  # add MONGO_URI
node index.js

# frontend
cd app/frontend
npm install
npm run dev
```

## API

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/stock` | Stock items |
| GET/POST | `/api/lists` | Stock lists |
