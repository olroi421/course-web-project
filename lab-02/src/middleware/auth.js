const { verifyAccessToken } = require("../utils/jwt");

/**
 * Middleware для перевірки аутентифікації користувача
 * Витягує JWT токен з заголовку Authorization та верифікує його
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Токен аутентифікації відсутній",
      });
    }

    // Витягуємо токен після "Bearer "
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Додаємо інформацію про користувача в об'єкт запиту
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Недійсний або прострочений токен",
    });
  }
}

/**
 * Опціональна аутентифікація - не вимагає токен, але якщо він є, верифікує його
 */
function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ігноруємо помилки валідації токену для опціональної аутентифікації
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate,
};
