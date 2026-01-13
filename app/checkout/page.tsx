import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const CheckoutClientPage = dynamic(() => import('@/components/checkout/CheckoutClientPage'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
    </div>
  ),
})

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    }>
      <CheckoutClientPage />
    </Suspense>
  )
}
