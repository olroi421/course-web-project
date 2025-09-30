const express = require("express");
const {
  register,
  login,
  refreshToken,
  getCurrentUser,
  changePassword,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [USER, ADMIN, MODERATOR]
 *         avatar:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *               name:
 *                 type: string
 *                 example: Іван Петренко
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований
 *       400:
 *         description: Помилка валідації даних
 *       409:
 *         description: Користувач вже існує
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід користувача
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Успішний вхід
 *       401:
 *         description: Невірні дані для входу
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення access токену
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Токен успішно оновлено
 *       401:
 *         description: Недійсний refresh токен
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Отримання інформації про поточного користувача
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Інформація про користувача
 *       401:
 *         description: Необхідна аутентифікація
 */
router.get("/me", authenticate, getCurrentUser);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Зміна пароля користувача
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       401:
 *         description: Невірний поточний пароль
 */
router.post("/change-password", authenticate, changePassword);

module.exports = router;
