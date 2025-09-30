const express = require("express");
const {
  uploadFile,
  uploadMultipleFiles,
  getFile,
  getUserFiles,
  deleteFile,
  updateFileMetadata,
} = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

const router = express.Router();

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Завантаження одного файлу
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Файл успішно завантажено
 *       400:
 *         description: Файл не надано або невалідний
 *       401:
 *         description: Необхідна аутентифікація
 */
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  handleUploadError,
  uploadFile,
);

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: Завантаження декількох файлів
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Файли успішно завантажено
 *       400:
 *         description: Файли не надано або невалідні
 *       401:
 *         description: Необхідна аутентифікація
 */
router.post(
  "/upload-multiple",
  authenticate,
  upload.array("files", 10),
  handleUploadError,
  uploadMultipleFiles,
);

/**
 * @swagger
 * /api/files/my:
 *   get:
 *     summary: Отримання списку файлів поточного користувача
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Список файлів користувача
 *       401:
 *         description: Необхідна аутентифікація
 */
router.get("/my", authenticate, getUserFiles);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Отримання файлу за ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Файл успішно отримано
 *       404:
 *         description: Файл не знайдено
 */
router.get("/:id", getFile);

/**
 * @swagger
 * /api/files/{id}:
 *   put:
 *     summary: Оновлення метаданих файлу
 *     tags: [Files]
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
 *               originalName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Метадані оновлено
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Файл не знайдено
 */
router.put("/:id", authenticate, updateFileMetadata);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Видалення файлу
 *     tags: [Files]
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
 *         description: Файл успішно видалено
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Файл не знайдено
 */
router.delete("/:id", authenticate, deleteFile);

module.exports = router;
