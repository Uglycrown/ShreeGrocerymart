'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    iconColor: string
    iconBg: string
    trend?: {
        value: number
        isPositive: boolean
    }
}

export default function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    trend
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {title}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-gray-500 font-normal">vs last week</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    )
}
