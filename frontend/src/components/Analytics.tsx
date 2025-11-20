'use client'
import { useEffect, useState } from 'react'
import { DollarSign, ShoppingCart, TrendingUp, Users, Utensils } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { User, Order, Restaurant, AnalyticsData, OrderStatus } from '../types'
import { ordersAPI } from '../services/api'

interface AnalyticsProps {
    user: User
    orders: Order[]
    restaurants: Restaurant[]
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

export default function Analytics({ user, orders, restaurants }: AnalyticsProps) {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        calculateAnalytics()
    }, [orders, restaurants])

    const calculateAnalytics = () => {
        try {
            // Calculate analytics from orders data
            const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0)
            const totalOrders = orders.length
            const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

            // Orders by status
            const ordersByStatus = Object.entries(
                orders.reduce((acc: Record<string, number>, order: Order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1
                    return acc
                }, {} as Record<string, number>)
            ).map(([status, count]) => ({ status: status as OrderStatus, count }))

            // Revenue by day (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - i)
                return date.toISOString().split('T')[0]
            }).reverse()

            const revenueByDay = last7Days.map(day => {
                const dayRevenue = orders
                    .filter((order: Order) => order.createdAt.startsWith(day))
                    .reduce((sum: number, order: Order) => sum + order.totalAmount, 0)
                return {
                    day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: dayRevenue
                }
            })

            // Popular items
            const popularItems = Object.entries(
                orders.flatMap((order: Order) =>
                    order.items.map((item: any) => item.menuItem.name)
                ).reduce((acc: Record<string, number>, name: string) => {
                    acc[name] = (acc[name] || 0) + 1
                    return acc
                }, {} as Record<string, number>)
            )
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)

            setAnalyticsData({
                totalRevenue,
                totalOrders,
                averageOrderValue,
                ordersByStatus,
                revenueByDay,
                popularItems
            })
        } catch (error) {
            console.error('Error calculating analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const stats = [
        {
            name: 'Total Revenue',
            value: `$${analyticsData?.totalRevenue.toFixed(2) || '0.00'}`,
            change: '+12.5%',
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            name: 'Total Orders',
            value: analyticsData?.totalOrders.toString() || '0',
            change: '+8.2%',
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            name: 'Avg Order Value',
            value: `$${analyticsData?.averageOrderValue.toFixed(2) || '0.00'}`,
            change: '+3.1%',
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            name: 'Restaurants',
            value: restaurants.length.toString(),
            change: '+2.1%',
            icon: Utensils,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <p className={`text-sm ${stat.color} mt-1 flex items-center gap-1`}>
                                    <TrendingUp className="h-4 w-4" />
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData?.revenueByDay || []}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: any) => [`$${value}`, 'Revenue']}
                                labelFormatter={(label: any) => `Day: ${label}`}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                name="Revenue"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders by Status */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analyticsData?.ordersByStatus || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="count"
                            >
                                {analyticsData?.ordersByStatus.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {analyticsData?.ordersByStatus.map((status: any, index: number) => (
                            <div key={status.status} className="flex items-center text-sm">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: COLORS[index] }}
                                />
                                <span className="capitalize">{status.status.toLowerCase()}:</span>
                                <span className="font-semibold ml-1">{status.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Items</h3>
                <div className="space-y-3">
                    {analyticsData?.popularItems.map((item: any, index: number) => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    #{index + 1}
                                </div>
                                <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-gray-900">{item.count} orders</div>
                                <div className="text-sm text-gray-500">
                                    {((item.count / (analyticsData?.totalOrders || 1)) * 100).toFixed(1)}% of total
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!analyticsData?.popularItems || analyticsData.popularItems.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                            No order data available
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {orders.slice(0, 5).map((order: Order) => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex items-center space-x-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(-6)}</p>
                                    <p className="text-sm text-gray-500">by {order.user.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No recent activity
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}