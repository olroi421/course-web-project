# Інструкція по створенню E-Commerce API проєкту

## Передумови

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker з PostgreSQL контейнером
- Git

## Крок 1: Створення структури проєкту

```bash
# Створіть головну папку проєкту
mkdir ecommerce-api
cd ecommerce-api

# Створіть структуру папок
mkdir -p src/{config,controllers,middleware,routes,utils}
mkdir -p prisma tests reports uploads

# Створіть порожній .gitkeep для uploads
touch uploads/.gitkeep

# Ініціалізуйте git репозиторій
git init
```

## Крок 2: Створення файлів конфігурації

Створіть всі файли з кодом який я надав вище:

1. `package.json`
2. `.env.example`
3. `.gitignore`
4. `jest.config.js`

Після створення `package.json` виконайте:

```bash
npm install
```

## Крок 3: Налаштування PostgreSQL в Docker



### Якщо використовуєте docker-compose:

Створіть файл `docker-compose.yml`


Запустіть контейнер:

```bash
# Зупинити та видалити старі контейнери з даними
docker-compose down -v

# Запустити новий контейнер
docker-compose up -d

# Перевірити статус
docker-compose ps
```


## Крок 4: Налаштування .env файлу

Створіть файл `.env` на основі `.env.example`:

```bash
cp .env.example .env
```

Відредагуйте `.env` з вашими даними.

Користувача і пароль БД можна знайти в `docker-compose.yml`.

```yaml
environment:
      POSTGRES_USER: ecommerce_user
      POSTGRES_PASSWORD: ecommerce_password
```

## Крок 5: Створення файлів проєкту

Створіть всі файли з кодом у відповідних папках:

### Prisma
- `prisma/schema.prisma`
- `prisma/seed.js`

### Utils
- `src/utils/jwt.js`
- `src/utils/password.js`

### Middleware
- `src/middleware/auth.js`
- `src/middleware/authorize.js`
- `src/middleware/upload.js`

### Controllers
- `src/controllers/authController.js`
- `src/controllers/productController.js`
- `src/controllers/fileController.js`

### Routes
- `src/routes/authRoutes.js`
- `src/routes/productRoutes.js`
- `src/routes/fileRoutes.js`

### Config
- `src/config/swagger.js`
- `src/app.js`

## Крок 6: Prisma Setup

```bash
# Генерація Prisma Client
npx prisma generate

# Створення міграцій
npx prisma migrate dev --name init

# Якщо запитає чи скинути БД - відповідайте Yes
```

**Якщо виникають проблеми з міграцією:**

```bash
# Видалення папки міграцій
rm -rf prisma/migrations

# Примусове скидання БД через Prisma
npx prisma db push --force-reset --skip-generate

# Генерація Client
npx prisma generate

# Нова міграція
npx prisma migrate dev --name init
```

## Крок 7: Заповнення БД тестовими даними

```bash
npm run prisma:seed
```

Після успішного виконання ви побачите:

```
🎉 База даних успішно заповнена!

📊 Створено:
   - 3 користувачів
   - 5 категорій
   - 16 продуктів
   - 5 відгуків
   - 2 замовлення
   - 3 товарів в кошику

👤 Тестові акаунти:
   Admin: admin@example.com / Admin123456
   Moderator: moderator@example.com / Admin123456
   User: user@example.com / Admin123456
```

## Крок 8: Запуск проєкту

```bash
# Development режим з автоперезавантаженням
npm run dev

# Або production режим
npm start
```

При успішному запуску ви побачите:

```
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 E-Commerce API Server                    ║
║                                                ║
║   Environment: development                     ║
║   Port: 3000                                   ║
║                                                ║
║   📚 Documentation: http://localhost:3000/api-docs  ║
║   ❤️  Health Check: http://localhost:3000/health   ║
║                                                ║
╚════════════════════════════════════════════════╝
```

## Крок 9: Перевірка роботи

### Через браузер:

1. Відкрийте http://localhost:3000 - головна сторінка
2. Відкрийте http://localhost:3000/api-docs - Swagger документація
3. Відкрийте http://localhost:3000/health - health check

### Через Swagger UI:

1. Відкрийте http://localhost:3000/api-docs
2. Знайдіть POST `/api/auth/login`
3. Натисніть "Try it out"
4. Введіть:
   ```json
   {
     "email": "admin@example.com",
     "password": "Admin123456"
   }
   ```
5. Скопіюйте `accessToken` з відповіді
6. Натисніть кнопку "Authorize" вгорі
7. Введіть: `Bearer <ваш_токен>`
8. Тепер можете тестувати захищені endpoints


## Крок 10: Prisma Studio

Для візуального перегляду бази даних:

```bash
npm run prisma:studio
```

Відкриється браузер з GUI для роботи з БД на http://localhost:5555

## Troubleshooting

### Помилка підключення до БД

```bash
# Перевірте чи працює контейнер
docker ps

# Перевірте логи контейнера
docker logs <container_name>

# Перезапустіть контейнер
docker restart <container_name>

# Або через docker-compose
docker-compose restart
```

### Помилка "таблиця не існує"

```bash
# Повне скидання
rm -rf prisma/migrations
docker exec -it <container_name> psql -U postgres -c "DROP DATABASE ecommerce_db;"
docker exec -it <container_name> psql -U postgres -c "CREATE DATABASE ecommerce_db;"

# Нові міграції
npx prisma migrate dev --name init
npm run prisma:seed
```

### Помилка "PORT вже використовується"

```bash
# Знайдіть процес на порту 3000
lsof -ti:3000

# Вбийте процес
kill -9 <PID>

# Або змініть PORT в .env
PORT=3001
```


## Корисні команди

```bash
# Перегляд логів у development
npm run dev

# Запуск тестів
npm test

# Prisma Studio
npm run prisma:studio

# Нова міграція після зміни schema
npx prisma migrate dev --name your_migration_name

# Скидання БД
npx prisma migrate reset

# Seed знову
npm run prisma:seed

# Перегляд структури БД
npx prisma db pull
```


## Контрольний список

- [ ] Створена структура папок
- [ ] Встановлені всі залежності (`npm install`)
- [ ] Створений `.env` файл з правильними даними
- [ ] PostgreSQL контейнер працює
- [ ] База даних створена та очищена
- [ ] Виконані Prisma міграції
- [ ] Виконаний seed
- [ ] Сервер успішно запускається
- [ ] Swagger доступний на /api-docs
- [ ] Успішний логін через Swagger
- [ ] Всі endpoints працюють
- [ ] Файли завантажуються
- [ ] Тести проходять
