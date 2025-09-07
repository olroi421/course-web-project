# How to run (example)


## Init

```bash
# Ініціалізуємо npm проєкт
npm init -y

# Встановлюємо основні залежності
npm install express prisma @prisma/client bcryptjs jsonwebtoken cors helmet dotenv express-validator

# Встановлюємо залежності для розробки
npm install -D nodemon prisma


mkdir -p src/{controllers,routes,middleware,utils} prisma reports

```




## `.env`

```bash
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=3000
NODE_ENV=development
```


## Docker PostgreSQL

```bash
docker-compose up -d
# або
docker compose up -d
```


## Run app

```bash
# Генерація Prisma клієнта
npx prisma generate

# Створення міграції бази даних
npx prisma migrate dev --name init

# Заповнення тестовими даними
npm run db:seed

# Запуск сервера в режимі розробки
npm run dev

# Відкриття Prisma Studio для перегляду БД
npm run db:studio
```



## View Database

```bash
npx prisma studio
```
