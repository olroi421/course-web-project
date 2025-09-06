# Інтернет-магазин Backend API

Серверна частина інтернет-магазину, розроблена з використанням Node.js, Express.js та PostgreSQL.

## 🚀 Технології

- **Node.js** - серверне середовище JavaScript
- **Express.js** - веб-фреймворк
- **PostgreSQL** - реляційна база даних
- **Prisma** - ORM для роботи з базою даних
- **JWT** - автентифікація та авторизація
- **bcryptjs** - хешування паролів
- **express-validator** - валідація вхідних даних

## 📋 Функціональність

- ✅ Аутентифікація та авторизація користувачів
- ✅ Управління категоріями товарів
- ✅ CRUD операції з товарами
- ✅ Система ролей (користувач/адміністратор)
- ✅ Валідація вхідних даних
- ✅ Обробка помилок
- ✅ RESTful API

## 🗂 Структура проєкту

```
ecommerce-backend/
├── src/
│   ├── controllers/          # Контролери
│   ├── routes/              # Маршрути API
│   ├── middleware/          # Проміжні обробники
│   ├── utils/               # Допоміжні функції
│   └── app.js              # Головний файл додатку
├── prisma/
│   ├── schema.prisma       # Схема бази даних
│   └── seed.js             # Файл для заповнення тестовими даними
├── reports/                # Звіти лабораторних робіт
└── .env                    # Змінні середовища
```

## 🛠 Встановлення та запуск

### Вимоги
- Node.js (версія 18+)
- npm або yarn
- PostgreSQL (версія 12+)

### 1. Клонування репозиторію
```bash
git clone <your-repo-url>
cd ecommerce-backend
```

### 2. Встановлення залежностей
```bash
npm install
```

### 3. Налаштування бази даних
Створіть файл `.env` в корені проєкту:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

### 4. Створення бази даних та міграцій
```bash
# Генерація Prisma клієнта
npx prisma generate

# Створення та застосування міграцій
npx prisma migrate dev --name init

# Заповнення бази тестовими даними
npm run db:seed
```

### 5. Запуск сервера
```bash
# Розробка
npm run dev

# Продакшн
npm start
```

Сервер буде доступний за адресою: `http://localhost:3000`

## 📚 API Endpoints

### Аутентифікація
- `POST /api/auth/register` - Реєстрація користувача
- `POST /api/auth/login` - Вхід користувача
- `GET /api/auth/profile` - Отримати профіль (потребує авторизації)
- `PUT /api/auth/profile` - Оновити профіль (потребує авторизації)
- `PUT /api/auth/change-password` - Змінити пароль (потребує авторизації)

### Категорії
- `GET /api/categories` - Отримати всі категорії
- `GET /api/categories/:id` - Отримати категорію за ID
- `GET /api/categories/slug/:slug` - Отримати категорію за slug
- `POST /api/categories` - Створити категорію (тільки адмін)
- `PUT /api/categories/:id` - Оновити категорію (тільки адмін)
- `DELETE /api/categories/:id` - Видалити категорію (тільки адмін)

### Товари
- `GET /api/products` - Отримати всі товари (з пагінацією та фільтрацією)
- `GET /api/products/:id` - Отримати товар за ID
- `POST /api/products` - Створити товар (тільки адмін)
- `PUT /api/products/:id` - Оновити товар (тільки адмін)
- `DELETE /api/products/:id` - Видалити товар (тільки адмін)

## 🔐 Аутентифікація

API використовує JWT токени для аутентифікації. Після успішного входу отримайте токен та додавайте його в заголовок запитів:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 Тестові користувачі

Після запуску seed файлу будуть створені тестові користувачі:

**Адміністратор:**
- Email: `admin@example.com`
- Пароль: `admin123`

**Користувач 1:**
- Email: `user1@example.com`
- Пароль: `123456`

**Користувач 2:**
- Email: `user2@example.com`
- Пароль: `123456`

## 📝 Приклади запитів

### Реєстрація користувача
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123",
  "firstName": "Іван",
  "lastName": "Іваненко",
  "phone": "+380501234567"
}
```

### Вхід користувача
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user1@example.com",
  "password": "123456"
}
```

### Створення товару (тільки адмін)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Новий товар",
  "description": "Опис товару",
  "price": 1999.99,
  "stock": 10,
  "categoryId": 1,
  "imageUrl": "https://example.com/image.jpg"
}
```

### Отримання товарів з фільтрацією
```http
GET /api/products?page=1&limit=10&category=smartphones&search=iPhone
```

## 🛠 Доступні npm scripts

```bash
npm start          # Запуск продакшн сервера
npm run dev        # Запуск в режимі розробки (з nodemon)
npm run db:migrate # Застосування міграцій БД
npm run db:generate # Генерація Prisma клієнта
npm run db:seed    # Заповнення БД тестовими даними
npm run db:studio  # Відкриття Prisma Studio
```

## 🗄 Схема бази даних

### Основні таблиці:
- **users** - користувачі системи
- **categories** - категорії товарів
- **products** - товари
- **cart_items** - елементи кошика
- **orders** - замовлення
- **order_items** - товари в замовленні

### Зв'язки:
- Користувач може мати багато замовлень (1:N)
- Користувач може мати багато елементів кошика (1:N)
- Категорія може мати багато товарів (1:N)
- Замовлення може мати багато товарів (N:M через order_items)

## 🔧 Налаштування розробки

### Prisma Studio
Для зручного перегляду та редагування даних:
```bash
npm run db:studio
```

### Міграції
При зміні схеми:
```bash
npx prisma migrate dev --name <migration_name>
```

### Скидання БД
```bash
npx prisma migrate reset
```

## 🚨 Безпека

- Паролі хешуються за допомогою bcryptjs (12 rounds)
- JWT токени мають термін дії 24 години
- Валідація всіх вхідних даних
- CORS налаштований для безпеки
- Helmet.js для додаткової безпеки заголовків

## 📊 Валідація

### Пароль повинен містити:
- Мінімум 6 символів
- Принаймні одну малу літеру
- Принаймні одну велику літеру
- Принаймні одну цифру

### Email
- Повинен бути валідним email адресом

### Телефон
- Формат: +380XXXXXXXXX

## 🔍 Обробка помилок

API повертає структуровані помилки з відповідними HTTP кодами:

```json
{
  "error": "Validation error",
  "message": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

## 📈 Пагінація

Endpoints що повертають списки підтримують пагінацію:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 🎯 Статуси замовлень

- `PENDING` - В очікуванні
- `CONFIRMED` - Підтверджено
- `SHIPPED` - Відправлено
- `DELIVERED` - Доставлено
- `CANCELLED` - Скасовано
