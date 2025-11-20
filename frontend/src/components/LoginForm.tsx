'use client'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const { login, loading } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await login(email, password)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        }
    }

    const demoUsers = [
        { email: 'nick@fury.com', password: 'admin123', role: 'ADMIN' },
        { email: 'captain@marvel.com', password: 'manager123', role: 'MANAGER - India' },
        { email: 'captain@america.com', password: 'manager123', role: 'MANAGER - America' },
        { email: 'thanos@india.com', password: 'member123', role: 'MEMBER - India' },
    ]

    const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail)
        setPassword(demoPassword)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                        <span className="text-2xl font-bold text-black">🍕</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Slooze Food
                    </h1>
                    <p className="mt-3 text-gray-600 text-lg">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-black bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4 text-center">Demo Credentials</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {demoUsers.map((user, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillDemoCredentials(user.email, user.password)}
                                    className="flex items-center justify-between p-3 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                >
                                    <div>
                                        <div className="font-medium text-gray-900">{user.role}</div>
                                        <div className="text-gray-600">{user.email}</div>
                                    </div>
                                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Try me
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Built with ❤️ for Slooze Food App
                    </p>
                </div>
            </div>
        </div>
    )
}