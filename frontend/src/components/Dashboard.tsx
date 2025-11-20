'use client'
import { useState, useEffect } from 'react'
import {
    BarChart3,
    Users,
    Utensils,
    DollarSign,
    LogOut,
    ShoppingCart,
    CreditCard,
    TrendingUp,
    Package
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import RestaurantManagement from './RestaurantManagement'
import OrderManagement from './OrderManagement'
import PaymentMethods from './PaymentMethods'
import Analytics from './Analytics'
import { Restaurant, Order, Payment } from '../types'
import { restaurantsAPI, ordersAPI, paymentsAPI } from '../services/api'

type Tab = 'analytics' | 'restaurants' | 'orders' | 'payments'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('analytics')
    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');
        console.log('🔍 Token in localStorage:', token);
        console.log('🔍 User in localStorage:', userData);
    }, []);

    console.log('🔍 Dashboard: Current user:', user)
    console.log('🔍 Dashboard: Loading state:', loading)

    useEffect(() => {
        if (user) {
            console.log('🔍 Dashboard: User exists, fetching data...')
            fetchData()
        }
    }, [user])

    const fetchData = async () => {
        try {
            console.log('🔍 Starting data fetch...')
            setLoading(true)

            const token = localStorage.getItem('access_token')
            console.log('🔍 Token available for API calls:', !!token)

            const [restaurantsData, ordersData, paymentsData] = await Promise.all([
                restaurantsAPI.getAll().catch(err => {
                    console.error('❌ Error fetching restaurants:', err)
                    return []
                }),
                ordersAPI.getAll().catch(err => {
                    console.error('❌ Error fetching orders:', err)
                    return []
                }),
                user?.role === 'ADMIN' ? paymentsAPI.getAll().catch(err => {
                    console.error('❌ Error fetching payments:', err)
                    return []
                }) : Promise.resolve([])
            ])

            console.log('✅ Restaurants fetched:', restaurantsData.length)
            console.log('✅ Orders fetched:', ordersData.length)
            console.log('✅ Payments fetched:', paymentsData.length)

            setRestaurants(restaurantsData)
            setOrders(ordersData)
            setPayments(paymentsData)
        } catch (error) {
            console.error('❌ Error in fetchData:', error)
        } finally {
            setLoading(false)
            console.log('🔍 Data fetch completed')
        }
    }

    const tabs = [
        { id: 'analytics' as Tab, name: 'Analytics', icon: BarChart3, allowed: true },
        { id: 'restaurants' as Tab, name: 'Restaurants', icon: Utensils, allowed: true },
        { id: 'orders' as Tab, name: 'Orders', icon: ShoppingCart, allowed: true },
        { id: 'payments' as Tab, name: 'Payments', icon: CreditCard, allowed: user?.role === 'ADMIN' },
    ]

    const stats = [
        {
            name: 'Total Revenue',
            value: `$${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}`,
            change: '+12.5%',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            name: 'Total Orders',
            value: orders.length.toString(),
            change: '+8.2%',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            name: 'Restaurants',
            value: restaurants.length.toString(),
            change: '+2.1%',
            icon: Utensils,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            name: 'Active Users',
            value: '1,234',
            change: '+3.4%',
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
    ]

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            )
        }

        switch (activeTab) {
            case 'analytics':
                return <Analytics user={user!} orders={orders} restaurants={restaurants} />
            case 'restaurants':
                return (
                    <RestaurantManagement
                        user={user!}
                        restaurants={restaurants}
                        onRestaurantsChange={setRestaurants}
                    />
                )
            case 'orders':
                return (
                    <OrderManagement
                        user={user!}
                        orders={orders}
                        onOrdersChange={setOrders}
                        restaurants={restaurants}
                    />
                )
            case 'payments':
                return (
                    <PaymentMethods
                        user={user!}
                        payments={payments}
                        onPaymentsChange={setPayments}
                    />
                )
            default:
                return <Analytics user={user!} orders={orders} restaurants={restaurants} />
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-black font-bold text-lg">🍕</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Slooze Food</h1>
                                <p className="text-sm text-gray-500">Food ordering platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user.role.toLowerCase()} • {user.country}
                                </p>
                            </div>

                            <div className="w-px h-8 bg-gray-300"></div>

                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    <p className={`text-sm ${stat.color} mt-1 flex items-center gap-1`}>
                                        <TrendingUp className="h-4 w-4" />
                                        {stat.change} from last week
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.filter(tab => tab.allowed).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                {renderContent()}
            </div>
        </div>
    )
}