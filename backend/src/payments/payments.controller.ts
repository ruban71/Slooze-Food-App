import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create payment method (Admin only)' })
    create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
        return this.paymentsService.create(createPaymentDto, req.user.id);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all payment methods (Admin only)' })
    findAll(@Req() req: any) {
        return this.paymentsService.findAll(req.user.id, req.user.role);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment method by ID (Admin only)' })
    findOne(@Param('id') id: string) {
        return this.paymentsService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update payment method (Admin only)' })
    update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req: any) {
        return this.paymentsService.update(id, updatePaymentDto, req.user.id);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete payment method (Admin only)' })
    remove(@Param('id') id: string) {
        return this.paymentsService.remove(id);
    }

    @Patch(':id/set-default')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set default payment method (Admin only)' })
    setDefault(@Param('id') id: string, @Req() req: any) {
        return this.paymentsService.setDefaultPayment(id, req.user.id);
    }
}