import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      itemId,
      userId,
      quantity,
      reason,
      cost,
      notes
    } = body

    if (!itemId || !userId || !quantity || !reason || !cost) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate that item and user exist
    const [item, user] = await Promise.all([
      db.inventoryItem.findUnique({ where: { id: itemId } }),
      db.user.findUnique({ where: { id: userId } })
    ])

    if (!item) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Validate waste reason
    const validReasons = ['EXPIRED', 'DAMAGED', 'OVERSTOCK', 'PREPARATION', 'OTHER']
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid waste reason' },
        { status: 400 }
      )
    }

    // Create waste record
    const wasteRecord = await db.wasteRecord.create({
      data: {
        itemId,
        userId,
        quantity: parseFloat(quantity),
        reason,
        cost: parseFloat(cost),
        notes,
        date: new Date()
      },
      include: {
        item: {
          include: {
            category: true
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Update inventory item quantity
    const newQuantity = item.quantity - parseFloat(quantity)
    const newStatus = newQuantity <= 0 ? 'WASTED' : 
                     newQuantity <= 10 ? 'LOW_STOCK' : 'AVAILABLE'

    await db.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: newQuantity,
        status: newStatus
      }
    })

    return NextResponse.json(wasteRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating waste record:', error)
    return NextResponse.json(
      { error: 'Failed to create waste record', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const itemId = searchParams.get('itemId')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (itemId) {
      where.itemId = itemId
    }

    if (userId) {
      where.userId = userId
    }

    const [wasteRecords, total] = await Promise.all([
      db.wasteRecord.findMany({
        where,
        include: {
          item: {
            include: {
              category: true
            }
          },
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      db.wasteRecord.count({ where })
    ])

    return NextResponse.json({
      wasteRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching waste records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waste records' },
      { status: 500 }
    )
  }
}