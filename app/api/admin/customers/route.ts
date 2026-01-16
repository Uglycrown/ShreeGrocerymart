import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const skip = (page - 1) * limit

        // Build search condition
        const searchCondition = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search, mode: 'insensitive' as const } }
            ]
        } : {}

        // Get customers with order stats
        const [customers, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    role: 'USER',
                    ...searchCondition
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    image: true,
                    createdAt: true,
                    addresses: {
                        select: {
                            id: true,
                            label: true,
                            street: true,
                            city: true,
                            pincode: true,
                            isDefault: true
                        }
                    },
                    orders: {
                        select: {
                            id: true,
                            totalAmount: true,
                            status: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    _count: {
                        select: { orders: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({
                where: {
                    role: 'USER',
                    ...searchCondition
                }
            })
        ])

        // Calculate lifetime value for each customer
        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const totalSpent = await prisma.order.aggregate({
                    where: {
                        userId: customer.id,
                        status: { not: 'CANCELLED' }
                    },
                    _sum: { totalAmount: true }
                })

                const lastOrderDate = customer.orders[0]?.createdAt || null

                return {
                    ...customer,
                    totalOrders: customer._count.orders,
                    totalSpent: totalSpent._sum.totalAmount || 0,
                    lastOrderDate,
                    recentOrders: customer.orders
                }
            })
        )

        return NextResponse.json({
            customers: customersWithStats,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        )
    }
}
