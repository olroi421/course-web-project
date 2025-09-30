const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Початок заповнення бази даних...");

  // Очищення існуючих даних
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.file.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ База даних очищена");

  // Створення користувачів
  const hashedPassword = await bcrypt.hash("Admin123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Адміністратор",
      role: "ADMIN",
    },
  });

  const moderator = await prisma.user.create({
    data: {
      email: "moderator@example.com",
      password: hashedPassword,
      name: "Модератор",
      role: "MODERATOR",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Іван Петренко",
      role: "USER",
    },
  });

  console.log("✅ Користувачі створені");

  // Створення категорій
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Електроніка",
        description: "Ноутбуки, смартфони, планшети та аксесуари",
      },
    }),
    prisma.category.create({
      data: {
        name: "Одяг",
        description: "Чоловічий та жіночий одяг",
      },
    }),
    prisma.category.create({
      data: {
        name: "Книги",
        description: "Художня література, навчальна література",
      },
    }),
    prisma.category.create({
      data: {
        name: "Спорт",
        description: "Спортивний інвентар та аксесуари",
      },
    }),
    prisma.category.create({
      data: {
        name: "Для дому",
        description: "Меблі, декор, посуд",
      },
    }),
  ]);

  console.log("✅ Категорії створені");

  // Створення продуктів
  const products = await Promise.all([
    // Електроніка
    prisma.product.create({
      data: {
        name: "Ноутбук ASUS VivoBook 15",
        description:
          "Потужний ноутбук для роботи та навчання з процесором Intel Core i5, 8GB RAM, 512GB SSD",
        price: 21999,
        stock: 15,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Смартфон Samsung Galaxy A54",
        description: "Сучасний смартфон з камерою 50MP, 128GB пам'яті",
        price: 12999,
        stock: 30,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Навушники Sony WH-1000XM5",
        description: "Бездротові навушники з активним шумозаглушенням",
        price: 8999,
        stock: 20,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Планшет iPad Air",
        description: "Легкий та потужний планшет для роботи та розваг",
        price: 18999,
        stock: 12,
        categoryId: categories[0].id,
      },
    }),
    // Одяг
    prisma.product.create({
      data: {
        name: "Чоловіча футболка Nike",
        description: "Комфортна спортивна футболка з бавовни",
        price: 799,
        stock: 50,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Жіноче плаття Zara",
        description: "Елегантне літнє плаття",
        price: 1299,
        stock: 25,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Джинси Levis 501",
        description: "Класичні чоловічі джинси",
        price: 2499,
        stock: 35,
        categoryId: categories[1].id,
      },
    }),
    // Книги
    prisma.product.create({
      data: {
        name: "Кобзар - Тарас Шевченко",
        description: "Класична збірка віршів українського поета",
        price: 299,
        stock: 100,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "JavaScript: The Good Parts",
        description: "Навчальна книга з програмування на JavaScript",
        price: 599,
        stock: 40,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Clean Code",
        description: "Посібник з написання чистого коду від Robert Martin",
        price: 799,
        stock: 30,
        categoryId: categories[2].id,
      },
    }),
    // Спорт
    prisma.product.create({
      data: {
        name: "Гантелі 2x5 кг",
        description: "Набір гантелей для домашніх тренувань",
        price: 899,
        stock: 35,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Йога мат",
        description: "Професійний килимок для йоги та фітнесу",
        price: 699,
        stock: 45,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "М'яч футбольний Adidas",
        description: "Професійний футбольний м'яч розмір 5",
        price: 1299,
        stock: 20,
        categoryId: categories[3].id,
      },
    }),
    // Для дому
    prisma.product.create({
      data: {
        name: "Настільна лампа IKEA",
        description: "Сучасна LED лампа для робочого столу",
        price: 499,
        stock: 60,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Набір посуду Luminarc",
        description: "Скляний набір посуду на 6 персон",
        price: 1499,
        stock: 0,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Подушка ортопедична",
        description: "Ортопедична подушка з ефектом пам'яті",
        price: 899,
        stock: 25,
        categoryId: categories[4].id,
      },
    }),
  ]);

  console.log("✅ Продукти створені");

  // Створення відгуків
  await Promise.all([
    prisma.review.create({
      data: {
        userId: user.id,
        productId: products[0].id,
        rating: 5,
        comment: "Чудовий ноутбук! Швидкий, надійний, рекомендую!",
      },
    }),
    prisma.review.create({
      data: {
        userId: user.id,
        productId: products[1].id,
        rating: 4,
        comment: "Гарний смартфон за свою ціну. Камера справді хороша.",
      },
    }),
    prisma.review.create({
      data: {
        userId: moderator.id,
        productId: products[2].id,
        rating: 5,
        comment: "Найкращі навушники які я мав. Шумозаглушення топ!",
      },
    }),
    prisma.review.create({
      data: {
        userId: admin.id,
        productId: products[7].id,
        rating: 5,
        comment: "Класика української літератури. Обов'язково до прочитання!",
      },
    }),
    prisma.review.create({
      data: {
        userId: user.id,
        productId: products[10].id,
        rating: 4,
        comment: "Гантелі якісні, зручні. Доставка швидка.",
      },
    }),
  ]);

  console.log("✅ Відгуки створені");

  // Створення замовлень
  await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: 22798,
      status: "DELIVERED",
      shippingAddress: "вул. Хрещатик 1, Київ, 01001",
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
          {
            productId: products[4].id,
            quantity: 1,
            price: products[4].price,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount: 13698,
      status: "PROCESSING",
      shippingAddress: "вул. Хрещатик 1, Київ, 01001",
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
          },
          {
            productId: products[11].id,
            quantity: 1,
            price: products[11].price,
          },
        ],
      },
    },
  });

  console.log("✅ Замовлення створені");

  // Товари в кошику
  await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: products[2].id,
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: products[8].id,
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: moderator.id,
        productId: products[3].id,
        quantity: 1,
      },
    }),
  ]);

  console.log("✅ Товари в кошику створені");
  console.log("\n🎉 База даних успішно заповнена!\n");
  console.log("📊 Створено:");
  console.log(`   - 3 користувачів`);
  console.log(`   - ${categories.length} категорій`);
  console.log(`   - ${products.length} продуктів`);
  console.log(`   - 5 відгуків`);
  console.log(`   - 2 замовлення`);
  console.log(`   - 3 товарів в кошику\n`);
  console.log("👤 Тестові акаунти:");
  console.log("   Admin: admin@example.com / Admin123456");
  console.log("   Moderator: moderator@example.com / Admin123456");
  console.log("   User: user@example.com / Admin123456\n");
}

main()
  .catch((e) => {
    console.error("❌ Помилка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
