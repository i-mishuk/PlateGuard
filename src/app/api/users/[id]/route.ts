import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has associated data
    const [inventoryItems, wasteRecords] = await Promise.all([
      db.inventoryItem.count({ where: { userId } }),
      db.wasteRecord.count({ where: { userId } })
    ])

    // Only allow deletion if user has no associated data
    if (inventoryItems > 0 || wasteRecords > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with associated inventory or waste records' },
        { status: 400 }
      )
    }

    // Delete user
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}