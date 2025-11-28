import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = { name: { contains: category, mode: 'insensitive' } }
    }

    if (status) {
      where.status = status
    }

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        include: {
          category: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.inventoryItem.count({ where })
    ])

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      quantity,
      unit,
      price,
      expiryDate,
      categoryId,
      userId
    } = body

    if (!name || !quantity || !unit || !price || !categoryId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields', details: { name, quantity, unit, price, categoryId, userId } },
        { status: 400 }
      )
    }

    // Validate that category and user exist
    const [category, user] = await Promise.all([
      db.category.findUnique({ where: { id: categoryId } }),
      db.user.findUnique({ where: { id: userId } })
    ])

    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const inventoryItem = await db.inventoryItem.create({
      data: {
        name,
        description,
        quantity: parseFloat(quantity),
        unit,
        price: parseFloat(price),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        categoryId,
        userId,
        status: 'AVAILABLE'
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(inventoryItem, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory item', details: error.message },
      { status: 500 }
    )
  }
}