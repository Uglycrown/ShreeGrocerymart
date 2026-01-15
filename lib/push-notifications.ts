// Push notification utilities and message templates

export interface OrderNotificationData {
    orderId: string
    orderNumber: string
    status: string
    customerName?: string
}

export interface PushMessage {
    title: string
    body: string
    icon: string
    badge: string
    url: string
    tag: string
}

// Order status notification messages
export function getOrderNotificationMessage(data: OrderNotificationData): PushMessage {
    const { orderNumber, status, orderId } = data

    const messages: Record<string, { title: string; body: string; icon: string }> = {
        confirmed: {
            title: '✅ Order Confirmed!',
            body: `Your order ${orderNumber} has been confirmed and is being processed.`,
            icon: '✅',
        },
        processing: {
            title: '📦 Order Being Packed',
            body: `Your order ${orderNumber} is being carefully packed.`,
            icon: '📦',
        },
        packed: {
            title: '📦 Order Packed',
            body: `Your order ${orderNumber} is packed and ready for dispatch.`,
            icon: '📦',
        },
        out_for_delivery: {
            title: '🛵 Out for Delivery!',
            body: `Your order ${orderNumber} is on its way! Track your delivery.`,
            icon: '🛵',
        },
        delivered: {
            title: '🎉 Order Delivered!',
            body: `Your order ${orderNumber} has been delivered. Enjoy!`,
            icon: '🎉',
        },
        cancelled: {
            title: '❌ Order Cancelled',
            body: `Your order ${orderNumber} has been cancelled. Refund will be processed if applicable.`,
            icon: '❌',
        },
        refunded: {
            title: '💰 Refund Processed',
            body: `Refund for order ${orderNumber} has been initiated.`,
            icon: '💰',
        },
    }

    const statusLower = status.toLowerCase()
    const message = messages[statusLower] || {
        title: '📋 Order Update',
        body: `Your order ${orderNumber} status has been updated to ${status}.`,
        icon: '📋',
    }

    return {
        title: message.title,
        body: message.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        url: `/orders/${orderId}`,
        tag: `order-${orderId}`,
    }
}

// Send notification to a subscription endpoint (browser push)
export async function sendPushNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    message: PushMessage
): Promise<boolean> {
    try {
        // For browser-based push, we use the Push API via service worker
        // This requires VAPID keys for production use
        // For now, we'll store notifications and the frontend will poll/fetch them
        console.log('Push notification queued:', message)
        return true
    } catch (error) {
        console.error('Failed to send push notification:', error)
        return false
    }
}
