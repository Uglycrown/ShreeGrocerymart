'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

export default function AppLoader() {
  const [isVisible, setIsVisible] = useState(true)
  const [hasVisited, setHasVisited] = useState(false)

  useEffect(() => {
    // Check if user has visited before in this session
    const visited = sessionStorage.getItem('hasVisited')
    
    if (visited) {
      setHasVisited(true)
      setIsVisible(false)
      return
    }

    // Listen for content ready event
    const handleContentReady = () => {
      setTimeout(() => {
        setIsVisible(false)
        sessionStorage.setItem('hasVisited', 'true')
      }, 200)
    }

    // Check if content is loaded
    const checkContentLoaded = () => {
      if (document.readyState === 'complete') {
        const hasContent = document.querySelector('[class*="container"]') || 
                          document.querySelectorAll('img').length > 3 ||
                          document.querySelectorAll('section').length > 0

        if (hasContent) {
          handleContentReady()
          return true
        }
      }
      return false
    }

    // Listen for custom content ready event
    window.addEventListener('contentReady', handleContentReady)

    // Check periodically until content is loaded
    const interval = setInterval(() => {
      if (checkContentLoaded()) {
        clearInterval(interval)
      }
    }, 150)

    // Fallback: force hide after 4 seconds
    const maxTimeout = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem('hasVisited', 'true')
      clearInterval(interval)
    }, 4000)

    return () => {
      clearInterval(interval)
      clearTimeout(maxTimeout)
      window.removeEventListener('contentReady', handleContentReady)
    }
  }, [])

  if (hasVisited || !isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-3xl shadow-2xl animate-bounce">
            <ShoppingBag className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent mb-4 animate-fade-in">
          Shree Grocery Mart
        </h1>

        {/* Loading Animation */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Tagline */}
        <p className="text-gray-600 text-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
          Quick delivery at your doorstep
        </p>

        {/* Progress Bar */}
        <div className="mt-8 w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full animate-progress"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-progress {
          animation: progress 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
