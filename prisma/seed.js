const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Очищаємо дані (якщо потрібно)
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned existing data");

  // Створюємо категорії
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Смартфони",
        description: "Мобільні телефони та аксесуари",
        slug: "smartphones",
      },
    }),
    prisma.category.create({
      data: {
        name: "Ноутбуки",
        description: "Портативні комп'ютери та аксесуари",
        slug: "laptops",
      },
    }),
    prisma.category.create({
      data: {
        name: "Аксесуари",
        description: "Різноманітні аксесуари для гаджетів",
        slug: "accessories",
      },
    }),
    prisma.category.create({
      data: {
        name: "Навушники",
        description: "Навушники та аудіо пристрої",
        slug: "headphones",
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Створюємо користувачів
  const hashedPassword = await bcrypt.hash("123456", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@example.com",
        password: adminPassword,
        firstName: "Адмін",
        lastName: "Системи",
        phone: "+380123456789",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        email: "user1@example.com",
        password: hashedPassword,
        firstName: "Іван",
        lastName: "Петренко",
        phone: "+380987654321",
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        email: "user2@example.com",
        password: hashedPassword,
        firstName: "Марія",
        lastName: "Коваленко",
        phone: "+380567891234",
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);
  console.log("📝 Admin credentials: admin@example.com / admin123");
  console.log("📝 User credentials: user1@example.com / 123456");

  // Створюємо продукти
  const products = await Promise.all([
    // Смартфони
    prisma.product.create({
      data: {
        name: "iPhone 15 Pro",
        description:
          "Найновіший флагманський смартфон від Apple з процесором A17 Pro",
        price: 42999,
        stock: 25,
        categoryId: categories[0].id,
        slug: "iphone-15-pro",
        imageUrl: "https://example.com/iphone15pro.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Samsung Galaxy S24 Ultra",
        description: "Потужний Android смартфон з S Pen та відмінною камерою",
        price: 39999,
        stock: 18,
        categoryId: categories[0].id,
        slug: "samsung-galaxy-s24-ultra",
        imageUrl: "https://example.com/galaxys24ultra.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Google Pixel 8",
        description:
          "Смартфон з чистим Android та найкращими фото можливостями",
        price: 28999,
        stock: 32,
        categoryId: categories[0].id,
        slug: "google-pixel-8",
        imageUrl: "https://example.com/pixel8.jpg",
      },
    }),

    // Ноутбуки
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        description:
          "Професійний ноутбук з процесором M3 Pro для творчих завдань",
        price: 89999,
        stock: 12,
        categoryId: categories[1].id,
        slug: "macbook-pro-16",
        imageUrl: "https://example.com/macbookpro16.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Dell XPS 13",
        description: "Компактний та потужний ноутбук для бізнесу та навчання",
        price: 45999,
        stock: 20,
        categoryId: categories[1].id,
        slug: "dell-xps-13",
        imageUrl: "https://example.com/dellxps13.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "ASUS ROG Strix G15",
        description:
          "Ігровий ноутбук з високопродуктивною відеокартою RTX 4060",
        price: 52999,
        stock: 15,
        categoryId: categories[1].id,
        slug: "asus-rog-strix-g15",
        imageUrl: "https://example.com/asusrog.jpg",
      },
    }),

    // Аксесуари
    prisma.product.create({
      data: {
        name: "Apple MagSafe Charger",
        description:
          "Бездротовий зарядний пристрій для iPhone з магнітним кріпленням",
        price: 1599,
        stock: 50,
        categoryId: categories[2].id,
        slug: "apple-magsafe-charger",
        imageUrl: "https://example.com/magsafe.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Анкер PowerBank 10000mAh",
        description: "Портативний акумулятор з швидкою зарядкою USB-C",
        price: 1299,
        stock: 75,
        categoryId: categories[2].id,
        slug: "anker-powerbank-10000",
        imageUrl: "https://example.com/powerbank.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Logitech MX Master 3",
        description: "Ергономічна бездротова миша для професіоналів",
        price: 3299,
        stock: 40,
        categoryId: categories[2].id,
        slug: "logitech-mx-master-3",
        imageUrl: "https://example.com/mxmaster3.jpg",
      },
    }),

    // Навушники
    prisma.product.create({
      data: {
        name: "Apple AirPods Pro 2",
        description: "Бездротові навушники з активним шумопоглинанням",
        price: 8999,
        stock: 30,
        categoryId: categories[3].id,
        slug: "airpods-pro-2",
        imageUrl: "https://example.com/airpodspro2.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Sony WH-1000XM5",
        description: "Повнорозмірні навушники з найкращим шумопоглинанням",
        price: 12999,
        stock: 22,
        categoryId: categories[3].id,
        slug: "sony-wh-1000xm5",
        imageUrl: "https://example.com/sonywh1000xm5.jpg",
      },
    }),
    prisma.product.create({
      data: {
        name: "Bose QuietComfort Earbuds",
        description:
          "Компактні навушники з відмінним звуком та шумопоглинанням",
        price: 9999,
        stock: 28,
        categoryId: categories[3].id,
        slug: "bose-quietcomfort-earbuds",
        imageUrl: "https://example.com/boseqc.jpg",
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Створюємо тестові елементи кошика для користувачів
  const cartItems = await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: users[1].id, // user1@example.com
        productId: products[0].id, // iPhone 15 Pro
        quantity: 1,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[1].id,
        productId: products[6].id, // Apple MagSafe Charger
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: users[2].id, // user2@example.com
        productId: products[3].id, // MacBook Pro 16"
        quantity: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${cartItems.length} cart items`);

  // Створюємо тестове замовлення
  const order = await prisma.order.create({
    data: {
      userId: users[1].id,
      totalAmount: 44598, // iPhone 15 Pro + 2x MagSafe Charger
      status: "CONFIRMED",
      shippingAddress: "вул. Хрещатик 1, Київ, 01001",
      items: {
        create: [
          {
            productId: products[0].id, // iPhone 15 Pro
            quantity: 1,
            price: 42999,
          },
          {
            productId: products[6].id, // Apple MagSafe Charger
            quantity: 1,
            price: 1599,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log("✅ Created test order");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Cart items: ${cartItems.length}`);
  console.log(`- Orders: 1`);

  console.log("\n🔑 Login credentials:");
  console.log("Admin: admin@example.com / admin123");
  console.log("User 1: user1@example.com / 123456");
  console.log("User 2: user2@example.com / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
