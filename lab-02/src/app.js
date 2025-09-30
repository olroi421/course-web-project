require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// Імпорт роутів
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// ============= MIDDLEWARE =============

// Helmet - захист HTTP заголовків
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", "data:", "https:"],
//       },
//     },
//   }),
// );

// CORS - дозвіл запитів з фронтенду
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting - обмеження кількості запитів
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Забагато запитів з цієї IP адреси, спробуйте пізніше",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Більш жорсткий rate limiting для аутентифікації
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Забагато спроб входу, спробуйте пізніше",
  },
});

// Парсинг JSON та URL-encoded даних
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Логування запитів в development режимі
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============= SWAGGER DOCUMENTATION =============

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpecs));

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpecs);
});

// ============= ROUTES =============

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/files", fileRoutes);

// Головна сторінка
app.get("/", (req, res) => {
  res.json({
    message: "Ласкаво просимо до E-Commerce API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      files: "/api/files",
    },
  });
});

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint не знайдено",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Файл занадто великий",
        maxSize: process.env.MAX_FILE_SIZE || "5MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Забагато файлів для завантаження",
      });
    }
    return res.status(400).json({
      error: "Помилка завантаження файлу",
      details: err.message,
    });
  }

  if (err.code && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Запис з такими даними вже існує",
        field: err.meta?.target,
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Запис не знайдено",
      });
    }
    return res.status(400).json({
      error: "Помилка бази даних",
      code: err.code,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Недійсний токен",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Токен прострочений",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Помилка валідації",
      details: err.message,
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Внутрішня помилка сервера",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ============= SERVER START =============

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🚀 E-Commerce API Server                    ║
║                                                ║
║   Environment: ${process.env.NODE_ENV || "development"}                      ║
║   Port: ${PORT}                                   ║
║                                                ║
║   📚 Documentation: http://localhost:${PORT}/api-docs  ║
║   ❤️  Health Check: http://localhost:${PORT}/health   ║
║                                                ║
╚════════════════════════════════════════════════╝
        `);
  });
}

module.exports = app;
