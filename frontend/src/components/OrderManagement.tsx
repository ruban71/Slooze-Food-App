'use client'
import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, X, Search, Clock, CheckCircle, Truck, Ban } from 'lucide-react'
import { User, Order, Restaurant, MenuItem, CreateOrderData } from '../types'
import { ordersAPI, restaurantsAPI } from '../services/api'

interface OrderManagementProps {
    user: User
    orders: Order[]
    onOrdersChange: (orders: Order[]) => void
    restaurants: Restaurant[]
}

interface CartItem {
    menuItem: MenuItem
    quantity: number
}

export default function OrderManagement({ user, orders, onOrdersChange, restaurants }: OrderManagementProps) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])

    const canPlaceOrder = user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'MEMBER'
    const canCancelOrder = user.role === 'ADMIN' || user.role === 'MANAGER'

    useEffect(() => {
        fetchMenuItems()
    }, [restaurants])

    const fetchMenuItems = async () => {
        try {
            // Get all menu items from restaurants
            const allMenuItems = restaurants.flatMap(restaurant => restaurant.menuItems)
            setMenuItems(allMenuItems)
        } catch (error) {
            console.error('Error fetching menu items:', error)
        }
    }

    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const addToCart = (menuItem: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(item => item.menuItem.id === menuItem.id)
            if (existing) {
                return prev.map(item =>
                    item.menuItem.id === menuItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { menuItem, quantity: 1 }]
        })
    }

    const removeFromCart = (menuItemId: string) => {
        setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId))
    }

    const updateQuantity = (menuItemId: string, quantity: number) => {
        if (quantity === 0) {
            removeFromCart(menuItemId)
            return
        }
        setCart(prev =>
            prev.map(item =>
                item.menuItem.id === menuItemId ? { ...item, quantity } : item
            )
        )
    }

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
    }

    const placeOrder = async () => {
        if (cart.length === 0) return

        try {
            setLoading(true)
            const orderData: any = {
                items: cart.map(item => ({
                    menuItemId: item.menuItem.id,
                    quantity: item.quantity
                }))
            }

            const newOrder = await ordersAPI.create(orderData)

            // Update orders list
            onOrdersChange([newOrder, ...orders])

            // Clear cart and switch to orders tab
            setCart([])
            setActiveTab('orders')
        } catch (error) {
            console.error('Error placing order:', error)
            alert('Failed to place order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const cancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order?')) return

        try {
            await ordersAPI.cancel(orderId)

            // Update orders list
            onOrdersChange(orders.filter(order => order.id !== orderId))
        } catch (error) {
            console.error('Error cancelling order:', error)
            alert('Failed to cancel order. Please try again.')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />
            case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-blue-600" />
            case 'DELIVERED': return <Truck className="h-4 w-4 text-green-600" />
            case 'CANCELLED': return <Ban className="h-4 w-4 text-red-600" />
            default: return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800'
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
            case 'DELIVERED': return 'bg-green-100 text-green-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'menu'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Menu Items
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'orders'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Orders ({orders.length})
                    </button>

                    {/* Cart Summary */}
                    {activeTab === 'menu' && cart.length > 0 && (
                        <div className="flex-1 flex items-center justify-end space-x-4 py-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ShoppingCart className="h-5 w-5" />
                                <span>{cart.length} items</span>
                                <span className="font-semibold">${getTotal().toFixed(2)}</span>
                            </div>
                            {canPlaceOrder && (
                                <button
                                    onClick={placeOrder}
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                </button>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            {activeTab === 'menu' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Menu Items */}
                    <div className="lg:col-span-2">
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredMenuItems.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-green-600 font-semibold mt-2">${item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(item)}
                                            disabled={!canPlaceOrder}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ml-4"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredMenuItems.length === 0 && (
                                <div className="col-span-2 text-center py-12 text-gray-500">
                                    No menu items found matching your search.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit sticky top-6">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900">Your Cart</h3>
                        {cart.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>Your cart is empty</p>
                                <p className="text-sm mt-1">Add items from the menu to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.menuItem.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900">{item.menuItem.name}</p>
                                            <p className="text-gray-600 text-sm">${item.menuItem.price} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.menuItem.id)}
                                                className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total:</span>
                                        <span>${getTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Orders List */
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Placed by: {order.user.name}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(order.status)}
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {canCancelOrder && order.status === 'PENDING' && (
                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm py-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500">{item.quantity}x</span>
                                            <span className="font-medium text-gray-900">{item.menuItem.name}</span>
                                        </div>
                                        <span className="font-semibold">
                                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Order ID: {order.id}
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Total Amount</div>
                                    <div className="text-xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center py-12">
                            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-600">Start by placing your first order from the menu!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}