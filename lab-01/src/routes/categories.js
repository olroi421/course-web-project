const express = require("express");
const { body } = require("express-validator");
const {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} = require("../controllers/categoryController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Валідація для створення/оновлення категорії
const categoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Публічні маршрути
router.get("/", getAllCategories);
router.get("/slug/:slug", getCategoryBySlug);
router.get("/:id/products", getCategoryProducts);
router.get("/:id", getCategoryById);

// Захищені маршрути (тільки для адміна)
router.post(
  "/",
  authenticateToken,
  requireRole("ADMIN"),
  categoryValidation,
  createCategory,
);
router.put(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  categoryValidation,
  updateCategory,
);
router.delete("/:id", authenticateToken, requireRole("ADMIN"), deleteCategory);

module.exports = router;
