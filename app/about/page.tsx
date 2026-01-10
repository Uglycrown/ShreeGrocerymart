export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Shree Grocery Mart</h2>
            <p className="text-gray-600 leading-relaxed">At Shree Groceries Mart, we believe shopping is more than just buying daily essentials – it's about trust, quality, and convenience.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">To provide our customers with high-quality products at competitive prices while ensuring exceptional service and convenience.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
