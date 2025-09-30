const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Отримати всі категорії
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const categoriesWithCount = categories.map((category) => ({
      ...category,
      productCount: category._count.products,
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Отримати категорію за ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          take: 10, // Обмежуємо кількість продуктів
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryWithCount = {
      ...category,
      productCount: category._count.products,
    };

    res.json(categoryWithCount);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Отримати категорію за slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryWithCount = {
      ...category,
      productCount: category._count.products,
    };

    res.json(categoryWithCount);
  } catch (error) {
    console.error("Get category by slug error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Створити категорію (тільки для адміна)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    // Генеруємо slug з назви
    const slug = name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/g, "") // Видаляємо спеціальні символи
      .replace(/\s+/g, "-") // Замінюємо пробіли на дефіси
      .trim();

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === "P2002") {
      if (error.meta?.target?.includes("name")) {
        return res
          .status(400)
          .json({ error: "Category with this name already exists" });
      }
      if (error.meta?.target?.includes("slug")) {
        return res
          .status(400)
          .json({ error: "Category with this slug already exists" });
      }
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// Оновити категорію
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      // Якщо змінюється назва, то оновлюємо і slug
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .trim();
    }
    if (description !== undefined) updateData.description = description;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const categoryWithCount = {
      ...category,
      productCount: category._count.products,
    };

    res.json({
      message: "Category updated successfully",
      category: categoryWithCount,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    if (error.code === "P2002") {
      if (error.meta?.target?.includes("name")) {
        return res
          .status(400)
          .json({ error: "Category with this name already exists" });
      }
      if (error.meta?.target?.includes("slug")) {
        return res
          .status(400)
          .json({ error: "Category with this slug already exists" });
      }
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// Видалити категорію
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Перевіряємо чи є продукти в цій категорії
    const productsCount = await prisma.product.count({
      where: { categoryId: parseInt(id) },
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: "Cannot delete category with existing products",
        message: `This category contains ${productsCount} products. Please move or delete them first.`,
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// Отримати продукти категорії з пагінацією
const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Перевіряємо чи є id числом
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const { page = 1, limit = 10, sort = "newest" } = req.query;
    const skip = (page - 1) * parseInt(limit);

    // Визначаємо сортування
    let orderBy = { createdAt: "desc" }; // за замовчуванням новіші спочатку

    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Перевіряємо чи існує категорія
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: parseInt(id),
        isActive: true,
      },
      include: {
        category: true,
      },
      skip,
      take: parseInt(limit),
      orderBy,
    });

    const total = await prisma.product.count({
      where: {
        categoryId: parseInt(id),
        isActive: true,
      },
    });

    res.json({
      category,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get category products error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
};
