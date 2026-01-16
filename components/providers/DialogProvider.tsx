'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import Dialog, { DialogVariant } from '@/components/ui/Dialog'

interface AlertOptions {
    title?: string
    variant?: DialogVariant
    confirmText?: string
}

interface ConfirmOptions {
    title?: string
    variant?: DialogVariant
    confirmText?: string
    cancelText?: string
}

interface DialogContextType {
    showAlert: (message: string, options?: AlertOptions) => void
    showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>
    showSuccess: (message: string, title?: string) => void
    showError: (message: string, title?: string) => void
    showWarning: (message: string, title?: string) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function useDialog() {
    const context = useContext(DialogContext)
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider')
    }
    return context
}

interface DialogState {
    isOpen: boolean
    type: 'alert' | 'confirm'
    message: string
    title?: string
    variant: DialogVariant
    confirmText: string
    cancelText: string
    onConfirm?: () => void
}

const initialDialogState: DialogState = {
    isOpen: false,
    type: 'alert',
    message: '',
    title: undefined,
    variant: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: undefined,
}

export function DialogProvider({ children }: { children: ReactNode }) {
    const [dialogState, setDialogState] = useState<DialogState>(initialDialogState)

    const closeDialog = useCallback(() => {
        setDialogState(prev => ({ ...prev, isOpen: false }))
    }, [])

    const showAlert = useCallback((message: string, options?: AlertOptions) => {
        setDialogState({
            isOpen: true,
            type: 'alert',
            message,
            title: options?.title,
            variant: options?.variant || 'info',
            confirmText: options?.confirmText || 'OK',
            cancelText: 'Cancel',
            onConfirm: undefined,
        })
    }, [])

    const showConfirm = useCallback((message: string, options?: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                type: 'confirm',
                message,
                title: options?.title,
                variant: options?.variant || 'warning',
                confirmText: options?.confirmText || 'Confirm',
                cancelText: options?.cancelText || 'Cancel',
                onConfirm: () => resolve(true),
            })

            // Handle cancel case by resolving false when dialog closes without confirm
            const handleClose = () => {
                resolve(false)
            }

            // Store the close handler to be called if dialog is closed without confirming
            setDialogState(prev => ({
                ...prev,
                onClose: handleClose,
            }))
        })
    }, [])

    const showSuccess = useCallback((message: string, title?: string) => {
        showAlert(message, { title: title || 'Success', variant: 'success' })
    }, [showAlert])

    const showError = useCallback((message: string, title?: string) => {
        showAlert(message, { title: title || 'Error', variant: 'error' })
    }, [showAlert])

    const showWarning = useCallback((message: string, title?: string) => {
        showAlert(message, { title: title || 'Warning', variant: 'warning' })
    }, [showAlert])

    const handleClose = useCallback(() => {
        closeDialog()
    }, [closeDialog])

    const handleConfirm = useCallback(() => {
        if (dialogState.onConfirm) {
            dialogState.onConfirm()
        }
        closeDialog()
    }, [dialogState.onConfirm, closeDialog])

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showSuccess, showError, showWarning }}>
            {children}
            <Dialog
                isOpen={dialogState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={dialogState.title}
                message={dialogState.message}
                type={dialogState.type}
                variant={dialogState.variant}
                confirmText={dialogState.confirmText}
                cancelText={dialogState.cancelText}
            />
        </DialogContext.Provider>
    )
}
