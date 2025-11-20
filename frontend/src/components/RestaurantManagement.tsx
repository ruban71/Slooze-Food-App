'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, MapPin, Loader } from 'lucide-react'
import { User, Restaurant, Country } from '../types'
import { restaurantsAPI } from '../services/api'

interface RestaurantManagementProps {
    user: User
    restaurants: Restaurant[]
    onRestaurantsChange: (restaurants: Restaurant[]) => void
}

export default function RestaurantManagement({ user, restaurants, onRestaurantsChange }: RestaurantManagementProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Filter restaurants based on user's country and search term
    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesCountry = user.role === 'ADMIN' || restaurant.country === user.country
        const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCountry && matchesSearch
    })

    const canModifyRestaurants = user.role === 'ADMIN' || user.role === 'MANAGER'

    const handleAddRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'menuItems'>) => {
        try {
            setLoading(true)
            setError('')

            console.log('📤 Adding new restaurant:', restaurantData)

            const newRestaurant = await restaurantsAPI.create(restaurantData)
            console.log('✅ Restaurant created:', newRestaurant)

            onRestaurantsChange([newRestaurant, ...restaurants])
            setShowAddForm(false)

        } catch (err: any) {
            console.error('❌ Error adding restaurant:', err)
            setError(err.response?.data?.message || 'Failed to add restaurant')
        } finally {
            setLoading(false)
        }
    }

    const handleEditRestaurant = async (restaurant: Restaurant) => {
        try {
            setLoading(true)
            setError('')

            console.log('📤 Updating restaurant:', restaurant)

            const updatedRestaurant = await restaurantsAPI.update(restaurant.id, {
                name: restaurant.name,
                description: restaurant.description,
                image: restaurant.image,
                country: restaurant.country
            })
            console.log('✅ Restaurant updated:', updatedRestaurant)

            onRestaurantsChange(restaurants.map(r => r.id === restaurant.id ? updatedRestaurant : r))
            setEditingRestaurant(null)

        } catch (err: any) {
            console.error('❌ Error updating restaurant:', err)
            setError(err.response?.data?.message || 'Failed to update restaurant')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRestaurant = async (id: string) => {
        if (!confirm('Are you sure you want to delete this restaurant?')) return

        try {
            setLoading(true)
            setError('')

            console.log('🗑️ Deleting restaurant:', id)

            await restaurantsAPI.delete(id)
            console.log('✅ Restaurant deleted')

            onRestaurantsChange(restaurants.filter(r => r.id !== id))

        } catch (err: any) {
            console.error('❌ Error deleting restaurant:', err)
            setError(err.response?.data?.message || 'Failed to delete restaurant')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
                    <p className="text-gray-600">Manage restaurants and menu items</p>
                </div>

                {canModifyRestaurants && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Restaurant
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Processing...</span>
                </div>
            )}

            {/* Restaurants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-200 relative">
                            <img
                                src={restaurant.image || '/api/placeholder/300/200'}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop'
                                }}
                            />
                            <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium shadow-sm">
                                ⭐ 4.5
                            </div>
                            <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                {restaurant.country}
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900">{restaurant.name}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{restaurant.description}</p>
                            <p className="text-gray-500 text-sm mt-2">🕒 25-35 min</p>

                            {canModifyRestaurants && (
                                <div className="flex space-x-2 mt-4">
                                    <button
                                        onClick={() => setEditingRestaurant(restaurant)}
                                        disabled={loading}
                                        className="flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                                    >
                                        <Edit2 className="h-3 w-3 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                                        disabled={loading}
                                        className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredRestaurants.length === 0 && !loading && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants found</h3>
                    <p className="text-gray-600">
                        {searchTerm ? 'No restaurants match your search.' : 'No restaurants available.'}
                    </p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddForm || editingRestaurant) && (
                <RestaurantForm
                    restaurant={editingRestaurant}
                    onSubmit={editingRestaurant ? handleEditRestaurant : handleAddRestaurant}
                    onCancel={() => {
                        setShowAddForm(false)
                        setEditingRestaurant(null)
                        setError('')
                    }}
                    userCountry={user.country}
                    loading={loading}
                />
            )}
        </div>
    )
}

// Restaurant Form Component
interface RestaurantFormProps {
    restaurant?: Restaurant | null
    onSubmit: (restaurant: any) => void
    onCancel: () => void
    userCountry: string
    loading: boolean
}

function RestaurantForm({ restaurant, onSubmit, onCancel, userCountry, loading }: RestaurantFormProps) {
    const [formData, setFormData] = useState({
        name: restaurant?.name || '',
        description: restaurant?.description || '',
        image: restaurant?.image || '',
        country: restaurant?.country || userCountry,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter restaurant name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter restaurant description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value as Country }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            <option value="INDIA">India</option>
                            <option value="AMERICA">America</option>
                        </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-black py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Processing...' : (restaurant ? 'Update' : 'Create')} Restaurant
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}