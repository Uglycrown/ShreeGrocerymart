export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
          <div className="space-y-4">
            <div><h3 className="font-semibold text-gray-900 mb-2">Address</h3><p className="text-gray-600">Shop No. 11, Karnal Enclave, Link Road Dhandera, Opp. Navrachna Flats, Roorkee UK, India</p></div>
            <div><h3 className="font-semibold text-gray-900 mb-2">Phone</h3><a href="tel:+919756086925" className="text-green-600 hover:text-green-700">+91 9756086925</a></div>
            <div><h3 className="font-semibold text-gray-900 mb-2">Email</h3><a href="mailto:contact@shreegrocerymart.in" className="text-green-600 hover:text-green-700">contact@shreegrocerymart.in</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}
