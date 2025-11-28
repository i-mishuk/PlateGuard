import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let dateFilter: any = {}
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
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
        acc[month] = { cost: 0, quantity: 0, count: 0 }
      }
      acc[month].cost += record.cost
      acc[month].quantity += record.quantity
      acc[month].count += 1
      return acc
    }, {} as Record<string, { cost: number; quantity: number; count: number }>)

    const totalInventoryValue = await db.inventoryItem.aggregate({
      _sum: {
        price: true
      },
      where: {
        status: 'AVAILABLE'
      }
    })

    const totalInventoryCost = totalInventoryValue._sum.price || 0
    const wastePercentage = totalInventoryCost > 0 ? (totalWasteCost / totalInventoryCost) * 100 : 0

    const report = {
      summary: {
        totalWasteCost,
        totalWasteQuantity,
        wastePercentage: Math.round(wastePercentage * 100) / 100,
        totalInventoryCost,
        wasteRecordsCount: wasteRecords.length
      },
      wasteByCategory: Object.entries(wasteByCategory).map(([category, data]) => ({
        category,
        cost: data.cost,
        quantity: data.quantity,
        count: data.count,
        percentage: Math.round((data.cost / totalWasteCost) * 100 * 100) / 100
      })),
      wasteByReason: Object.entries(wasteByReason).map(([reason, data]) => ({
        reason,
        cost: data.cost,
        quantity: data.quantity,
        count: data.count,
        percentage: Math.round((data.cost / totalWasteCost) * 100 * 100) / 100
      })),
      monthlyTrend: Object.entries(monthlyTrend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          cost: data.cost,
          quantity: data.quantity,
          count: data.count
        })),
      recentWasteRecords: wasteRecords.slice(0, 20)
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating waste report:', error)
    return NextResponse.json(
      { error: 'Failed to generate waste report' },
      { status: 500 }
    )
  }
}