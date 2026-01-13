import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import CheckoutWrapper from '@/components/checkout/CheckoutWrapper'

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    }>
      <CheckoutWrapper />
    </Suspense>
  )
}