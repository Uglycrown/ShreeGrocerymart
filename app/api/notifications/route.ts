import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')
        const unreadOnly = searchParams.get('unreadOnly') === 'true'
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        const db = await getDb()

        const query: any = { userId: new ObjectId(userId) }
        if (unreadOnly) {
            query.isRead = false
        }

        const notifications = await db
            .collection('Notification')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray()

        const formattedNotifications = notifications.map((n) => ({
            id: n._id.toString(),
            type: n.type,
            title: n.title,
            body: n.body,
            url: n.url,
            orderNumber: n.orderNumber,
            status: n.status,
            isRead: n.isRead,
            createdAt: n.createdAt,
        }))

        // Get unread count
        const unreadCount = await db
            .collection('Notification')
            .countDocuments({ userId: new ObjectId(userId), isRead: false })

        return NextResponse.json({
            notifications: formattedNotifications,
            unreadCount,
        })
    } catch (error: any) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const data = await request.json()
        const { notificationIds, userId, markAllRead } = data

        const db = await getDb()

        if (markAllRead && userId) {
            // Mark all notifications as read for user
            await db.collection('Notification').updateMany(
                { userId: new ObjectId(userId), isRead: false },
                { $set: { isRead: true } }
            )
        } else if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications as read
            await db.collection('Notification').updateMany(
                { _id: { $in: notificationIds.map((id: string) => new ObjectId(id)) } },
                { $set: { isRead: true } }
            )
        }

        return NextResponse.json({ message: 'Notifications updated' })
    } catch (error: any) {
        console.error('Error updating notifications:', error)
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        )
    }
}
