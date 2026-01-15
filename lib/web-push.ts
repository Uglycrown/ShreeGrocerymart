import webpush from 'web-push'

// Set VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@shreegrocerymart.com'

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

interface PushPayload {
    title: string
    body: string
    icon?: string
    badge?: string
    url?: string
    tag?: string
}

interface PushSubscriptionData {
    endpoint: string
    p256dh: string
    auth: string
}

export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<boolean> {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-72x72.png',
            url: payload.url || '/',
            tag: payload.tag,
        })

        await webpush.sendNotification(pushSubscription, notificationPayload)
        console.log('✅ Push notification sent successfully')
        return true
    } catch (error: any) {
        console.error('❌ Error sending push notification:', error?.message || error)

        // If subscription is invalid/expired, we should remove it
        if (error?.statusCode === 410 || error?.statusCode === 404) {
            console.log('Subscription expired or invalid, should be removed')
            return false
        }

        return false
    }
}

// Order status notification messages
export function getOrderStatusMessage(status: string, orderNumber: string): PushPayload {
    const messages: Record<string, { title: string; body: string }> = {
        confirmed: {
            title: '✅ Order Confirmed!',
            body: `Your order ${orderNumber} has been confirmed and is being processed.`,
        },
        processing: {
            title: '📦 Order Being Packed',
            body: `Your order ${orderNumber} is being carefully packed.`,
        },
        packed: {
            title: '📦 Order Packed',
            body: `Your order ${orderNumber} is packed and ready for dispatch.`,
        },
        out_for_delivery: {
            title: '🛵 Out for Delivery!',
            body: `Your order ${orderNumber} is on its way! Track your delivery.`,
        },
        delivered: {
            title: '🎉 Order Delivered!',
            body: `Your order ${orderNumber} has been delivered. Enjoy!`,
        },
        cancelled: {
            title: '❌ Order Cancelled',
            body: `Your order ${orderNumber} has been cancelled.`,
        },
        refunded: {
            title: '💰 Refund Processed',
            body: `Refund for order ${orderNumber} has been initiated.`,
        },
    }

    const statusLower = status.toLowerCase().replace(/ /g, '_')
    const message = messages[statusLower] || {
        title: '📋 Order Update',
        body: `Your order ${orderNumber} status: ${status}`,
    }

    return {
        ...message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
    }
}
