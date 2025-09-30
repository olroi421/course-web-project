const express = require("express");
const { body } = require("express-validator");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Валідація для створення/оновлення продукту
const productValidation = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be non-negative integer"),
  body("categoryId")
    .isInt({ gt: 0 })
    .withMessage("Valid category ID is required"),
];

// Публічні маршрути
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Захищені маршрути (тільки для адміна)
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  productValidation,
  createProduct,
);
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  productValidation,
  updateProduct,
);
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteProduct);

module.exports = router;
