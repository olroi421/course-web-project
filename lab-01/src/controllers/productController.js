const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Отримати всі продукти
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const where = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримати продукт за ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Створити продукт (тільки для адміна)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    // Генеруємо slug з назви
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        imageUrl,
        slug,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Product with this name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Оновити продукт
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price, stock, categoryId, imageUrl, isActive } =
      req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true },
    });

    res.json(product);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Видалити продукт
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
