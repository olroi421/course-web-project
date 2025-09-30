const bcrypt = require("bcrypt");

/**
 * Хешує пароль з використанням bcrypt
 * @param {string} password - Пароль у відкритому вигляді
 * @returns {Promise<string>} Хешований пароль
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Порівнює пароль з хешем
 * @param {string} password - Пароль у відкритому вигляді
 * @param {string} hashedPassword - Хешований пароль
 * @returns {Promise<boolean>} true якщо паролі співпадають
 */
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Валідує складність пароля
 * @param {string} password - Пароль для перевірки
 * @returns {object} Результат валідації
 */
function validatePassword(password) {
  const minLength = 8;
  const errors = [];

  if (!password || password.length < minLength) {
    errors.push(`Пароль має містити мінімум ${minLength} символів`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль має містити хоча б одну велику літеру");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Пароль має містити хоча б одну малу літеру");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Пароль має містити хоча б одну цифру");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
};
