import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Create admin user
    const adminEmail = 'admin@demo.plateguard.com'
    const adminPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const adminUser = await db.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    // Create manager user
    const managerEmail = 'manager@demo.plateguard.com'
    const managerPassword = 'manager123'
    const hashedManagerPassword = await bcrypt.hash(managerPassword, 12)

    const managerUser = await db.user.create({
      data: {
        name: 'Restaurant Manager',
        email: managerEmail,
        password: hashedManagerPassword,
        role: 'MANAGER'
      }
    })

    // Create staff user
    const staffEmail = 'staff@demo.plateguard.com'
    const staffPassword = 'staff123'
    const hashedStaffPassword = await bcrypt.hash(staffPassword, 12)

    const staffUser = await db.user.create({
      data: {
        name: 'Kitchen Staff',
        email: staffEmail,
        password: hashedStaffPassword,
        role: 'USER'
      }
    })

    // Create categories
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: 'Vegetables',
          description: 'Fresh vegetables and produce'
        }
      }),
      db.category.create({
        data: {
          name: 'Fruits',
          description: 'Fresh fruits and berries'
        }
      }),
      db.category.create({
        data: {
          name: 'Dairy',
          description: 'Milk, cheese, and dairy products'
        }
      }),
      db.category.create({
        data: {
          name: 'Meat',
          description: 'Fresh and frozen meat products'
        }
      }),
      db.category.create({
        data: {
          name: 'Grains',
          description: 'Rice, wheat, and other grains'
        }
      }),
      db.category.create({
        data: {
          name: 'Beverages',
          description: 'Soft drinks, juices, and beverages'
        }
      }),
      db.category.create({
        data: {
          name: 'Condiments',
          description: 'Sauces, spices, and condiments'
        }
      }),
      db.category.create({
        data: {
          name: 'Bakery',
          description: 'Bread, pastries, and baked goods'
        }
      })
    ])

    // Get category IDs for inventory items
    const [vegetables, fruits, dairy, meat, grains, beverages, condiments, bakery] = categories

    // Create inventory items with realistic data
    const inventoryItems = await Promise.all([
      // Vegetables
      db.inventoryItem.create({
        data: {
          name: 'Tomatoes',
          description: 'Fresh red tomatoes',
          quantity: 50,
          unit: 'kg',
          price: 60,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          categoryId: vegetables.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Onions',
          description: 'Yellow onions',
          quantity: 30,
          unit: 'kg',
          price: 40,
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          categoryId: vegetables.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Potatoes',
          description: 'Russet potatoes',
          quantity: 80,
          unit: 'kg',
          price: 35,
          expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          categoryId: vegetables.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Lettuce',
          description: 'Iceberg lettuce',
          quantity: 15,
          unit: 'kg',
          price: 80,
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          categoryId: vegetables.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Fruits
      db.inventoryItem.create({
        data: {
          name: 'Apples',
          description: 'Red apples',
          quantity: 40,
          unit: 'kg',
          price: 120,
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          categoryId: fruits.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Bananas',
          description: 'Ripe bananas',
          quantity: 25,
          unit: 'kg',
          price: 90,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          categoryId: fruits.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Dairy
      db.inventoryItem.create({
        data: {
          name: 'Milk',
          description: 'Fresh cow milk',
          quantity: 20,
          unit: 'liters',
          price: 70,
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          categoryId: dairy.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Cheese',
          description: 'Cheddar cheese',
          quantity: 10,
          unit: 'kg',
          price: 450,
          expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          categoryId: dairy.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Yogurt',
          description: 'Plain yogurt',
          quantity: 15,
          unit: 'liters',
          price: 85,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          categoryId: dairy.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Meat
      db.inventoryItem.create({
        data: {
          name: 'Chicken Breast',
          description: 'Boneless chicken breast',
          quantity: 25,
          unit: 'kg',
          price: 280,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          categoryId: meat.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Beef',
          description: 'Fresh beef cuts',
          quantity: 15,
          unit: 'kg',
          price: 550,
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          categoryId: meat.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Fish',
          description: 'Fresh salmon fillets',
          quantity: 8,
          unit: 'kg',
          price: 420,
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          categoryId: meat.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Grains
      db.inventoryItem.create({
        data: {
          name: 'Rice',
          description: 'Basmati rice',
          quantity: 100,
          unit: 'kg',
          price: 125,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
          categoryId: grains.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Flour',
          description: 'All-purpose flour',
          quantity: 50,
          unit: 'kg',
          price: 65,
          expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months from now
          categoryId: grains.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Pasta',
          description: 'Italian pasta',
          quantity: 30,
          unit: 'kg',
          price: 95,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          categoryId: grains.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Beverages
      db.inventoryItem.create({
        data: {
          name: 'Orange Juice',
          description: 'Fresh orange juice',
          quantity: 12,
          unit: 'liters',
          price: 45,
          expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          categoryId: beverages.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Soda',
          description: 'Cola soda bottles',
          quantity: 24,
          unit: 'bottles',
          price: 25,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
          categoryId: beverages.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Condiments
      db.inventoryItem.create({
        data: {
          name: 'Ketchup',
          description: 'Tomato ketchup',
          quantity: 8,
          unit: 'bottles',
          price: 35,
          expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
          categoryId: condiments.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Mayonnaise',
          description: 'Mayonnaise dressing',
          quantity: 6,
          unit: 'jars',
          price: 55,
          expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          categoryId: condiments.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      // Bakery
      db.inventoryItem.create({
        data: {
          name: 'Bread',
          description: 'Whole wheat bread',
          quantity: 20,
          unit: 'loaves',
          price: 45,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          categoryId: bakery.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      }),
      db.inventoryItem.create({
        data: {
          name: 'Croissants',
          description: 'Butter croissants',
          quantity: 15,
          unit: 'pieces',
          price: 25,
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          categoryId: bakery.id,
          userId: adminUser.id,
          status: 'AVAILABLE'
        }
      })
    ])

    // Create some waste records for realistic data
    const wasteItems = inventoryItems.slice(0, 10) // Use first 10 items for waste records
    const wasteRecords = await Promise.all([
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[0].id,
          userId: managerUser.id,
          quantity: 5,
          reason: 'EXPIRED',
          cost: 300,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Vegetables expired due to poor storage conditions'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[1].id,
          userId: staffUser.id,
          quantity: 3,
          reason: 'DAMAGED',
          cost: 120,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Onions damaged during delivery'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[2].id,
          userId: adminUser.id,
          quantity: 8,
          reason: 'OVERSTOCK',
          cost: 280,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          notes: 'Overordered potatoes, had to discard excess'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[4].id,
          userId: managerUser.id,
          quantity: 2,
          reason: 'EXPIRED',
          cost: 180,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Bananas overripened'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[6].id,
          userId: staffUser.id,
          quantity: 4,
          reason: 'PREPARATION',
          cost: 280,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          notes: 'Milk spilled during preparation'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[8].id,
          userId: adminUser.id,
          quantity: 3,
          reason: 'EXPIRED',
          cost: 840,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: 'Chicken expired due to temperature control failure'
        }
      }),
      db.wasteRecord.create({
        data: {
          itemId: wasteItems[9].id,
          userId: managerUser.id,
          quantity: 1,
          reason: 'DAMAGED',
          cost: 420,
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          notes: 'Fish spoiled due to refrigeration issues'
        }
      })
    ])

    return NextResponse.json({
      message: 'Demo data created successfully',
      users: [
        {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          password: adminPassword
        },
        {
          id: managerUser.id,
          name: managerUser.name,
          email: managerUser.email,
          role: managerUser.role,
          password: managerPassword
        },
        {
          id: staffUser.id,
          name: staffUser.name,
          email: staffUser.email,
          role: staffUser.role,
          password: staffPassword
        }
      ],
      summary: {
        usersCreated: 3,
        categoriesCreated: 8,
        inventoryItemsCreated: inventoryItems.length,
        wasteRecordsCreated: wasteRecords.length
      }
    })

  } catch (error) {
    console.error('Error creating demo data:', error)
    return NextResponse.json(
      { error: 'Failed to create demo data' },
      { status: 500 }
    )
  }
}