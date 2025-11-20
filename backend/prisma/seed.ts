import { PrismaClient, Role, Country, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default users
    const users = [
        {
            email: 'nick@fury.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Nick Fury',
            role: Role.ADMIN,
            country: Country.INDIA,
        },
        {
            email: 'captain@marvel.com',
            password: await bcrypt.hash('manager123', 10),
            name: 'Captain Marvel',
            role: Role.MANAGER,
            country: Country.INDIA,
        },
        {
            email: 'captain@america.com',
            password: await bcrypt.hash('manager123', 10),
            name: 'Captain America',
            role: Role.MANAGER,
            country: Country.AMERICA,
        },
        {
            email: 'thanos@india.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Thanos',
            role: Role.MEMBER,
            country: Country.INDIA,
        },
        {
            email: 'thor@india.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Thor',
            role: Role.MEMBER,
            country: Country.INDIA,
        },
        {
            email: 'travis@america.com',
            password: await bcrypt.hash('member123', 10),
            name: 'Travis',
            role: Role.MEMBER,
            country: Country.AMERICA,
        },
    ];

    for (const userData of users) {
        await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData,
        });
    }
    console.log('✅ Users created');

    // Create restaurants
    const restaurants = [
        {
            name: 'Spice Garden',
            description: 'Authentic Indian cuisine with modern twist',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop',
            country: Country.INDIA,
        },
        {
            name: 'Burger Hub',
            description: 'American style burgers and fries',
            image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
            country: Country.AMERICA,
        },
        {
            name: 'Curry House',
            description: 'Traditional Indian curries and breads',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=300&fit=crop',
            country: Country.INDIA,
        },
        {
            name: 'Pizza Palace',
            description: 'Italian pizzas with American toppings',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
            country: Country.AMERICA,
        },
    ];

    for (const restaurantData of restaurants) {
        await prisma.restaurant.upsert({
            where: { id: (await prisma.restaurant.findFirst({ where: { name: restaurantData.name } }))?.id || '0' },
            update: {},
            create: restaurantData,
        });
    }
    console.log('✅ Restaurants created');

    // Create menu items
    const restaurantsWithIds = await prisma.restaurant.findMany();

    const menuItems = [
        // Spice Garden (Indian)
        { name: 'Butter Chicken', description: 'Creamy tomato butter sauce', price: 12.99, restaurantId: restaurantsWithIds[0].id },
        { name: 'Biryani', description: 'Fragrant rice with spices', price: 10.99, restaurantId: restaurantsWithIds[0].id },
        { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 8.99, restaurantId: restaurantsWithIds[0].id },

        // Burger Hub (American)
        { name: 'Classic Cheeseburger', description: 'Beef patty with cheese', price: 8.99, restaurantId: restaurantsWithIds[1].id },
        { name: 'French Fries', description: 'Crispy golden fries', price: 3.99, restaurantId: restaurantsWithIds[1].id },
        { name: 'Chicken Wings', description: 'Spicy buffalo wings', price: 9.99, restaurantId: restaurantsWithIds[1].id },

        // Curry House (Indian)
        { name: 'Chicken Curry', description: 'Spicy chicken curry', price: 11.99, restaurantId: restaurantsWithIds[2].id },
        { name: 'Garlic Naan', description: 'Garlic flavored bread', price: 2.99, restaurantId: restaurantsWithIds[2].id },
        { name: 'Samosa', description: 'Fried pastry with filling', price: 4.99, restaurantId: restaurantsWithIds[2].id },

        // Pizza Palace (American)
        { name: 'Margherita Pizza', description: 'Classic tomato and cheese', price: 11.99, restaurantId: restaurantsWithIds[3].id },
        { name: 'Pepperoni Pizza', description: 'Pepperoni and cheese', price: 13.99, restaurantId: restaurantsWithIds[3].id },
        { name: 'Garlic Bread', description: 'Toasted garlic bread', price: 4.99, restaurantId: restaurantsWithIds[3].id },
    ];

    for (const menuItemData of menuItems) {
        const existingItem = await prisma.menuItem.findFirst({
            where: {
                name: menuItemData.name,
                restaurantId: menuItemData.restaurantId
            }
        });

        if (existingItem) {
            await prisma.menuItem.update({
                where: { id: existingItem.id },
                data: menuItemData,
            });
        } else {
            await prisma.menuItem.create({
                data: menuItemData,
            });
        }
    }
    console.log('✅ Menu items created');

    // Create sample orders
    const usersWithIds = await prisma.user.findMany();
    const menuItemsWithIds = await prisma.menuItem.findMany();

    const sampleOrders = [
        {
            userId: usersWithIds[3].id, // Thanos
            items: [
                { menuItemId: menuItemsWithIds[0].id, quantity: 2 },
                { menuItemId: menuItemsWithIds[1].id, quantity: 1 },
            ],
            totalAmount: (12.99 * 2) + 10.99,
        },
        {
            userId: usersWithIds[5].id, // Travis
            items: [
                { menuItemId: menuItemsWithIds[3].id, quantity: 1 },
                { menuItemId: menuItemsWithIds[4].id, quantity: 2 },
            ],
            totalAmount: 8.99 + (3.99 * 2),
        },
    ];

    for (const orderData of sampleOrders) {
        await prisma.order.create({
            data: {
                userId: orderData.userId,
                totalAmount: orderData.totalAmount,
                items: {
                    create: orderData.items.map(item => ({
                        quantity: item.quantity,
                        menuItemId: item.menuItemId,
                    })),
                },
            },
        });
    }
    console.log('✅ Sample orders created');

    console.log('🎉 Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });