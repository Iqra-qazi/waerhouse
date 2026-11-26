# Warehouse Backend API Guide

## Base URL

- Development: `http://localhost:5000`
- API prefix: `/api`
- Default port: `5000`
- Health: `GET /api/health`
- Frontend origin allowed by CORS: `http://localhost:5173`

## Start

```powershell
cd backend
npm install
npm start
```

Set `MONGODB_URI`, `JWT_SECRET`, and optional ImageKit variables. Copy [`.env.example`](.env.example) to `.env`.

## Authentication

Send JWT bearer tokens:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## Response format

Success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {}
  }
}
```

## Roles

- `admin`: full user, warehouse, product, stock, order, supply, dashboard, and transaction access.
- `manager`: warehouse visibility, stock management/history, order viewing/status updates, supply review, and dashboard access.
- `sales`: product catalog, own orders, order creation/cancellation, and warehouse visibility.
- `supplier`: own products, own supply requests, and ImageKit upload access.

## Endpoints

### Auth

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public; role must be `sales` or `supplier` | `{"name":"Alex Smith","email":"alex@example.com","password":"Password123!","role":"sales","phone":"5550100"}` | `201 {"success":true,"message":"Registration successful","data":{"token":"<jwt>","user":{"id":"...","name":"Alex Smith","email":"alex@example.com","role":"sales","isActive":true}}}` | `400 {"success":false,"message":"Password must be at least 8 characters","data":null,"error":{"code":"VALIDATION_ERROR"}}` |
| POST | `/api/auth/login` | Public | `{"email":"alex@example.com","password":"Password123!"}` | `200 {"success":true,"message":"Login successful","data":{"token":"<jwt>","user":{"id":"...","role":"sales"}}}` | `401 {"success":false,"message":"Invalid email or password","data":null,"error":{"code":"INVALID_CREDENTIALS"}}` |
| GET | `/api/auth/me` | Authenticated | None | `200 {"success":true,"message":"Current user","data":{"id":"...","name":"Alex Smith","role":"sales"}}` | `401 {"success":false,"message":"Authentication required","data":null,"error":{"code":"AUTH_REQUIRED"}}` |
| POST | `/api/auth/logout` | Authenticated | None | `200 {"success":true,"message":"Logout successful","data":null}` | `401 INVALID_TOKEN` |

### Users

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| GET | `/api/users` | Admin | None | `200 {"success":true,"message":"Users retrieved","data":[{"id":"...","name":"Alex","role":"sales"}]}` | `403 FORBIDDEN` |
| GET | `/api/users/:id` | Admin | None | `200 {"success":true,"message":"User retrieved","data":{"id":"...","email":"alex@example.com"}}` | `404 NOT_FOUND` |
| POST | `/api/users` | Admin | `{"name":"New Manager","email":"manager@example.com","password":"Password123!","role":"manager","phone":"5550101"}` | `201 {"success":true,"message":"User created","data":{"id":"..."}}` | `409 DUPLICATE_VALUE` |
| PATCH | `/api/users/:id` | Admin | `{"role":"manager","isActive":true}` | `200 {"success":true,"message":"User updated","data":{"id":"...","role":"manager"}}` | `400 VALIDATION_ERROR` |
| DELETE | `/api/users/:id` | Admin | None | `200 {"success":true,"message":"User deactivated","data":{"id":"...","isActive":false}}` | `400 {"error":{"code":"VALIDATION_ERROR"}}` for own account |

### Warehouses

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| GET | `/api/warehouses` | Authenticated | None | `200 {"success":true,"message":"Warehouses retrieved","data":[{"name":"Main","code":"MAIN"}]}` | `401 AUTH_REQUIRED` |
| GET | `/api/warehouses/:id` | Authenticated | None | `200 {"success":true,"message":"Warehouse retrieved","data":{"name":"Main","code":"MAIN"}}` | `404 NOT_FOUND` |
| POST | `/api/warehouses` | Admin | `{"name":"West Warehouse","code":"WEST","address":"10 West Road","manager":"<userId>"}` | `201 {"success":true,"message":"Warehouse created","data":{"name":"West Warehouse","code":"WEST"}}` | `400 VALIDATION_ERROR` |
| PATCH | `/api/warehouses/:id` | Admin | `{"address":"11 West Road","isActive":true}` | `200 {"success":true,"message":"Warehouse updated","data":{"address":"11 West Road"}}` | `404 NOT_FOUND` |
| DELETE | `/api/warehouses/:id` | Admin | None | `200 {"success":true,"message":"Warehouse deactivated","data":{"isActive":false}}` | `404 NOT_FOUND` |

### Products

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| GET | `/api/products` | Public | Optional query `?category=Electronics&search=laptop` | `200 {"success":true,"message":"Products retrieved","data":[{"name":"Laptop","sku":"LAPTOP-001","price":800}]}` | `500 INTERNAL_SERVER_ERROR` |
| GET | `/api/products/:id` | Public | None | `200 {"success":true,"message":"Product retrieved","data":{"name":"Laptop","sku":"LAPTOP-001"}}` | `404 NOT_FOUND` |
| POST | `/api/products` | Admin or supplier | `{"name":"Laptop","sku":"LAPTOP-001","category":"Electronics","price":800,"cost":650,"unit":"piece","lowStockThreshold":5,"warehouse":"<warehouseId>","imageUrl":"https://..."}` | `201 {"success":true,"message":"Product created","data":{"name":"Laptop","sku":"LAPTOP-001"}}` | `400 VALIDATION_ERROR` |
| PATCH | `/api/products/:id` | Admin or owning supplier | `{"price":850,"description":"Updated description","isActive":true}` | `200 {"success":true,"message":"Product updated","data":{"price":850}}` | `403 FORBIDDEN` |
| DELETE | `/api/products/:id` | Admin or owning supplier | None | `200 {"success":true,"message":"Product deactivated","data":{"isActive":false}}` | `403 FORBIDDEN` |

### Stock

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| GET | `/api/stock` | Admin or manager; optional `?warehouse=<id>&product=<id>` | None | `200 {"success":true,"message":"Stock retrieved","data":[{"quantity":25}]}` | `403 FORBIDDEN` |
| GET | `/api/stock/low` | Admin or manager | None | `200 {"success":true,"message":"Low stock retrieved","data":[{"quantity":4}]}` | `403 FORBIDDEN` |
| GET | `/api/stock/history` | Admin or manager; optional query filters | None | `200 {"success":true,"message":"Stock history retrieved","data":[{"type":"IN","quantity":5}]}` | `403 FORBIDDEN` |
| POST | `/api/stock/add` | Admin or manager | `{"product":"<productId>","warehouse":"<warehouseId>","quantity":5,"reason":"Supplier delivery"}` | `200 {"success":true,"message":"Stock added","data":{"quantity":30}}` | `400 VALIDATION_ERROR` |
| POST | `/api/stock/remove` | Admin or manager | `{"product":"<productId>","warehouse":"<warehouseId>","quantity":2,"reason":"Damaged goods"}` | `200 {"success":true,"message":"Stock removed","data":{"quantity":28}}` | `409 {"error":{"code":"INSUFFICIENT_STOCK","details":{"available":1,"requested":2}}}` |

### Orders

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| POST | `/api/orders` | Sales | `{"warehouse":"<warehouseId>","items":[{"product":"<productId>","quantity":2}],"shippingAddress":"123 Buyer Road","note":"Call on arrival"}` | `201 {"success":true,"message":"Order created","data":{"orderNumber":"ORD-20261125-AB1234","status":"pending","totalAmount":1600}}` | `409 INSUFFICIENT_STOCK` |
| GET | `/api/orders/my` | Sales | None | `200 {"success":true,"message":"My orders retrieved","data":[{"orderNumber":"ORD-...","status":"pending"}]}` | `403 FORBIDDEN` |
| GET | `/api/orders` | Admin, manager, or sales (sales see only own orders) | Optional | `200 {"success":true,"message":"Orders retrieved","data":[]}` | `403 FORBIDDEN` |
| GET | `/api/orders/:id` | Admin/manager; sales only for own order | None | `200 {"success":true,"message":"Order retrieved","data":{"orderNumber":"ORD-..."}}` | `403 FORBIDDEN` |
| PATCH | `/api/orders/:id/status` | Admin or manager | `{"status":"shipped"}` | `200 {"success":true,"message":"Order status updated","data":{"status":"shipped"}}` | `400 INVALID status` |
| PATCH | `/api/orders/:id/cancel` | Owning sales user | None | `200 {"success":true,"message":"Order cancelled","data":{"status":"cancelled"}}` | `409 INVALID_ORDER_STATE` |

### Supply

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| POST | `/api/supply` | Supplier; own product | `{"product":"<productId>","warehouse":"<warehouseId>","quantity":20,"note":"Incoming batch"}` | `201 {"success":true,"message":"Supply request created","data":{"status":"pending","quantity":20}}` | `403 FORBIDDEN` |
| GET | `/api/supply/my` | Supplier | None | `200 {"success":true,"message":"Supply requests retrieved","data":[{"status":"pending","quantity":20}]}` | `403 FORBIDDEN` |
| GET | `/api/supply` | Admin or manager; optional `?status=pending` | None | `200 {"success":true,"message":"Supply requests retrieved","data":[]}` | `403 FORBIDDEN` |
| PATCH | `/api/supply/:id/review` | Admin or manager | `{"status":"approved"}` | `200 {"success":true,"message":"Supply request reviewed","data":{"status":"approved"}}` | `409 INVALID_REQUEST_STATE` |

### Admin

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| GET | `/api/admin/dashboard` | Admin or manager | None | `200 {"success":true,"message":"Dashboard statistics","data":{"users":4,"products":2,"orders":1,"pendingSupplyRequests":1,"totalStockQuantity":45}}` | `403 FORBIDDEN` |
| GET | `/api/admin/transactions` | Admin or manager | None | `200 {"success":true,"message":"Transactions retrieved","data":[{"type":"IN","quantity":5}]}` | `403 FORBIDDEN` |
| GET | `/api/admin/low-stock` | Admin or manager | None | `200 {"success":true,"message":"Low stock retrieved","data":[]}` | `403 FORBIDDEN` |

### Upload

| Method | URL | Auth/role | Request body | Success example | Error example |
|---|---|---|---|---|---|
| POST | `/api/upload` | Authenticated | `multipart/form-data`, field name `file`, JPEG/PNG/WebP/GIF, maximum 5 MB | `201 {"success":true,"message":"Image uploaded","data":{"url":"https://...","fileId":"...","name":"..."}}` | `503 UPLOAD_NOT_CONFIGURED` or `400 VALIDATION_ERROR` |

## Data models

### User

`name` String required, `email` unique String required, `password` String required/hidden, `role` enum `admin|manager|sales|supplier`, `phone` String, `isActive` Boolean default true, `createdAt`, `updatedAt`.

### Warehouse

`name` String required, `code` unique uppercase String required, `address` String, `manager` User ObjectId, `isActive` Boolean default true, timestamps.

### Product

`name` String required, `sku` unique uppercase String required, `category` String, `description` String, `price` Number required >=0, `cost` Number >=0, `unit` String default `piece`, `lowStockThreshold` Number default 10, `imageUrl` String, `supplier` User ObjectId, `warehouse` Warehouse ObjectId, `isActive` Boolean, timestamps.

### Stock

`product` Product ObjectId required, `warehouse` Warehouse ObjectId required, `quantity` Number required >=0, timestamps. Product/warehouse pairs are unique.

### StockTransaction

`product` Product ObjectId required, `warehouse` Warehouse ObjectId required, `type` enum `IN|OUT|ADJUSTMENT|ORDER`, `quantity` Number >=1, `reason` String, `performedBy` User ObjectId required, timestamps.

### SupplyRequest

`supplier` User ObjectId required, `product` Product ObjectId required, `warehouse` Warehouse ObjectId required, `quantity` Number >=1, `status` enum `pending|approved|rejected`, `note` String, `reviewedBy` User ObjectId, `reviewedAt` Date, timestamps.

### Order

`orderNumber` unique String, `customer` User ObjectId required, `warehouse` Warehouse ObjectId required, `items` array of `{product, quantity, unitPrice}`, `status` enum `pending|confirmed|shipped|delivered|cancelled`, `totalAmount` Number >=0, `shippingAddress` String required, `note` String, timestamps.
