'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const CheckoutClientPage = dynamic(() => import('./CheckoutClientPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
    </div>
  ),
})

export default function CheckoutWrapper() {
  return <CheckoutClientPage />
}
