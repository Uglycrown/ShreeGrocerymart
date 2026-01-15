declare module 'web-push' {
    interface PushSubscription {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }

    interface VapidDetails {
        subject: string;
        publicKey: string;
        privateKey: string;
    }

    interface RequestOptions {
        gcmAPIKey?: string;
        vapidDetails?: VapidDetails;
        TTL?: number;
        headers?: Record<string, string>;
        contentEncoding?: string;
        proxy?: string;
    }

    interface SendResult {
        statusCode: number;
        body: string;
        headers: Record<string, string>;
    }

    function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    function setGCMAPIKey(apiKey: string): void;
    function sendNotification(
        subscription: PushSubscription,
        payload?: string | Buffer,
        options?: RequestOptions
    ): Promise<SendResult>;
    function generateVAPIDKeys(): { publicKey: string; privateKey: string };
    function encrypt(
        userPublicKey: string,
        userAuth: string,
        payload: string | Buffer,
        contentEncoding?: string
    ): { localPublicKey: string; salt: string; cipherText: Buffer };
}
