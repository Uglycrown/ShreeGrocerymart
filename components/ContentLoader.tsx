'use client'

import { useEffect, useState } from 'react'

export default function ContentLoader({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Signal that content is mounted and ready
    setIsReady(true)
    
    // Dispatch custom event when content is ready
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('contentReady'))
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return <div className={isReady ? 'opacity-100' : 'opacity-0'} style={{ transition: 'opacity 0.3s' }}>{children}</div>
}
