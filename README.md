# ecom-bkend

Express/MongoDB ecommerce backend using a layered structure:

- `routes` handle HTTP paths
- `controllers` translate HTTP requests/responses
- `services` hold business logic
- `models` define persistence
- `middleware` handles auth, validation, security, and errors

## Features

- JWT login/register/logout and current-user endpoint
- Role-based authorization for `customer`, `seller`, and `admin`
- Users, categories, products, carts, orders, reviews, coupons, and payment intent placeholder
- Request validation with Zod
- Centralized error handling and async controller wrapper
- Helmet, CORS, rate limiting, HPP, Mongo sanitize, compression, and cookie parsing
- MongoDB models with indexes and basic ecommerce relationships

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Seed sample data after MongoDB is running:

```bash
npm run seed
```

Default seeded admin:

```text
email: admin@example.com
password: Admin123!
```

## API base

`/api/v1`

Key routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /products`
- `POST /products` seller/admin
- `GET /cart`
- `POST /cart/items`
- `POST /orders`
- `GET /orders/my-orders`
