'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>
  initialData?: any
  categories: Array<{ id: string; name: string }>
  onCancel?: () => void
}

export interface ProductFormData {
  name: string
  description: string
  categoryId: string
  price: number
  originalPrice?: number
  unit: string
  stock: number
  images: string[]
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  deliveryTime: number
}

export default function ProductForm({ onSubmit, initialData, categories, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || initialData?.category?.id || '',
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice,
    unit: initialData?.unit || '',
    stock: initialData?.stock || 0,
    images: initialData?.images || [],
    tags: initialData?.tags || [],
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    deliveryTime: initialData?.deliveryTime || 24,
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const addImage = (url: string) => {
    setFormData({ ...formData, images: [...formData.images, url] })
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Max size is 5MB`)
          continue
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          addImage(base64String)
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          placeholder="e.g., Amul Gold Full Cream Milk"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          placeholder="Product description..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select
          required
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price & Original Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price (₹) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Original Price (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.originalPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Unit & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Unit *</label>
          <input
            type="text"
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            placeholder="e.g., 500 ml, 1 kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Stock *</label>
          <input
            type="number"
            required
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Delivery Time */}
      <div>
        <label className="block text-sm font-medium mb-2">Delivery Time (minutes)</label>
        <input
          type="number"
          min="1"
          value={formData.deliveryTime}
          onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Images</label>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {formData.images.map((img, index) => (
            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
              <Image 
                src={img} 
                alt={`Product ${index + 1}`} 
                fill 
                className="object-cover"
                unoptimized={img.startsWith('data:')}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Upload from device */}
        <div className="mb-4">
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition">
            <div className="flex items-center gap-2 text-gray-600">
              <Upload className="w-5 h-5" />
              <span className="font-medium">
                {uploading ? 'Uploading...' : 'Upload from Device'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Click to upload images (max 5MB each, supports multiple files)
          </p>
        </div>

        {/* Image URL input */}
        <div>
          <input
            type="text"
            placeholder="Or paste image URL"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addImage(e.currentTarget.value)
                e.currentTarget.value = ''
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">Press Enter to add image URL</p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Add tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Add
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Active</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Featured</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
