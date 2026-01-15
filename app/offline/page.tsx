'use client'

import Link from 'next/link'
import { WifiOff, Home, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <WifiOff className="w-10 h-10 text-orange-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        You're Offline
                    </h1>

                    <p className="text-gray-600 mb-8">
                        It looks like you've lost your internet connection. Please check your connection and try again.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Go to Home
                        </Link>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    Some previously visited pages may still be available offline.
                </p>
            </div>
        </div>
    )
}
