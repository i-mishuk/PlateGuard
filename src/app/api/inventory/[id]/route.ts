import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      quantity,
      unit,
      price,
      expiryDate,
      categoryId,
      status
    } = body

    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(categoryId && { categoryId }),
        ...(status && { status })
      },
      include: {
        category: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory item', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete associated waste records first
    await db.wasteRecord.deleteMany({
      where: { itemId: id }
    })

    // Then delete the inventory item
    await db.inventoryItem.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Inventory item deleted successfully' })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory item', details: error.message },
      { status: 500 }
    )
  }
}