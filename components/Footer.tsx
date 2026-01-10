'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-8 h-8 text-green-500" />
              <h3 className="text-2xl font-bold text-white">Shree Grocery Mart</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              At Shree Groceries Mart, we believe shopping is more than just buying daily essentials – it's about trust, quality, and convenience.
            </p>
            
            {/* Address */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-400">
                  Shop No. 11, Karnal Enclave, Link Road Dhandera,<br />
                  Opp. Navrachna Flats, Roorkee UK, India
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="tel:+919756086925" className="text-sm text-gray-400 hover:text-green-500 transition">
                  +91 9756086925
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="mailto:contact@shreegrocerymart.in" className="text-sm text-gray-400 hover:text-green-500 transition">
                  contact@shreegrocerymart.in
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-600 p-2.5 rounded-full transition-colors"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-400 p-2.5 rounded-full transition-colors"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-pink-600 p-2.5 rounded-full transition-colors"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 hover:bg-blue-700 p-2.5 rounded-full transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-500 transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-400 hover:text-green-500 transition text-sm">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-gray-400 hover:text-green-500 transition text-sm">
                  Return Policy
                </Link>
              </li>
            </ul>

            {/* Hotline */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-2 text-sm">Hotline Number</h4>
              <a
                href="tel:+919756086925"
                className="text-green-500 hover:text-green-400 font-bold text-lg transition flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                +91 9756086925
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Shree Grocery Mart. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Crafted with excellence by</span>
              <a 
                href="https://dreamyhook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-400 font-semibold transition-colors"
              >
                DreamyHook
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
