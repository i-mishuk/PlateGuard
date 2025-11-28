import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Vegetables' },
      update: {},
      create: {
        name: 'Vegetables',
        description: 'Fresh vegetables and produce',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Meat' },
      update: {},
      create: {
        name: 'Meat',
        description: 'Fresh and frozen meat products',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Dairy' },
      update: {},
      create: {
        name: 'Dairy',
        description: 'Milk, cheese, and other dairy products',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Grains' },
      update: {},
      create: {
        name: 'Grains',
        description: 'Rice, wheat, and other grains',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Beverages' },
      update: {},
      create: {
        name: 'Beverages',
        description: 'Soft drinks, juices, and other beverages',
      },
    }),
  ])

  // Create sample inventory items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: 'Tomatoes',
        description: 'Fresh red tomatoes',
        quantity: 25,
        unit: 'kg',
        price: 50,
        expiryDate: new Date('2024-12-25'),
        categoryId: categories[0].id, // Vegetables
        userId: defaultUser.id,
        status: 'AVAILABLE',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Chicken Breast',
        description: 'Fresh chicken breast',
        quantity: 15,
        unit: 'kg',
        price: 280,
        expiryDate: new Date('2024-12-20'),
        categoryId: categories[1].id, // Meat
        userId: defaultUser.id,
        status: 'AVAILABLE',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Rice',
        description: 'Basmati rice',
        quantity: 2,
        unit: 'kg',
        price: 120,
        expiryDate: new Date('2025-02-15'),
        categoryId: categories[3].id, // Grains
        userId: defaultUser.id,
        status: 'LOW_STOCK',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: 'Milk',
        description: 'Fresh cow milk',
        quantity: 8,
        unit: 'liters',
        price: 65,
        expiryDate: new Date('2024-12-18'),
        categoryId: categories[2].id, // Dairy
        userId: defaultUser.id,
        status: 'AVAILABLE',
      },
    }),
  ])

  // Create sample waste records
  await Promise.all([
    prisma.wasteRecord.create({
      data: {
        itemId: inventoryItems[0].id,
        userId: defaultUser.id,
        quantity: 5,
        reason: 'EXPIRED',
        cost: 250,
        notes: 'Tomatoes expired due to poor storage',
      },
    }),
    prisma.wasteRecord.create({
      data: {
        itemId: inventoryItems[1].id,
        userId: defaultUser.id,
        quantity: 10,
        reason: 'DAMAGED',
        cost: 180,
        notes: 'Bread got damaged during delivery',
      },
    }),
    prisma.wasteRecord.create({
      data: {
        itemId: inventoryItems[2].id,
        userId: defaultUser.id,
        quantity: 3,
        reason: 'OVERSTOCK',
        cost: 450,
        notes: 'Ordered too much chicken',
      },
    }),
  ])

  // Create additional users
  await Promise.all([
    prisma.user.create({
      data: {
        email: 'manager@restaurant.com',
        name: 'Jane Smith',
        role: 'MANAGER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@restaurant.com',
        name: 'Mike Johnson',
        role: 'USER',
      },
    }),
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })