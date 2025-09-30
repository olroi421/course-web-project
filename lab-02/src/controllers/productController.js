const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Отримання списку продуктів з пошуком, фільтрацією та пагінацією
 */
async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      inStock,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Побудова умов фільтрації
    const where = {};

    // Пошук за назвою або описом
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Фільтр за категорією
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Фільтр за ціною
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Фільтр за наявністю на складі
    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // Налаштування сортування
    const orderBy = {};
    orderBy[sortBy] = order.toLowerCase();

    // Паралельне виконання запитів для продуктів та підрахунку
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Додавання середнього рейтингу до кожного продукту
    const productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      const { reviews, ...productData } = product;

      return {
        ...productData,
        averageRating: parseFloat(avgRating.toFixed(2)),
        reviewCount: reviews.length,
      };
    });

    res.json({
      data: productsWithRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + products.length < total,
      },
      filters: {
        search,
        categoryId: categoryId ? parseInt(categoryId) : null,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        inStock: inStock === "true",
      },
    });
  } catch (error) {
    console.error("Помилка отримання продуктів:", error);
    res.status(500).json({
      error: "Помилка сервера при отриманні продуктів",
    });
  }
}

/**
 * Отримання одного продукту за ID
 */
async function getProductById(req, res) {
  try {
    const productId = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Продукт не знайдено",
      });
    }

    // Розрахунок середнього рейтингу
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
          product.reviews.length
        : 0;

    res.json({
      ...product,
      averageRating: parseFloat(avgRating.toFixed(2)),
      reviewCount: product.reviews.length,
    });
  } catch (error) {
    console.error("Помилка отримання продукту:", error);
    res.status(500).json({
      error: "Помилка сервера при отриманні продукту",
    });
  }
}

/**
 * Створення нового продукту (тільки для ADMIN/MODERATOR)
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, categoryId, image } = req.body;

    // Валідація обов'язкових полів
    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        error: "Назва, опис, ціна та категорія є обов'язковими",
      });
    }

    // Перевірка існування категорії
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        error: "Категорію не знайдено",
      });
    }

    // Створення продукту
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        categoryId: parseInt(categoryId),
        image: image || null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      message: "Продукт успішно створено",
      product,
    });
  } catch (error) {
    console.error("Помилка створення продукту:", error);
    res.status(500).json({
      error: "Помилка сервера при створенні продукту",
    });
  }
}

/**
 * Оновлення продукту (тільки для ADMIN/MODERATOR)
 */
async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { name, description, price, stock, categoryId, image } = req.body;

    // Перевірка існування продукту
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: "Продукт не знайдено",
      });
    }

    // Перевірка категорії якщо вона змінюється
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });

      if (!category) {
        return res.status(404).json({
          error: "Категорію не знайдено",
        });
      }
    }

    // Підготовка даних для оновлення
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (image !== undefined) updateData.image = image;

    // Оновлення продукту
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
      },
    });

    res.json({
      message: "Продукт успішно оновлено",
      product,
    });
  } catch (error) {
    console.error("Помилка оновлення продукту:", error);
    res.status(500).json({
      error: "Помилка сервера при оновленні продукту",
    });
  }
}

/**
 * Видалення продукту (тільки для ADMIN)
 */
async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);

    // Перевірка існування продукту
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        error: "Продукт не знайдено",
      });
    }

    // Видалення продукту
    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({
      message: "Продукт успішно видалено",
    });
  } catch (error) {
    console.error("Помилка видалення продукту:", error);

    // Перевірка на помилку через залежності
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Неможливо видалити продукт, оскільки він використовується в замовленнях",
      });
    }

    res.status(500).json({
      error: "Помилка сервера при видаленні продукту",
    });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
