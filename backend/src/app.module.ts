import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        RestaurantsModule,
        OrdersModule,
        PaymentsModule,
    ],
})
export class AppModule { }