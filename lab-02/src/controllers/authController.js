const { PrismaClient } = require("@prisma/client");
const {
  hashPassword,
  comparePassword,
  validatePassword,
} = require("../utils/password");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const prisma = new PrismaClient();

/**
 * Реєстрація нового користувача
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Валідація обов'язкових полів
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, пароль та ім'я є обов'язковими полями",
      });
    }

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Невірний формат email",
      });
    }

    // Валідація пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Пароль не відповідає вимогам безпеки",
        details: passwordValidation.errors,
      });
    }

    // Перевірка чи існує користувач
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Користувач з таким email вже існує",
      });
    }

    // Хешування пароля
    const hashedPassword = await hashPassword(password);

    // Створення користувача
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Генерація токенів
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: "Користувача успішно зареєстровано",
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Помилка реєстрації:", error);
    res.status(500).json({
      error: "Помилка сервера при реєстрації користувача",
    });
  }
}

/**
 * Вхід користувача
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Валідація обов'язкових полів
    if (!email || !password) {
      return res.status(400).json({
        error: "Email та пароль є обов'язковими",
      });
    }

    // Пошук користувача
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        error: "Невірний email або пароль",
      });
    }

    // Перевірка пароля
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Невірний email або пароль",
      });
    }

    // Генерація токенів
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Видалення пароля з відповіді
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Успішний вхід у систему",
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Помилка входу:", error);
    res.status(500).json({
      error: "Помилка сервера при вході в систему",
    });
  }
}

/**
 * Оновлення токенів доступу
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh токен відсутній",
      });
    }

    // Верифікація refresh токену
    const decoded = verifyRefreshToken(refreshToken);

    // Перевірка існування користувача
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Користувача не знайдено",
      });
    }

    // Генерація нових токенів
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      message: "Токени успішно оновлено",
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Помилка оновлення токену:", error);
    res.status(401).json({
      error: "Недійсний refresh токен",
    });
  }
}

/**
 * Отримання інформації про поточного користувача
 */
async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Користувача не знайдено",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Помилка отримання користувача:", error);
    res.status(500).json({
      error: "Помилка сервера",
    });
  }
}

/**
 * Зміна пароля користувача
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Поточний та новий пароль є обов'язковими",
      });
    }

    // Валідація нового пароля
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: "Новий пароль не відповідає вимогам безпеки",
        details: passwordValidation.errors,
      });
    }

    // Отримання користувача
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    // Перевірка поточного пароля
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Невірний поточний пароль",
      });
    }

    // Хешування нового пароля
    const hashedPassword = await hashPassword(newPassword);

    // Оновлення пароля
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Пароль успішно змінено",
    });
  } catch (error) {
    console.error("Помилка зміни пароля:", error);
    res.status(500).json({
      error: "Помилка сервера при зміні пароля",
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
  changePassword,
};
