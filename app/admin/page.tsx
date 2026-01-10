'use client'

import { useState, useEffect } from 'react'
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm'
import CategoryManager from '@/components/admin/CategoryManager'
import OrdersManager from '@/components/admin/OrdersManager'
import { Package, Plus, List, Tag, Image as ImageIcon, Edit2, Trash2, ShoppingBag } from 'lucide-react'

type Tab = 'products' | 'categories' | 'banners' | 'orders'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('products')
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [products, setProducts] = useState<any[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleProductSubmit = async (data: ProductFormData) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        setShowProductForm(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        alert('Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Product deleted successfully!')
        fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleCloseForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
  }

  const handleCategoryCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          image: formData.get('image'),
          icon: formData.get('icon'),
          description: formData.get('description'),
        }),
      })

      if (res.ok) {
        alert('Category created successfully!')
        e.currentTarget.reset()
        fetchCategories()
      } else {
        alert('Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error creating category')
    }
  }

  const handleBannerCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          subtitle: formData.get('subtitle'),
          image: formData.get('image'),
          link: formData.get('link'),
          ctaText: formData.get('ctaText'),
          type: formData.get('type'),
        }),
      })

      if (res.ok) {
        alert('Banner created successfully!')
        e.currentTarget.reset()
      } else {
        alert('Failed to create banner')
      }
    } catch (error) {
      console.error('Error creating banner:', error)
      alert('Error creating banner')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your e-commerce store</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tag className="w-5 h-5" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'banners'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Banners
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
                <button
                  onClick={() => {
                    setShowProductForm(!showProductForm)
                    setEditingProduct(null)
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus className="w-5 h-5" />
                  {showProductForm ? 'Hide Form' : 'Add Product'}
                </button>
              </div>

              {showProductForm ? (
                <ProductForm 
                  onSubmit={handleProductSubmit} 
                  categories={categories}
                  initialData={editingProduct}
                  onCancel={handleCloseForm}
                />
              ) : (
                <div>
                  <div className="mb-4 text-gray-600">Total Products: {products.length}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              {product.images && product.images[0] && (
                                <div className="w-16 h-16 relative">
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-600">{product.unit}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {product.category?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">₹{product.price}</div>
                              {product.originalPrice && (
                                <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No products found. Create your first product!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <CategoryManager categories={categories} onUpdate={fetchCategories} />
          )}

          {activeTab === 'orders' && (
            <OrdersManager onUpdate={() => {}} />
          )}

          {activeTab === 'banners' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Banners Management</h2>
              
              <form onSubmit={handleBannerCreate} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Stock up on daily essentials"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Additional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL *</label>
                  <input
                    type="text"
                    name="image"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://example.com/banner.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link</label>
                  <input
                    type="text"
                    name="link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="/category/dairy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CTA Text</label>
                  <input
                    type="text"
                    name="ctaText"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    name="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="HERO">Hero</option>
                    <option value="CATEGORY">Category</option>
                    <option value="PROMOTIONAL">Promotional</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Create Banner
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
