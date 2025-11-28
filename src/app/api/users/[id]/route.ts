import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { 
            inventoryItems: true,
            wasteRecords: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
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
    const { name, email, role } = body

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email && { email }),
        ...(role && { role: role.toUpperCase() })
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
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

    // Check if user has inventory items or waste records
    const [inventoryCount, wasteCount] = await Promise.all([
      db.inventoryItem.count({
        where: { userId: id }
      }),
      db.wasteRecord.count({
        where: { userId: id }
      })
    ])

    if (inventoryCount > 0 || wasteCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with associated inventory or waste records' },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}