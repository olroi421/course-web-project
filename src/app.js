require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Імпортуємо маршрути
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");

// Middleware для обробки помилок
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Маршрути
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Базовий маршрут
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
    },
  });
});

// Обробка неіснуючих маршрутів (ВИПРАВЛЕНО)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Обробка помилок має бути в кінці
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}`);
  console.log(`📚 Endpoints: http://localhost:${PORT}/api`);
});

module.exports = app;
