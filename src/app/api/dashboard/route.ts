import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Fetch inventory data
    const inventoryItems = await db.inventoryItem.findMany({
      include: {
        category: true,
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000
    })

    const availableItems = inventoryItems.filter(item => item.status === 'AVAILABLE')
    const lowStockItems = inventoryItems.filter(item => item.status === 'LOW_STOCK')
    const expiringItems = inventoryItems.filter(item => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      return expiryDate <= threeDaysFromNow
    })

    const totalInventoryValue = availableItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    // Fetch waste data
    let dateFilter: any = {}
    const now = new Date()
    let filterDate = new Date()
    
    switch (period) {
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    dateFilter = {
      date: {
        gte: filterDate
      }
    }

    const wasteRecords = await db.wasteRecord.findMany({
      where: dateFilter,
      include: {
        item: {
          include: {
            category: true
          }
        },
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    const totalWasteCost = wasteRecords.reduce((sum, record) => sum + record.cost, 0)
    const totalWasteQuantity = wasteRecords.reduce((sum, record) => sum + record.quantity, 0)

    const wasteByCategory = wasteRecords.reduce((acc, record) => {
      const categoryName = record.item.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = { cost: 0, quantity: 0, count: 0 }
      }
      acc[categoryName].cost += record.cost
      acc[categoryName].quantity += record.quantity
      acc[categoryName].count += 1
      return acc
    }, {} as Record<string, { cost: number; quantity: number; count: number }>)

    const wasteByReason = wasteRecords.reduce((acc, record) => {
      const reason = record.reason
      if (!acc[reason]) {
        acc[reason] = { cost: 0, quantity: 0, count: 0 }
      }
      acc[reason].cost += record.cost
      acc[reason].quantity += record.quantity
      acc[reason].count += 1
      return acc
    }, {} as Record<string, { cost: number; quantity: number; count: number }>)

    const monthlyTrend = wasteRecords.reduce((acc, record) => {
      const month = record.date.toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = { wasteCost: 0, inventoryValue: 0 }
      }
      acc[month].wasteCost += record.cost
      return acc
    }, {} as Record<string, { wasteCost: number; inventoryValue: number }>)

    // Calculate waste percentage
    const totalInventoryCost = totalInventoryValue
    const wastePercentage = totalInventoryCost > 0 ? (totalWasteCost / totalInventoryCost) * 100 : 0

    const dashboardData = {
      summary: {
        totalInventoryItems: availableItems.length,
        totalInventoryValue,
        totalWasteCost,
        totalWasteQuantity,
        wastePercentage: Math.round(wastePercentage * 100) / 100,
        lowStockItems: lowStockItems.length,
        expiringItems: expiringItems.length,
        costSaved: Math.round(totalInventoryValue * 0.12) // Estimated 12% savings
      },
      wasteByCategory: Object.entries(wasteByCategory).map(([category, data]) => ({
        category,
        cost: data.cost,
        quantity: data.quantity,
        count: data.count,
        percentage: totalWasteCost > 0 ? Math.round((data.cost / totalWasteCost) * 100 * 100) / 100 : 0
      })),
      wasteByReason: Object.entries(wasteByReason).map(([reason, data]) => ({
        reason,
        cost: data.cost,
        quantity: data.quantity,
        count: data.count,
        percentage: totalWasteCost > 0 ? Math.round((data.cost / totalWasteCost) * 100 * 100) / 100 : 0
      })),
      monthlyTrend: Object.entries(monthlyTrend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          inventoryValue: totalInventoryValue, // Use current inventory value for all months
          wasteCost: data.wasteCost
        })),
      recentWasteRecords: wasteRecords.slice(0, 20),
      lowStockItems: lowStockItems.slice(0, 10).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category
      })),
      expiringItems: expiringItems.slice(0, 10).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        category: item.category
      }))
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error generating dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to generate dashboard data' },
      { status: 500 }
    )
  }
}