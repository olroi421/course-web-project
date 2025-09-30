# E-commerce API Documentation

## 🌐 Base URL
```
http://localhost:3000
```

## 📚 Available Endpoints

### 🏠 Root Endpoint
- **GET** `/` - API information and available endpoints

---

## 🔐 Authentication

### Register User
- **POST** `/api/auth/register`
- **Description:** Register a new user
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "Іван",
  "lastName": "Петренко",
  "phone": "+380501234567"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Іван",
    "lastName": "Петренко",
    "phone": "+380501234567",
    "role": "CUSTOMER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login User
- **POST** `/api/auth/login`
- **Description:** Login existing user
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Іван",
    "lastName": "Петренко",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Іван",
  "lastName": "Петренко",
  "phone": "+380501234567",
  "role": "CUSTOMER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile (Protected)
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "firstName": "Новеім'я",
  "lastName": "Новеприізвище",
  "phone": "+380509876543"
}
```

### Change Password (Protected)
- **PUT** `/api/auth/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

## 📦 Categories

### Get All Categories
- **GET** `/api/categories`
- **Description:** Get all categories with product count
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Смартфони",
    "description": "Мобільні телефони та аксесуари",
    "slug": "smartphones",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "productCount": 5
  }
]
```

### Get Category by ID
- **GET** `/api/categories/:id`
- **Description:** Get specific category with products
- **Response:**
```json
{
  "id": 1,
  "name": "Смартфони",
  "description": "Мобільні телефони та аксесуари",
  "slug": "smartphones",
  "products": [...],
  "productCount": 5
}
```

### Get Category by Slug
- **GET** `/api/categories/slug/:slug`
- **Description:** Get category by slug (URL-friendly name)
- **Example:** `/api/categories/slug/smartphones`

### Get Category Products
- **GET** `/api/categories/:id/products`
- **Description:** Get products in specific category with pagination
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `sort` (string): `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`
- **Example:** `/api/categories/1/products?page=1&limit=5&sort=price_asc`

### Create Category (Admin Only)
- **POST** `/api/categories`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
```json
{
  "name": "Нова категорія",
  "description": "Опис нової категорії"
}
```

### Update Category (Admin Only)
- **PUT** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
```json
{
  "name": "Оновлена назва",
  "description": "Оновлений опис"
}
```

### Delete Category (Admin Only)
- **DELETE** `/api/categories/:id`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Note:** Cannot delete category with existing products

---

## 🛍 Products

### Get All Products
- **GET** `/api/products`
- **Description:** Get all products with pagination and filtering
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `category` (string): filter by category slug
  - `search` (string): search in name and description
- **Examples:**
  - `/api/products?page=1&limit=5`
  - `/api/products?category=smartphones`
  - `/api/products?search=iPhone`
  - `/api/products?page=2&limit=10&category=laptops&search=MacBook`

- **Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Найновіший флагманський смартфон",
      "price": 42999,
      "stock": 25,
      "imageUrl": "https://example.com/iphone15pro.jpg",
      "isActive": true,
      "slug": "iphone-15-pro",
      "category": {
        "id": 1,
        "name": "Смартфони",
        "slug": "smartphones"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Product by ID
- **GET** `/api/products/:id`
- **Description:** Get specific product details
- **Response:**
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "description": "Найновіший флагманський смартфон від Apple",
  "price": 42999,
  "stock": 25,
  "imageUrl": "https://example.com/iphone15pro.jpg",
  "isActive": true,
  "slug": "iphone-15-pro",
  "category": {
    "id": 1,
    "name": "Смартфони",
    "slug": "smartphones"
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Product (Admin Only)
- **POST** `/api/products`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
```json
{
  "name": "Новий товар",
  "description": "Опис нового товару",
  "price": 1999.99,
  "stock": 50,
  "categoryId": 1,
  "imageUrl": "https://example.com/image.jpg"
}
```

### Update Product (Admin Only)
- **PUT** `/api/products/:id`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body:**
```json
{
  "name": "Оновлена назва",
  "description": "Оновлений опис",
  "price": 2499.99,
  "stock": 30,
  "isActive": true
}
```

### Delete Product (Admin Only)
- **DELETE** `/api/products/:id`
- **Headers:** `Authorization: Bearer <admin-token>`

---

## 🔒 Authentication & Authorization

### Headers
For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles
- **CUSTOMER** - Regular user (can view products, manage own profile)
- **ADMIN** - Administrator (can manage products, categories, view all data)

---

## 📝 Validation Rules

### User Registration
- **email**: Valid email format
- **password**: Minimum 6 characters, must contain uppercase, lowercase, and digit
- **firstName**: 2-50 characters
- **lastName**: 2-50 characters
- **phone**: Ukrainian format +380XXXXXXXXX (optional)

### Category
- **name**: 2-100 characters, required
- **description**: Up to 500 characters (optional)

### Product
- **name**: Required, non-empty
- **price**: Must be greater than 0
- **stock**: Non-negative integer
- **categoryId**: Valid category ID, required

---

## ❌ Error Responses

### Standard Error Format
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Validation Errors
```json
{
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

### Common HTTP Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

---

## 🧪 Test Users

After running the seed command, you can use these test accounts:

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** ADMIN

### Regular Users
- **Email:** `user1@example.com`
- **Password:** `123456`
- **Role:** CUSTOMER

- **Email:** `user2@example.com`
- **Password:** `123456`
- **Role:** CUSTOMER

---

## 🚀 Quick Start Examples

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 2. Get All Products
```bash
curl http://localhost:3000/api/products
```

### 3. Create Product (with admin token)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "price": 999.99,
    "stock": 10,
    "categoryId": 1
  }'
```
