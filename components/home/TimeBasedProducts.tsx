'use client'

import { useState, useEffect, useRef } from 'react'
import ProductCard from '@/components/products/ProductCard'
import { ChevronLeft, ChevronRight, Sun, Cloud, Moon, Stars } from 'lucide-react'

type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'

interface Product {
    id: string
    name: string
    images: string[]
    price: number
    originalPrice?: number
    unit: string
    deliveryTime: number
    stock: number
}

interface TimeSlotConfig {
    slot: TimeSlot
    title: string
    subtitle: string
    icon: typeof Sun
    gradient: string
    bgTheme: string
    cardBg: string
}

const TIME_CONFIGS: Record<TimeSlot, TimeSlotConfig> = {
    MORNING: {
        slot: 'MORNING',
        title: 'Good Morning! Start Your Day Right',
        subtitle: 'Fresh breakfast essentials',
        icon: Sun,
        gradient: 'from-yellow-400 to-orange-500',
        bgTheme: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50',
        cardBg: 'bg-white/90 backdrop-blur-sm'
    },
    AFTERNOON: {
        slot: 'AFTERNOON',
        title: 'Afternoon Delights',
        subtitle: 'Perfect picks for your lunch',
        icon: Cloud,
        gradient: 'from-blue-400 to-cyan-500',
        bgTheme: 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50',
        cardBg: 'bg-white/90 backdrop-blur-sm'
    },
    EVENING: {
        slot: 'EVENING',
        title: 'Evening Essentials',
        subtitle: 'Dinner time favorites',
        icon: Moon,
        gradient: 'from-purple-500 to-pink-500',
        bgTheme: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
        cardBg: 'bg-white/90 backdrop-blur-sm'
    },
    NIGHT: {
        slot: 'NIGHT',
        title: 'Late Night Cravings',
        subtitle: 'Quick bites for the night',
        icon: Stars,
        gradient: 'from-indigo-600 to-purple-700',
        bgTheme: 'bg-gradient-to-br from-indigo-100 via-purple-50 to-slate-100',
        cardBg: 'bg-white/90 backdrop-blur-sm'
    }
}

function getTimeSlot(): TimeSlot {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) return 'MORNING'
    if (hour >= 12 && hour < 18) return 'AFTERNOON'
    if (hour >= 18 && hour < 24) return 'EVENING'
    return 'NIGHT'
}

export default function TimeBasedProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [currentSlot, setCurrentSlot] = useState<TimeSlot>('MORNING')
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setCurrentSlot(getTimeSlot())
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [currentSlot])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/products?timeSlot=${currentSlot}&limit=12`)
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (error) {
            console.error('Error fetching time-based products:', error)
        } finally {
            setLoading(false)
        }
    }

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return
        const scrollAmount = 320
        const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
        scrollContainerRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        })
    }

    if (products.length === 0 && !loading) return null

    const config = TIME_CONFIGS[currentSlot]
    const Icon = config.icon

    return (
        <section className={`${config.bgTheme} py-4 my-0 rounded-2xl transition-colors duration-500`}>
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className={`bg-gradient-to-r ${config.gradient} rounded-xl p-4 mb-4 text-white shadow-lg`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-6 h-6" />
                        <h2 className="text-xl md:text-2xl font-bold">{config.title}</h2>
                    </div>
                    <p className="text-white/90 text-xs md:text-sm">{config.subtitle}</p>
                </div>

                {/* Products Carousel */}
                <div className="relative group">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-gray-100"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {loading ? (
                            // Loading Skeletons
                            [...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-40 md:w-48 snap-start"
                                >
                                    <div className="bg-white rounded-lg p-3 animate-pulse h-64">
                                        <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                                        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Product Cards
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex-shrink-0 w-40 md:w-48 snap-start"
                                >
                                    <ProductCard
                                        id={product.id}
                                        name={product.name}
                                        image={product.images[0]}
                                        price={product.price}
                                        originalPrice={product.originalPrice}
                                        unit={product.unit}
                                        deliveryTime={product.deliveryTime}
                                        stock={product.stock}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-gray-100"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="flex justify-center gap-1 mt-2 md:hidden">
                    {products.length > 0 && [...Array(Math.min(5, Math.ceil(products.length / 2)))].map((_, i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-300"
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
