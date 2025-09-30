const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API Documentation",
      version: "1.0.0",
      description:
        "Документація API для інтернет-магазину з аутентифікацією, управлінням продуктами та файловим сервісом",
      contact: {
        name: "API Support",
        email: "support@ecommerce.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Введіть JWT токен, отриманий при вході або реєстрації",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Повідомлення про помилку",
            },
            details: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Додаткова інформація про помилку",
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              description: "Поточна сторінка",
            },
            limit: {
              type: "integer",
              description: "Кількість елементів на сторінці",
            },
            total: {
              type: "integer",
              description: "Загальна кількість елементів",
            },
            totalPages: {
              type: "integer",
              description: "Загальна кількість сторінок",
            },
            hasMore: {
              type: "boolean",
              description: "Чи є ще елементи",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Операції аутентифікації та управління користувачами",
      },
      {
        name: "Products",
        description: "Управління продуктами інтернет-магазину",
      },
      {
        name: "Files",
        description: "Завантаження та управління файлами",
      },
      {
        name: "Categories",
        description: "Управління категоріями продуктів",
      },
      {
        name: "Orders",
        description: "Управління замовленнями",
      },
      {
        name: "Cart",
        description: "Управління кошиком покупок",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
