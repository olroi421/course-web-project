const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Створюємо папку для завантажень якщо не існує
const uploadDir = process.env.UPLOAD_DIR || "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Налаштування сховища файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генеруємо унікальне ім'я файлу
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, sanitizedName + "-" + uniqueSuffix + ext);
  },
});

// Фільтр для типів файлів
const fileFilter = (req, file, cb) => {
  // Дозволені MIME типи
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Непідтримуваний тип файлу: ${file.mimetype}. Дозволені: зображення, PDF, Word, Excel`,
      ),
      false,
    );
  }
};

// Налаштування multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB за замовчуванням
    files: 10, // Максимум 10 файлів одночасно
  },
});

// Middleware для обробки помилок завантаження
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Файл занадто великий",
        maxSize: `${(parseInt(process.env.MAX_FILE_SIZE) / (1024 * 1024)).toFixed(2)} MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Забагато файлів",
        maxFiles: 10,
      });
    }
    return res.status(400).json({
      error: "Помилка завантаження файлу",
      details: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message || "Помилка завантаження файлу",
    });
  }

  next();
};

module.exports = {
  upload,
  handleUploadError,
};
