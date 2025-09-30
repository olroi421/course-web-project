const jwt = require("jsonwebtoken");

/**
 * Генерує access токен для користувача
 * @param {number} userId - ID користувача
 * @param {string} role - Роль користувача
 * @returns {string} JWT access токен
 */
function generateAccessToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

/**
 * Генерує refresh токен для користувача
 * @param {number} userId - ID користувача
 * @returns {string} JWT refresh токен
 */
function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
}

/**
 * Перевіряє та декодує access токен
 * @param {string} token - JWT токен
 * @returns {object} Декодовані дані токену
 * @throws {Error} Якщо токен недійсний
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("Недійсний токен доступу");
  }
}

/**
 * Перевіряє та декодує refresh токен
 * @param {string} token - JWT refresh токен
 * @returns {object} Декодовані дані токену
 * @throws {Error} Якщо токен недійсний
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error("Недійсний refresh токен");
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
