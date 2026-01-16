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
}

const TIME_CONFIGS: Record<TimeSlot, TimeSlotConfig> = {
    MORNING: {
        slot: 'MORNING',
        title: 'Good Morning! Start Your Day Right',
        subtitle: 'Fresh breakfast essentials',
        icon: Sun,
        gradient: 'from-yellow-400 to-orange-500'
    },
    AFTERNOON: {
        slot: 'AFTERNOON',
        title: 'Afternoon Delights',
        subtitle: 'Perfect picks for your lunch',
        icon: Cloud,
        gradient: 'from-blue-400 to-cyan-500'
    },
    EVENING: {
        slot: 'EVENING',
        title: 'Evening Essentials',
        subtitle: 'Dinner time favorites',
        icon: Moon,
        gradient: 'from-purple-500 to-pink-500'
    },
    NIGHT: {
        slot: 'NIGHT',
        title: 'Late Night Cravings',
        subtitle: 'Quick bites for the night',
        icon: Stars,
        gradient: 'from-indigo-600 to-purple-700'
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
        <section className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-6 mb-6 text-white`}>
                <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-8 h-8" />
                    <h2 className="text-2xl md:text-3xl font-bold">{config.title}</h2>
                </div>
                <p className="text-white/90 text-sm md:text-base">{config.subtitle}</p>
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
                    className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
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
            <div className="flex justify-center gap-1 mt-4 md:hidden">
                {products.length > 0 && [...Array(Math.min(5, Math.ceil(products.length / 2)))].map((_, i) => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300"
                    />
                ))}
            </div>
        </section>
    )
}
