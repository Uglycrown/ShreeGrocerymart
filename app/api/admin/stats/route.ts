import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TopSellingProduct {
    productId: string
    _sum: { quantity: number | null }
}

interface OrderByStatus {
    status: string
    _count: number
}

export async function GET(request: NextRequest) {
    try {
        // Get date ranges
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart)
        weekStart.setDate(weekStart.getDate() - 7)
        const monthStart = new Date(todayStart)
        monthStart.setDate(monthStart.getDate() - 30)

        // Parallel queries for better performance
        const [
            totalProducts,
            totalCustomers,
            totalOrders,
            ordersToday,
            ordersThisWeek,
            ordersThisMonth,
            lowStockProducts,
            outOfStockProducts,
            recentOrders,
            topSellingProducts,
            ordersByStatus,
            revenueStats
        ] = await Promise.all([
            // Total products
            prisma.product.count({ where: { isActive: true } }),

            // Total customers
            prisma.user.count({ where: { role: 'USER' } }),

            // Total orders
            prisma.order.count(),

            // Orders today
            prisma.order.count({
                where: { createdAt: { gte: todayStart } }
            }),

            // Orders this week
            prisma.order.count({
                where: { createdAt: { gte: weekStart } }
            }),

            // Orders this month
            prisma.order.count({
                where: { createdAt: { gte: monthStart } }
            }),

            // Low stock products (< 10)
            prisma.product.findMany({
                where: {
                    isActive: true,
                    stock: { gt: 0, lt: 10 }
                },
                select: {
                    id: true,
                    name: true,
                    stock: true,
                    images: true,
                    category: { select: { name: true } }
                },
                orderBy: { stock: 'asc' },
                take: 10
            }),

            // Out of stock products
            prisma.product.count({
                where: { isActive: true, stock: 0 }
            }),

            // Recent orders
            prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: { name: true, email: true, phone: true }
                    }
                }
            }),

            // Top selling products (by order items count)
            prisma.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }),

            // Orders by status
            prisma.order.groupBy({
                by: ['status'],
                _count: true
            }),

            // Revenue calculations
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { not: 'CANCELLED' } }
            })
        ])

        // Get product details for top selling
        const topProductIds = (topSellingProducts as TopSellingProduct[]).map((p: TopSellingProduct) => p.productId)
        const topProductDetails = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true, images: true, price: true }
        })

        const topProductsWithDetails = (topSellingProducts as TopSellingProduct[]).map((item: TopSellingProduct) => {
            const product = topProductDetails.find((p: { id: string }) => p.id === item.productId)
            return {
                ...product,
                totalSold: item._sum.quantity || 0
            }
        })

        // Calculate revenue for different periods
        const [revenueTodayResult, revenueWeekResult, revenueMonthResult] = await Promise.all([
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: todayStart },
                    status: { not: 'CANCELLED' }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: weekStart },
                    status: { not: 'CANCELLED' }
                }
            }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: monthStart },
                    status: { not: 'CANCELLED' }
                }
            })
        ])

        // Daily revenue for last 7 days (for chart)
        const dailyRevenue = []
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(todayStart)
            dayStart.setDate(dayStart.getDate() - i)
            const dayEnd = new Date(dayStart)
            dayEnd.setDate(dayEnd.getDate() + 1)

            const dayRevenue = await prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: {
                    createdAt: { gte: dayStart, lt: dayEnd },
                    status: { not: 'CANCELLED' }
                }
            })

            dailyRevenue.push({
                date: dayStart.toISOString().split('T')[0],
                day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dayRevenue._sum.totalAmount || 0
            })
        }

        return NextResponse.json({
            overview: {
                totalProducts,
                totalCustomers,
                totalOrders,
                ordersToday,
                ordersThisWeek,
                ordersThisMonth,
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts
            },
            revenue: {
                total: revenueStats._sum.totalAmount || 0,
                today: revenueTodayResult._sum.totalAmount || 0,
                week: revenueWeekResult._sum.totalAmount || 0,
                month: revenueMonthResult._sum.totalAmount || 0,
                daily: dailyRevenue
            },
            inventory: {
                lowStockProducts,
                outOfStockCount: outOfStockProducts
            },
            orders: {
                recent: recentOrders,
                byStatus: (ordersByStatus as unknown as OrderByStatus[]).reduce((acc: Record<string, number>, item: OrderByStatus) => {
                    acc[item.status] = item._count
                    return acc
                }, {})
            },
            products: {
                topSelling: topProductsWithDetails
            }
        })
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        )
    }
}
