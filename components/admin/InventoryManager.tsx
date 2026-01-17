'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Upload,
    FileSpreadsheet,
    History,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Download,
    Trash2,
    Eye,
    Clock,
    Package,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Save
} from 'lucide-react'

interface Snapshot {
    id: string
    name: string
    productCount: number
    createdAt: string
}

interface UploadLog {
    id: string
    fileName: string
    snapshotId: string
    productsUpdated: number
    productsCreated: number
    productsDeleted: number
    errors: string[] | null
    createdAt: string
}

interface UploadResult {
    success: boolean
    message: string
    stats: {
        total: number
        updated: number
        created: number
        errors: number
    }
    snapshotId?: string
    errors?: string[]
}

// Helper to parse CSV on client side
function parseCSVClient(csvContent: string): { headers: string[], rows: string[][] } {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return { headers: [], rows: [] }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows = lines.slice(1).map(line => {
        const values: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') inQuotes = !inQuotes
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = '' }
            else current += char
        }
        values.push(current.trim())
        return values
    })
    return { headers, rows }
}

export default function InventoryManager() {
    const [activeSection, setActiveSection] = useState<'upload' | 'history' | 'rollback'>('upload')
    const [snapshots, setSnapshots] = useState<Snapshot[]>([])
    const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [confirmRollback, setConfirmRollback] = useState<string | null>(null)
    const [expandedLog, setExpandedLog] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchSnapshots()
        fetchUploadLogs()
    }, [])

    const fetchSnapshots = async () => {
        try {
            const res = await fetch('/api/admin/inventory/snapshots')
            if (res.ok) {
                const data = await res.json()
                setSnapshots(data)
            }
        } catch (error) {
            console.error('Error fetching snapshots:', error)
        }
    }

    const fetchUploadLogs = async () => {
        try {
            const res = await fetch('/api/admin/inventory/upload')
            if (res.ok) {
                const data = await res.json()
                setUploadLogs(data)
            }
        } catch (error) {
            console.error('Error fetching upload logs:', error)
        }
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.name.endsWith('.csv')) {
                setSelectedFile(file)
                setUploadResult(null)
            } else {
                alert('Please upload a CSV file')
            }
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
            setUploadResult(null)
            setUploadProgress(null)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsLoading(true)
        setUploadResult(null)
        setUploadProgress(null)

        try {
            // Parse CSV on client side
            const csvContent = await selectedFile.text()
            const { headers, rows } = parseCSVClient(csvContent)

            if (headers.length === 0 || rows.length === 0) {
                setUploadResult({
                    success: false,
                    message: 'Invalid CSV file - no data found',
                    stats: { total: 0, updated: 0, created: 0, errors: 0 },
                })
                setIsLoading(false)
                return
            }

            // Split into chunks of 20 rows each
            const CHUNK_SIZE = 20
            const chunks: string[][][] = []
            for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
                chunks.push(rows.slice(i, i + CHUNK_SIZE))
            }

            const totalChunks = chunks.length
            let totalUpdated = 0
            let totalCreated = 0
            let totalErrors = 0
            const allErrors: string[] = []

            // Upload each chunk sequentially
            for (let i = 0; i < chunks.length; i++) {
                setUploadProgress({ current: i + 1, total: totalChunks })

                const formData = new FormData()
                formData.append('isChunked', 'true')
                formData.append('chunkIndex', i.toString())
                formData.append('totalChunks', totalChunks.toString())
                formData.append('isLastChunk', (i === chunks.length - 1).toString())
                formData.append('fileName', selectedFile.name)
                formData.append('chunkData', JSON.stringify({
                    headers,
                    rows: chunks[i]
                }))

                const res = await fetch('/api/admin/inventory/upload', {
                    method: 'POST',
                    body: formData,
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || `Chunk ${i + 1} failed`)
                }

                totalUpdated += data.stats?.updated || 0
                totalCreated += data.stats?.created || 0
                totalErrors += data.stats?.errors || 0
                if (data.errors) {
                    allErrors.push(...data.errors)
                }
            }

            setUploadResult({
                success: true,
                message: `Successfully processed ${rows.length} products in ${totalChunks} batches`,
                stats: {
                    total: rows.length,
                    updated: totalUpdated,
                    created: totalCreated,
                    errors: totalErrors,
                },
                errors: allErrors.length > 0 ? allErrors.slice(0, 10) : undefined,
            })

            setSelectedFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            fetchSnapshots()
            fetchUploadLogs()

        } catch (error) {
            setUploadResult({
                success: false,
                message: error instanceof Error ? error.message : 'Upload failed',
                stats: { total: 0, updated: 0, created: 0, errors: 0 },
            })
        } finally {
            setIsLoading(false)
            setUploadProgress(null)
        }
    }

    const handleRollback = async (snapshotId: string) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/inventory/rollback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snapshotId }),
            })

            const data = await res.json()

            if (res.ok) {
                alert(`Rollback successful!\n\nRestored: ${data.stats.restored} products\nRecreated: ${data.stats.created} products`)
                fetchSnapshots()
                fetchUploadLogs()
            } else {
                alert('Rollback failed: ' + data.error)
            }
        } catch (error) {
            alert('Network error occurred')
        } finally {
            setIsLoading(false)
            setConfirmRollback(null)
        }
    }

    const handleCreateBackup = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/inventory/snapshots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Manual Backup - ${new Date().toLocaleString('en-IN')}` }),
            })

            if (res.ok) {
                alert('Backup created successfully!')
                fetchSnapshots()
            } else {
                alert('Failed to create backup')
            }
        } catch (error) {
            alert('Network error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                    <p className="text-gray-600">Upload CSV files to update product stock and prices</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    Create Backup Now
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveSection('upload')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${activeSection === 'upload'
                        ? 'text-green-600 border-green-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <Upload className="w-5 h-5" />
                    Upload CSV
                </button>
                <button
                    onClick={() => setActiveSection('history')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${activeSection === 'history'
                        ? 'text-green-600 border-green-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <History className="w-5 h-5" />
                    Upload History
                </button>
                <button
                    onClick={() => setActiveSection('rollback')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${activeSection === 'rollback'
                        ? 'text-green-600 border-green-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                        }`}
                >
                    <RotateCcw className="w-5 h-5" />
                    Rollback
                </button>
            </div>

            {/* Upload Section */}
            {activeSection === 'upload' && (
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                    {/* CSV Format Guide */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">📋 CSV Format Required</h4>
                        <p className="text-sm text-blue-700 mb-2">Your CSV should have these columns:</p>
                        <code className="block bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm font-mono">
                            Name, Stock, Regular price, Sale price, Categories
                        </code>
                        <p className="text-xs text-blue-600 mt-2">
                            * Name = Product name, Stock = Quantity, Regular price = MRP, Sale price = Selling price (if empty, Regular price is used), Categories = Product category
                        </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${dragActive
                                ? 'border-green-500 bg-green-50'
                                : selectedFile
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }
            `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-3">
                                <FileSpreadsheet className="w-16 h-16 text-green-600" />
                                <div>
                                    <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedFile(null)
                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                    }}
                                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Upload className="w-16 h-16 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-900">Drop your CSV file here</p>
                                    <p className="text-sm text-gray-500">or click to browse</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    {selectedFile && (
                        <button
                            onClick={handleUpload}
                            disabled={isLoading}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    {uploadProgress
                                        ? `Processing batch ${uploadProgress.current}/${uploadProgress.total}...`
                                        : 'Preparing...'}
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Upload and Update Inventory
                                </>
                            )}
                        </button>
                    )}

                    {/* Upload Progress Bar */}
                    {uploadProgress && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Uploading batches...</span>
                                <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Batch {uploadProgress.current} of {uploadProgress.total}
                            </p>
                        </div>
                    )}

                    {/* Upload Result */}
                    {uploadResult && (
                        <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-start gap-3">
                                {uploadResult.success ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <h4 className={`font-semibold ${uploadResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                                    </h4>
                                    <p className={`text-sm ${uploadResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {uploadResult.message}
                                    </p>

                                    {uploadResult.success && (
                                        <div className="flex flex-wrap gap-4 mt-3">
                                            <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500">Total Rows</p>
                                                <p className="text-lg font-bold text-gray-900">{uploadResult.stats.total}</p>
                                            </div>
                                            <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500">Updated</p>
                                                <p className="text-lg font-bold text-blue-600">{uploadResult.stats.updated}</p>
                                            </div>
                                            <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500">Created</p>
                                                <p className="text-lg font-bold text-green-600">{uploadResult.stats.created}</p>
                                            </div>
                                            {uploadResult.stats.errors > 0 && (
                                                <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
                                                    <p className="text-xs text-gray-500">Errors</p>
                                                    <p className="text-lg font-bold text-red-600">{uploadResult.stats.errors}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                                        <div className="mt-3 bg-white p-3 rounded border border-red-200">
                                            <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                                            <ul className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                                                {uploadResult.errors.map((err, i) => (
                                                    <li key={i}>• {err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Recent Uploads</h3>
                        <button
                            onClick={() => {
                                fetchUploadLogs()
                                fetchSnapshots()
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {uploadLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No upload history yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {uploadLogs.map((log) => (
                                <div key={log.id} className="p-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-10 h-10 text-green-600 p-2 bg-green-50 rounded-lg" />
                                            <div>
                                                <p className="font-medium text-gray-900">{log.fileName}</p>
                                                <p className="text-sm text-gray-500">{formatDate(log.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-3 text-sm">
                                                <span className="text-blue-600">{log.productsUpdated} updated</span>
                                                <span className="text-green-600">{log.productsCreated} created</span>
                                                {log.errors && (
                                                    <span className="text-red-600">{(log.errors as string[]).length} errors</span>
                                                )}
                                            </div>
                                            {expandedLog === log.id ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {expandedLog === log.id && log.errors && (
                                        <div className="mt-3 ml-13 bg-red-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                                            <ul className="text-sm text-red-600 space-y-1">
                                                {(log.errors as string[]).map((err, i) => (
                                                    <li key={i}>• {err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rollback Section */}
            {activeSection === 'rollback' && (
                <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-4 border-b">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">Restore Previous Inventory State</h3>
                                <p className="text-sm text-gray-600">
                                    Select a snapshot to restore your inventory to a previous state. This will update all products
                                    to their values at that time and recreate any deleted products.
                                </p>
                            </div>
                        </div>
                    </div>

                    {snapshots.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No snapshots available</p>
                            <p className="text-sm">Snapshots are created automatically before each upload</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {snapshots.map((snapshot) => (
                                <div key={snapshot.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-10 h-10 text-blue-600 p-2 bg-blue-50 rounded-lg" />
                                        <div>
                                            <p className="font-medium text-gray-900">{snapshot.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(snapshot.createdAt)} • {snapshot.productCount} products
                                            </p>
                                        </div>
                                    </div>

                                    {confirmRollback === snapshot.id ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-amber-600 font-medium">Confirm rollback?</span>
                                            <button
                                                onClick={() => handleRollback(snapshot.id)}
                                                disabled={isLoading}
                                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg disabled:opacity-50"
                                            >
                                                {isLoading ? 'Processing...' : 'Yes, Restore'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmRollback(null)}
                                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmRollback(snapshot.id)}
                                            className="flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Restore
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
