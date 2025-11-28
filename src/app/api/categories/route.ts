import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      include: {
        inventoryItems: {
          select: {
            price: true,
            quantity: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    const categoriesWithStats = categories.map(category => {
      const itemCount = category.inventoryItems.length
      const totalValue = category.inventoryItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      )
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        itemCount,
        totalValue,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      }
    })

    return NextResponse.json(categoriesWithStats)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const existingCategory = await db.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}