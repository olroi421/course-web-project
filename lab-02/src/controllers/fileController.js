const { PrismaClient } = require("@prisma/client");
const fs = require("fs").promises;
const path = require("path");

const prisma = new PrismaClient();

/**
 * Завантаження одного файлу
 */
async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Файл не надано",
      });
    }

    // Збереження інформації про файл в БД
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Файл успішно завантажено",
      file: {
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/files/${file.id}`,
        uploadedBy: file.user,
        createdAt: file.createdAt,
      },
    });
  } catch (error) {
    console.error("Помилка завантаження файлу:", error);

    // Видалення файлу якщо помилка при збереженні в БД
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      error: "Помилка сервера при завантаженні файлу",
    });
  }
}

/**
 * Завантаження декількох файлів
 */
async function uploadMultipleFiles(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "Файли не надано",
      });
    }

    // Збереження інформації про файли в БД
    const filesData = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedBy: req.user.userId,
    }));

    const files = await prisma.file.createMany({
      data: filesData,
    });

    // Отримання створених файлів з інформацією про користувача
    const uploadedFiles = await prisma.file.findMany({
      where: {
        uploadedBy: req.user.userId,
        filename: {
          in: req.files.map((f) => f.filename),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: `Успішно завантажено ${files.count} файл(ів)`,
      files: uploadedFiles.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/files/${file.id}`,
        createdAt: file.createdAt,
      })),
    });
  } catch (error) {
    console.error("Помилка завантаження файлів:", error);

    // Видалення файлів при помилці
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(console.error);
      }
    }

    res.status(500).json({
      error: "Помилка сервера при завантаженні файлів",
    });
  }
}

/**
 * Отримання файлу за ID
 */
async function getFile(req, res) {
  try {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        error: "Файл не знайдено",
      });
    }

    // Перевірка існування файлу на диску
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({
        error: "Файл не знайдено на сервері",
      });
    }

    // Відправка файлу
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error("Помилка отримання файлу:", error);
    res.status(500).json({
      error: "Помилка сервера при отриманні файлу",
    });
  }
}

/**
 * Отримання списку файлів користувача
 */
async function getUserFiles(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { uploadedBy: req.user.userId },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.file.count({
        where: { uploadedBy: req.user.userId },
      }),
    ]);

    res.json({
      data: files.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/files/${file.id}`,
        createdAt: file.createdAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Помилка отримання файлів:", error);
    res.status(500).json({
      error: "Помилка сервера",
    });
  }
}

/**
 * Видалення файлу
 */
async function deleteFile(req, res) {
  try {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        error: "Файл не знайдено",
      });
    }

    // Перевірка прав доступу
    if (file.uploadedBy !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Ви не маєте прав для видалення цього файлу",
      });
    }

    // Видалення файлу з диску
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error("Помилка видалення файлу з диску:", error);
    }

    // Видалення запису з БД
    await prisma.file.delete({
      where: { id: fileId },
    });

    res.json({
      message: "Файл успішно видалено",
    });
  } catch (error) {
    console.error("Помилка видалення файлу:", error);
    res.status(500).json({
      error: "Помилка сервера при видаленні файлу",
    });
  }
}

/**
 * Оновлення метаданих файлу
 */
async function updateFileMetadata(req, res) {
  try {
    const fileId = parseInt(req.params.id);
    const { originalName } = req.body;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        error: "Файл не знайдено",
      });
    }

    // Перевірка прав доступу
    if (file.uploadedBy !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Ви не маєте прав для редагування цього файлу",
      });
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { originalName: originalName || file.originalName },
    });

    res.json({
      message: "Метадані файлу оновлено",
      file: {
        id: updatedFile.id,
        originalName: updatedFile.originalName,
        url: `/api/files/${updatedFile.id}`,
      },
    });
  } catch (error) {
    console.error("Помилка оновлення файлу:", error);
    res.status(500).json({
      error: "Помилка сервера",
    });
  }
}

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  getFile,
  getUserFiles,
  deleteFile,
  updateFileMetadata,
};
