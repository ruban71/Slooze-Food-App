'use client'
import { useState } from 'react'
import { Plus, Edit2, Trash2, CreditCard, Wallet, Building, CheckCircle } from 'lucide-react'
import { User, Payment, PaymentMethod, CreatePaymentData } from '../types'
import { paymentsAPI } from '../services/api'

interface PaymentMethodsProps {
    user: User
    payments: Payment[]
    onPaymentsChange: (payments: Payment[]) => void
}

export default function PaymentMethods({ user, payments, onPaymentsChange }: PaymentMethodsProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
    const [loading, setLoading] = useState(false)

    const canModifyPayments = user.role === 'ADMIN'

    const handleAddPayment = async (paymentData: CreatePaymentData) => {
        try {
            setLoading(true)
            const newPayment = await paymentsAPI.create(paymentData)
            onPaymentsChange([...payments, newPayment])
            setShowAddForm(false)
        } catch (error) {
            console.error('Error adding payment method:', error)
            alert('Failed to add payment method. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleEditPayment = async (payment: Payment) => {
        try {
            setLoading(true)
            const updatedPayment = await paymentsAPI.update(payment.id, payment)
            onPaymentsChange(payments.map(p => p.id === payment.id ? updatedPayment : p))
            setEditingPayment(null)
        } catch (error) {
            console.error('Error updating payment method:', error)
            alert('Failed to update payment method. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePayment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return

        try {
            await paymentsAPI.delete(id)
            onPaymentsChange(payments.filter(p => p.id !== id))
        } catch (error) {
            console.error('Error deleting payment method:', error)
            alert('Failed to delete payment method. Please try again.')
        }
    }

    const handleSetDefault = async (id: string) => {
        try {
            const updatedPayment = await paymentsAPI.setDefault(id)
            onPaymentsChange(
                payments.map(p =>
                    p.id === id
                        ? updatedPayment
                        : { ...p, isDefault: false }
                )
            )
        } catch (error) {
            console.error('Error setting default payment:', error)
            alert('Failed to set default payment method. Please try again.')
        }
    }

    const getPaymentIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'CREDIT_CARD':
            case 'DEBIT_CARD':
                return <CreditCard className="h-6 w-6" />
            case 'UPI':
                return <Wallet className="h-6 w-6" />
            case 'PAYPAL':
                return <Building className="h-6 w-6" />
            default:
                return <CreditCard className="h-6 w-6" />
        }
    }

    const getPaymentLabel = (payment: Payment) => {
        switch (payment.method) {
            case 'CREDIT_CARD':
            case 'DEBIT_CARD':
                return `${payment.method.replace('_', ' ')} •••• ${payment.lastFour}`
            case 'UPI':
                return `UPI ID: ${payment.upiId}`
            case 'PAYPAL':
                return `PayPal: ${payment.paypalEmail}`
            default:
                return payment.method
        }
    }

    if (!canModifyPayments) {
        return (
            <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">
                    Only administrators can manage payment methods.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                    <p className="text-gray-600">Manage your payment options</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center px-6 py-3 bg-blue-600 text-black rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Payment Method
                </button>
            </div>

            {/* Payment Methods List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {payments.map((payment) => (
                    <div key={payment.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${payment.isDefault ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {getPaymentIcon(payment.method)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {getPaymentLabel(payment)}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {payment.isDefault && (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Default
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500 capitalize">
                                            {payment.method.replace('_', ' ').toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                {!payment.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(payment.id)}
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditingPayment(payment)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeletePayment(payment.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {payments.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                        <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h3>
                        <p className="text-gray-600">Add your first payment method to get started.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(showAddForm || editingPayment) && (
                <PaymentMethodForm
                    payment={editingPayment}
                    onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
                    onCancel={() => {
                        setShowAddForm(false)
                        setEditingPayment(null)
                    }}
                    loading={loading}
                />
            )}
        </div>
    )
}

// Payment Method Form Component
interface PaymentMethodFormProps {
    payment?: Payment | null
    onSubmit: (payment: any) => void
    onCancel: () => void
    loading: boolean
}

function PaymentMethodForm({ payment, onSubmit, onCancel, loading }: PaymentMethodFormProps) {
    const [formData, setFormData] = useState({
        method: payment?.method || 'CREDIT_CARD' as PaymentMethod,
        lastFour: payment?.lastFour || '',
        upiId: payment?.upiId || '',
        paypalEmail: payment?.paypalEmail || '',
        isDefault: payment?.isDefault || false
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const submitData: CreatePaymentData = {
            method: formData.method,
            isDefault: formData.isDefault,
            ...(formData.method.includes('CARD') && { lastFour: formData.lastFour }),
            ...(formData.method === 'UPI' && { upiId: formData.upiId }),
            ...(formData.method === 'PAYPAL' && { paypalEmail: formData.paypalEmail }),
        }

        onSubmit(submitData)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {payment ? 'Edit Payment Method' : 'Add New Payment Method'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                        >
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="DEBIT_CARD">Debit Card</option>
                            <option value="UPI">UPI</option>
                            <option value="PAYPAL">PayPal</option>
                        </select>
                    </div>

                    {formData.method.includes('CARD') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last 4 Digits
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={4}
                                pattern="[0-9]{4}"
                                value={formData.lastFour}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastFour: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="4242"
                            />
                        </div>
                    )}

                    {formData.method === 'UPI' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.upiId}
                                onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="username@upi"
                            />
                        </div>
                    )}

                    {formData.method === 'PAYPAL' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PayPal Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.paypalEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="user@example.com"
                            />
                        </div>
                    )}

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                            Set as default payment method
                        </label>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-black py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {loading ? 'Saving...' : (payment ? 'Update' : 'Add')} Payment Method
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}