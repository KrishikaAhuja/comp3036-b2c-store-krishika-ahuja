# Bookstore Application

This project is a full-stack bookstore application built as a monorepo. It includes a customer-facing storefront and an administrator dashboard for managing the store.

## API Documentation

### Overview

The application consists of:

- **Customer Storefront** - customers can browse books, search and filter the catalogue, like books, add items to a cart, complete a mock checkout, and view purchase history.
- **Admin Dashboard** - administrators can sign in, manage inventory, create and edit books, view orders, view customers, and monitor store activity.

Main features:

- Browse books
- Search and filter books
- Mock checkout
- Purchase history
- Inventory management
- Customer and order management

### Tech Stack

- **Frontend framework:** Next.js 15, React 19, TypeScript
- **Backend/API framework:** Next.js App Router API routes
- **Database:** SQLite
- **ORM:** Prisma
- **Authentication:** JWT stored in HTTP-only cookies
- **Password hashing:** bcryptjs
- **Styling:** Tailwind CSS and CSS Modules
- **Testing frameworks:** Vitest and Playwright
- **Monorepo tooling:** pnpm workspaces and Turborepo

### Environment Variables

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `DATABASE_URL` | Yes | SQLite database connection string. |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens. |
| `PASSWORD` | Yes | Admin password fallback used by the admin app and seed process. |
| `ADMIN_NAME` | No | Optional seeded admin display name. |
| `ADMIN_EMAIL` | No | Optional seeded admin email address. |
| `ADMIN_PASSWORD` | No | Optional seeded admin password override. |
| `CUSTOMER_SITE_URL` | No | Customer storefront URL used by the admin preview page. |
| `NEXT_PUBLIC_ADMIN_URL` | No | Admin dashboard URL used by the customer auth page. |
| `E2E` | No | Enables the test-only seed API route. |
| `E2E_WEB_PORT` | No | Customer storefront port used during Playwright tests. |
| `E2E_ADMIN_PORT` | No | Admin dashboard port used during Playwright tests. |
| `E2E_WEB_URL` | No | Customer storefront URL used by Playwright tests. |
| `E2E_ADMIN_URL` | No | Admin dashboard URL used by Playwright tests. |
| `SKIP_ENV_VALIDATION` | No | Skips environment variable validation when enabled. |
| `CI` | No | Enables CI-specific Playwright behaviour. |
| `VERCEL_URL` | No | Optional URL used by Playwright fixtures. |

### API Endpoints

Product browsing, category pages, tag pages, search pages, detail pages, cart pages, and purchase history pages are mostly server-rendered and query the database directly rather than using public JSON API endpoints.

#### Customer Authentication

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `POST` | `/api/auth/register` | Register a new customer account. | No |
| `POST` | `/api/auth/login` | Log in a customer and set the customer auth cookie. | No |
| `POST` | `/api/auth/logout` | Log out the current customer. | Yes |
| `GET` | `/api/auth/me` | Return the currently authenticated customer. | Yes |

#### Checkout

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `POST` | `/api/checkout` | Validate checkout details, create an order, create order items, and update stock. | Yes |

#### Likes / Wishlist

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `POST` | `/api/likes` | Toggle a liked book for the signed-in customer. | Yes |

#### Product & Inventory Management

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `GET` | `/api/posts` | List admin inventory items with optional filters. | Yes |
| `POST` | `/api/posts` | Create a new book/product. | Yes |
| `PUT` | `/api/posts` | Update an existing book/product. | Yes |
| `PATCH` | `/api/posts/:id` | Toggle a book between active and inactive. | Yes |
| `DELETE` | `/api/posts/:id` | Delete a book/product. | Yes |

#### Admin Authentication

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `POST` | `/api/auth` | Log in an admin and set the admin auth cookie. | No |
| `DELETE` | `/api/auth` | Log out an admin by clearing the admin auth cookie. | Yes |
| `POST` | `/api/login` | Admin login route re-export used by forms. | No |
| `POST` | `/api/logout` | Admin logout route used by forms. | Yes |

#### Testing Utilities

| Method | Route | Purpose | Auth |
| ------ | ----- | ------- | ---- |
| `GET` | `/api/seed` | Runs the database seed during E2E testing only. | No |

### Database Models

- **User** - Stores customer and administrator accounts. Users can have many orders.
- **Post** - Represents a book/product in the catalogue. Posts can have likes and order item records.
- **Order** - Stores completed customer purchases, payment status, total amount, and customer relationship.
- **OrderItem** - Stores purchased book snapshots for each order, including title, price, quantity, and line total.
- **Like** - Stores customer liked books using a composite key of post and customer identifier.

### Mock Checkout Flow

1. Customer adds books to cart.
2. Customer proceeds to checkout.
3. Checkout information is validated.
4. Mock payment is processed.
5. Order and order items are created.
6. Stock quantities are updated.
7. Cart is cleared.
8. Customer is redirected to the confirmation page.

Payments are simulated. No Stripe or PayPal integration is used.

Validation summary:

- Card number must contain exactly 16 digits.
- Spaces are ignored.
- Only numeric characters are allowed.
- CVV must contain exactly 3 digits.
- Expiry date must follow `MM/YY` format.
- Checkout fails if stock is insufficient.

### Error Handling

| Status | Description |
| ------ | ----------- |
| 200 | Successful request |
| 201 | Resource created |
| 400 | Validation error |
| 401 | Unauthorized |
| 404 | Resource not found |
| 409 | Conflict |
| 501 | Feature unavailable |

API errors generally return a JSON object containing an `error` message.

### Testing

Development commands:

```bash
pnpm dev
pnpm --filter @repo/web dev
pnpm --filter @repo/admin dev
```

Unit testing:

```bash
pnpm --filter @repo/web test
pnpm --filter @repo/ui test
pnpm --filter @repo/utils test
```

Playwright E2E testing:

```bash
pnpm --filter @repo/playwright test-1
pnpm --filter @repo/playwright test-2
pnpm --filter @repo/playwright test-3
```

Database commands:

```bash
pnpm --filter @repo/db db:generate
pnpm --filter @repo/db db:push
pnpm --filter @repo/db db:migrate:dev
```

Manual development uses `dev.db`. Playwright E2E tests use an isolated `test.db` and run the customer storefront and admin dashboard on separate ports so tests do not interfere with manual development.

### Example Requests

Customer registration:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"customer@example.com","password":"password123"}'
```

Customer login:

```bash
curl -i -c cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password123"}'
```

Mock checkout:

```bash
curl -i -b cookies.txt -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"id":1,"quantity":1}],
    "customer":{
      "fullName":"Test Customer",
      "email":"customer@example.com",
      "phone":"0412345678",
      "deliveryAddress":"12 Book Lane, Sydney, NSW, 2000"
    },
    "payment":{
      "method":"mock_credit_card",
      "cardholderName":"Test Customer",
      "cardNumber":"1234 5678 9012 3456",
      "expiryDate":"12/28",
      "cvv":"123"
    }
  }'
```

Admin create product:

```bash
curl -i -b admin-cookies.txt -X POST http://localhost:3002/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Example Book",
    "description":"Short summary",
    "content":"# Book details\n\n**Author:** Example Author",
    "imageUrl":"https://example.com/book.jpg",
    "category":"Fiction",
    "priceAud":25,
    "stockQuantity":10,
    "active":true
  }'
```
