import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const { subscription, userId } = data

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json(
                { error: 'Invalid subscription data' },
                { status: 400 }
            )
        }

        const db = await getDb()

        // Check if subscription already exists
        const existing = await db.collection('PushSubscription').findOne({
            endpoint: subscription.endpoint,
        })

        if (existing) {
            // Update existing subscription
            await db.collection('PushSubscription').updateOne(
                { endpoint: subscription.endpoint },
                {
                    $set: {
                        p256dh: subscription.keys?.p256dh || '',
                        auth: subscription.keys?.auth || '',
                        userId: userId ? new ObjectId(userId) : null,
                        userAgent: request.headers.get('user-agent') || '',
                        updatedAt: new Date(),
                    },
                }
            )
            return NextResponse.json({ message: 'Subscription updated' })
        }

        // Create new subscription
        const pushSubscription = {
            _id: new ObjectId(),
            endpoint: subscription.endpoint,
            p256dh: subscription.keys?.p256dh || '',
            auth: subscription.keys?.auth || '',
            userId: userId ? new ObjectId(userId) : null,
            userAgent: request.headers.get('user-agent') || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await db.collection('PushSubscription').insertOne(pushSubscription)

        return NextResponse.json(
            { message: 'Subscription saved successfully' },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error saving push subscription:', error)
        return NextResponse.json(
            { error: 'Failed to save subscription', message: error.message },
            { status: 500 }
        )
    }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
    try {
        const { endpoint } = await request.json()

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { status: 400 }
            )
        }

        const db = await getDb()
        await db.collection('PushSubscription').deleteOne({ endpoint })

        return NextResponse.json({ message: 'Subscription removed' })
    } catch (error: any) {
        console.error('Error removing push subscription:', error)
        return NextResponse.json(
            { error: 'Failed to remove subscription' },
            { status: 500 }
        )
    }
}
