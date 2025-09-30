const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: decimal
 *         stock:
 *           type: integer
 *         image:
 *           type: string
 *         categoryId:
 *           type: integer
 *         category:
 *           type: object
 *         averageRating:
 *           type: number
 *         reviewCount:
 *           type: integer
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Отримання списку продуктів з фільтрацією та пагінацією
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Пошук за назвою або описом
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, name]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Список продуктів
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Отримання продукту за ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Інформація про продукт
 *       404:
 *         description: Продукт не знайдено
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Створення нового продукту
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Продукт створено
 *       401:
 *         description: Необхідна аутентифікація
 *       403:
 *         description: Недостатньо прав
 */
router.post("/", authenticate, authorize("ADMIN", "MODERATOR"), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Оновлення продукту
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Продукт оновлено
 *       404:
 *         description: Продукт не знайдено
 */
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "MODERATOR"),
  updateProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Видалення продукту
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Продукт видалено
 *       404:
 *         description: Продукт не знайдено
 */
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProduct);

module.exports = router;
