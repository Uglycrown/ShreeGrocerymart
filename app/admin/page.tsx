'use client'

import { useState, useEffect } from 'react'
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm'
import CategoryManager from '@/components/admin/CategoryManager'
import OrdersManager from '@/components/admin/OrdersManager'
import Dashboard from '@/components/admin/Dashboard'
import CustomerManager from '@/components/admin/CustomerManager'
import { useDialog } from '@/components/providers/DialogProvider'
import {
  Package,
  Plus,
  Tag,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ShoppingBag,
  LayoutDashboard,
  Users,
  Menu,
  X,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react'

type Tab = 'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'customers'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  priority: number
  isActive: boolean
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Product filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const { showConfirm, showSuccess, showError } = useDialog()

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  // Filter products whenever filters change
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.categoryId === categoryFilter)
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock < 10)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.stock === 0)
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, categoryFilter, stockFilter])

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
        showSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        setShowProductForm(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        showError('Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      showError('Error saving product')
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    const confirmed = await showConfirm('Are you sure you want to delete this product?', {
      title: 'Delete Product',
      confirmText: 'Delete',
      variant: 'error'
    })
    if (!confirmed) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        showSuccess('Product deleted successfully!')
        fetchProducts()
      } else {
        showError('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Error deleting product')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    const confirmed = await showConfirm(`Delete ${selectedProducts.length} products?`, {
      title: 'Bulk Delete',
      confirmText: 'Delete All',
      variant: 'error'
    })
    if (!confirmed) return

    try {
      await Promise.all(
        selectedProducts.map(id =>
          fetch(`/api/products/${id}`, { method: 'DELETE' })
        )
      )
      showSuccess(`${selectedProducts.length} products deleted!`)
      setSelectedProducts([])
      fetchProducts()
    } catch (error) {
      showError('Error deleting products')
    }
  }

  const handleCloseForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
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
        showSuccess('Banner created successfully!')
        e.currentTarget.reset()
      } else {
        showError('Failed to create banner')
      }
    } catch (error) {
      console.error('Error creating banner:', error)
      showError('Error creating banner')
    }
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Out of Stock</span>
    if (stock < 10) return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">Low: {stock}</span>
    return <span className="text-gray-800">{stock}</span>
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: newOrdersCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 lg:z-10
          w-64 bg-white shadow-lg transform transition-transform duration-300
          h-screen overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Shree Grocery Mart</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${activeTab === item.id
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.badge && item.badge > 0 && activeTab !== item.id && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 pt-20 lg:p-8 min-h-screen">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigate={(tab) => setActiveTab(tab as Tab)} />
          )}

          {activeTab === 'customers' && (
            <CustomerManager />
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
                  <p className="text-gray-600">{filteredProducts.length} of {products.length} products</p>
                </div>
                <button
                  onClick={() => {
                    setShowProductForm(!showProductForm)
                    setEditingProduct(null)
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <Plus className="w-5 h-5" />
                  {showProductForm ? 'Hide Form' : 'Add Product'}
                </button>
              </div>

              {showProductForm ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <ProductForm
                    onSubmit={handleProductSubmit}
                    categories={categories}
                    initialData={editingProduct}
                    onCancel={handleCloseForm}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm">
                  {/* Filters */}
                  <div className="p-4 border-b flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                    >
                      <option value="all">All Stock</option>
                      <option value="low">Low Stock (&lt;10)</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>

                  {/* Bulk Actions */}
                  {selectedProducts.length > 0 && (
                    <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
                      <span className="text-blue-700 font-medium">
                        {selectedProducts.length} products selected
                      </span>
                      <button
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </button>
                    </div>
                  )}

                  {/* Product Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <button onClick={toggleSelectAll} className="p-1">
                              {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? (
                                <CheckSquare className="w-5 h-5 text-green-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleProductSelection(product.id)}
                                className="p-1"
                              >
                                {selectedProducts.includes(product.id) ? (
                                  <CheckSquare className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              {product.images?.[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-14 h-14 object-cover rounded-lg"
                                />
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.unit}</div>
                            </td>
                            <td className="px-4 py-4 text-gray-600">
                              {product.category?.name || 'N/A'}
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-gray-900">₹{product.price}</div>
                              {product.originalPrice && (
                                <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
                              )}
                            </td>
                            <td className="px-4 py-4">{getStockBadge(product.stock)}</td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      {products.length === 0
                        ? 'No products found. Create your first product!'
                        : 'No products match your filters'
                      }
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
            <OrdersManager onUpdate={() => { }} onNewOrdersCountChange={setNewOrdersCount} />
          )}

          {activeTab === 'banners' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Banners Management</h2>

              <form onSubmit={handleBannerCreate} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Stock up on daily essentials"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Additional description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Image URL *</label>
                  <input
                    type="text"
                    name="image"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/banner.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Link</label>
                  <input
                    type="text"
                    name="link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="/category/dairy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">CTA Text</label>
                  <input
                    type="text"
                    name="ctaText"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Type</label>
                  <select
                    name="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="HERO">Hero</option>
                    <option value="CATEGORY">Category</option>
                    <option value="PROMOTIONAL">Promotional</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Create Banner
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
