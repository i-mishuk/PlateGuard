import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason, notes } = body

    // Find inventory item
    const item = await db.inventoryItem.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Create waste record
    const wasteRecord = await db.wasteRecord.create({
      data: {
        itemId: id,
        userId: item.userId,
        quantity: item.quantity,
        reason: reason || 'EXPIRED',
        cost: item.quantity * item.price,
        date: new Date(), // Add the required date field
        notes: notes || `Marked ${item.name} as waste`,
      }
    })

    // Update inventory item status to WASTED
    await db.inventoryItem.update({
      where: { id },
      data: {
        status: 'WASTED',
        quantity: 0 // Set quantity to 0 since it's wasted
      }
    })

    return NextResponse.json({
      message: 'Item marked as waste successfully',
      wasteRecord
    })
  } catch (error) {
    console.error('Error marking item as waste:', error)
    return NextResponse.json(
      { error: 'Failed to mark item as waste', details: error.message },
      { status: 500 }
    )
  }
}