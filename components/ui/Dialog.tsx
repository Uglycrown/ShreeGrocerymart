'use client'

import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect, useRef } from 'react'

export type DialogType = 'alert' | 'confirm'
export type DialogVariant = 'success' | 'error' | 'warning' | 'info'

export interface DialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm?: () => void
    title?: string
    message: string
    type?: DialogType
    variant?: DialogVariant
    confirmText?: string
    cancelText?: string
}

const variantConfig = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    error: {
        icon: AlertCircle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
}

export default function Dialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'alert',
    variant = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
    const config = variantConfig[variant]
    const Icon = config.icon

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Focus trap
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            dialogRef.current.focus()
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${config.iconColor}`} />
                    </div>

                    {/* Title */}
                    {title && (
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    <p className="text-gray-600 text-center leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Buttons */}
                <div className={`px-6 pb-6 ${type === 'confirm' ? 'flex gap-3' : ''}`}>
                    {type === 'confirm' && (
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (type === 'confirm' && onConfirm) {
                                onConfirm()
                            }
                            onClose()
                        }}
                        className={`${type === 'confirm' ? 'flex-1' : 'w-full'} px-4 py-3 ${config.buttonColor} text-white font-semibold rounded-xl transition-colors`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
