#  Slooze Food App

A modern, full-stack food ordering web application with Role-Based Access Control (RBAC) and country-based data isolation. Built with Next.js, NestJS, TypeScript, and PostgreSQL.


###  Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-Based Access Control (RBAC)** with three user roles:
  - **Admin** (Nick Fury): Full system access
  - **Manager** (Country-specific): Limited to their country
  - **Member**: Basic ordering capabilities
- **Country-based data isolation**: Users only see data from their assigned country

### 📊 Dashboard & Analytics
- **Real-time analytics** with revenue tracking
- **Sales metrics** and order statistics
- **Interactive charts** using Recharts
- **Popular items** and order status distribution

### 🏪 Restaurant Management
- **Full CRUD operations** for restaurants
- **Image upload support** for restaurant listings
- **Menu item management** with pricing
- **Country-based restaurant filtering**

### 🛒 Order Management
- **Shopping cart functionality** with real-time updates
- **Order creation** and status tracking
- **Order cancellation** (Admin/Manager only)
- **Order history** with detailed item breakdown

### 💳 Payment System
- **Multiple payment methods** (Credit Card, Debit Card, UPI, PayPal)
- **Default payment method** setting
- **Secure payment management** (Admin only)

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** for form handling
- **Recharts** for data visualization
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **NestJS** with TypeScript
- **PostgreSQL** with Prisma ORM
- **JWT Authentication**
- **Passport.js** for security
- **Class Validator** for DTO validation
- **Swagger** for API documentation

### Database
- **PostgreSQL** with proper relations
- **Prisma ORM** for database management
- **Migrations** and seeding support


## 🎯 Demo Users

| Email | Password | Role | Country | Access |
|-------|----------|------|---------|--------|
| `nick@fury.com` | `admin123` | ADMIN | INDIA | Full system access |
| `captain@marvel.com` | `manager123` | MANAGER | INDIA | India data only |
| `captain@america.com` | `manager123` | MANAGER | AMERICA | America data only |
| `thanos@india.com` | `member123` | MEMBER | INDIA | Basic ordering |
| `thor@india.com` | `member123` | MEMBER | INDIA | Basic ordering |
| `travis@america.com` | `member123` | MEMBER | AMERICA | Basic ordering |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- Yarn package manager

### Installation
1. **Clone the repository**
2. **Setup Backend** (see [Backend Setup Guide](./docs/SETUP.md))
3. **Setup Frontend** (see [Frontend Setup Guide](./docs/SETUP.md))
4. **Access the application** at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, access the Swagger API documentation at:
`http://localhost:3001/api`

## 🔧 Development

### Running in Development Mode
```bash
# Backend (Terminal 1)
cd backend
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database with sample data
npx ts-node prisma/seed-simple.ts

yarn start:dev

# Frontend (Terminal 2) 
cd frontend
yarn dev