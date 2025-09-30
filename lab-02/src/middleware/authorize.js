/**
 * Middleware для перевірки ролей користувача (Role-Based Access Control)
 * @param {...string} allowedRoles - Список дозволених ролей
 * @returns {Function} Express middleware функція
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Необхідна аутентифікація",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Недостатньо прав для виконання цієї операції",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
}

/**
 * Middleware для перевірки, чи користувач є власником ресурсу або адміністратором
 * @param {Function} getUserIdFromResource - Функція для отримання userId з ресурсу
 */
function authorizeOwnerOrAdmin(getUserIdFromResource) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Необхідна аутентифікація",
        });
      }

      // Адміністратори мають доступ до всього
      if (req.user.role === "ADMIN") {
        return next();
      }

      const resourceUserId = await getUserIdFromResource(req);

      if (resourceUserId !== req.user.userId) {
        return res.status(403).json({
          error: "Ви можете змінювати лише свої власні ресурси",
        });
      }

      next();
    } catch (error) {
      console.error("Помилка авторизації власника:", error);
      res.status(500).json({
        error: "Помилка перевірки прав доступу",
      });
    }
  };
}

module.exports = {
  authorize,
  authorizeOwnerOrAdmin,
};
