'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Edit2,
    Trash2,
    Upload,
    X,
    Eye,
    EyeOff,
    MoveUp,
    MoveDown,
    Image as ImageIcon,
    ExternalLink,
    Save
} from 'lucide-react'
import { useDialog } from '@/components/providers/DialogProvider'

interface Banner {
    id: string
    title: string
    subtitle?: string
    image: string
    link?: string
    ctaText?: string
    type: 'HERO' | 'CATEGORY' | 'PROMOTIONAL'
    order: number
    isActive: boolean
}

export default function BannerManager() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const { showSuccess, showError, showConfirm } = useDialog()

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        ctaText: '',
        type: 'PROMOTIONAL' as Banner['type'],
        order: 0,
        isActive: true
    })

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners')
            if (res.ok) {
                const data = await res.json()
                setBanners(data)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showError('Please select an image file')
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            showError('Image size should be less than 2MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            setImagePreview(result)
            setFormData(prev => ({ ...prev, image: result }))
        }
        reader.onerror = () => {
            showError('Failed to read image file')
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.image) {
            showError('Title and image are required')
            return
        }

        try {
            const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
            const method = editingBanner ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                showSuccess(editingBanner ? 'Banner updated!' : 'Banner created!')
                resetForm()
                fetchBanners()
            } else {
                showError('Failed to save banner')
            }
        } catch (error) {
            showError('Error saving banner')
        }
    }

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner)
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            image: banner.image,
            link: banner.link || '',
            ctaText: banner.ctaText || '',
            type: banner.type,
            order: banner.order,
            isActive: banner.isActive
        })
        setImagePreview(banner.image)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Delete this banner?', {
            title: 'Delete Banner',
            confirmText: 'Delete',
            variant: 'error'
        })
        if (!confirmed) return

        try {
            const res = await fetch(`/api/admin/banners/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                showSuccess('Banner deleted!')
                fetchBanners()
            } else {
                showError('Failed to delete banner')
            }
        } catch (error) {
            showError('Error deleting banner')
        }
    }

    const toggleActive = async (banner: Banner) => {
        try {
            const res = await fetch(`/api/admin/banners/${banner.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !banner.isActive })
            })

            if (res.ok) {
                showSuccess(banner.isActive ? 'Banner hidden' : 'Banner activated')
                fetchBanners()
            } else {
                showError('Failed to update banner')
            }
        } catch (error) {
            showError('Error updating banner')
        }
    }

    const updateOrder = async (id: string, direction: 'up' | 'down') => {
        const index = banners.findIndex(b => b.id === id)
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === banners.length - 1)) {
            return
        }

        const newBanners = [...banners]
        const swapIndex = direction === 'up' ? index - 1 : index + 1
            ;[newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]]

        // Update order values
        const updates = newBanners.map((b, i) => ({
            id: b.id,
            order: i
        }))

        try {
            await Promise.all(updates.map(u =>
                fetch(`/api/admin/banners/${u.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: u.order })
                })
            ))
            fetchBanners()
        } catch (error) {
            showError('Error updating order')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            image: '',
            link: '',
            ctaText: '',
            type: 'PROMOTIONAL',
            order: banners.length,
            isActive: true
        })
        setImagePreview('')
        setEditingBanner(null)
        setShowForm(false)
    }

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            HERO: 'bg-purple-100 text-purple-700',
            CATEGORY: 'bg-blue-100 text-blue-700',
            PROMOTIONAL: 'bg-green-100 text-green-700'
        }
        return colors[type] || 'bg-gray-100 text-gray-700'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Banners Management</h2>
                    <p className="text-gray-600">{banners.length} total banners</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                    {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {showForm ? 'Cancel' : 'Add Banner'}
                </button>
            </div>

            {/* Banner Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                        {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Banner title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Subtitle</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Optional subtitle"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Link</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="/category/dairy"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">CTA Text</label>
                                <input
                                    type="text"
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Shop Now"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Banner['type'] }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="HERO">Hero</option>
                                    <option value="CATEGORY">Category</option>
                                    <option value="PROMOTIONAL">Promotional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                                <select
                                    value={formData.isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Banner Image *</label>
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                            <p className="text-xs text-gray-400">Max size: 2MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-48 h-32 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview('')
                                                setFormData(prev => ({ ...prev, image: '' }))
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                            >
                                <Save className="w-4 h-4" />
                                {editingBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banners List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>No banners yet. Create your first banner!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 p-4">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`border rounded-lg p-4 flex gap-4 ${banner.isActive ? 'bg-white' : 'bg-gray-50 opacity-75'
                                    }`}
                            >
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{banner.title}</h4>
                                            {banner.subtitle && (
                                                <p className="text-sm text-gray-600">{banner.subtitle}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadge(banner.type)}`}>
                                                    {banner.type}
                                                </span>
                                                {banner.link && (
                                                    <a
                                                        href={banner.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {banner.link}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => updateOrder(banner.id, 'up')}
                                                disabled={index === 0}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <MoveUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => updateOrder(banner.id, 'down')}
                                                disabled={index === banners.length - 1}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <MoveDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(banner)}
                                                className={`p-2 rounded-lg ${banner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={banner.isActive ? 'Hide' : 'Show'}
                                            >
                                                {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(banner)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
