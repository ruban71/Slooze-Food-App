import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new order' })
    create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
        return this.ordersService.create(createOrderDto, req.user.id);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all orders (country-filtered)' })
    findAll(@Req() req: any) {
        return this.ordersService.findAll(req.user.id, req.user.country, req.user.role);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get order by ID' })
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id/cancel')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel order (Admin/Manager only)' })
    cancelOrder(@Param('id') id: string) {
        return this.ordersService.cancelOrder(id);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update order status (Admin/Manager only)' })
    updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
        return this.ordersService.updateStatus(id, status);
    }
}