'use client'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/LoginForm'
import Dashboard from '../components/Dashboard'

export default function Home() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return user ? <Dashboard /> : <LoginForm />
}