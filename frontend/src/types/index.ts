export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    MEMBER = 'MEMBER'
}

export enum Country {
    INDIA = 'INDIA',
    AMERICA = 'AMERICA'
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    UPI = 'UPI',
    PAYPAL = 'PAYPAL'
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    country: Country;
    createdAt: string;
    updatedAt: string;
}

export interface Restaurant {
    id: string;
    name: string;
    description: string;
    image?: string;
    country: Country;
    menuItems: MenuItem[];
    createdAt: string;
    updatedAt: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    restaurantId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Order {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    userId: string;
    user: User;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    quantity: number;
    menuItem: MenuItem;
    menuItemId: string;
    orderId: string;
}

export interface Payment {
    id: string;
    method: PaymentMethod;
    lastFour?: string;
    upiId?: string;
    paypalEmail?: string;
    isDefault: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

// NEW TYPES ADDED BELOW

export interface CreateOrderData {
    items: {
        menuItemId: string;
        quantity: number;
    }[];
}

export interface CreatePaymentData {
    method: PaymentMethod;
    lastFour?: string;
    upiId?: string;
    paypalEmail?: string;
    isDefault?: boolean;
}

export interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    ordersByStatus: { status: OrderStatus; count: number }[];
    revenueByDay: { day: string; revenue: number }[];
    popularItems: { name: string; count: number }[];
}