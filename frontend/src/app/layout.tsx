import type { Metadata } from 'next'
import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata: Metadata = {
    title: 'Slooze Food App',
    description: 'Modern food ordering application with RBAC',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}