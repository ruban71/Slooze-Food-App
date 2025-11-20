import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, Country } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new restaurant' })
    create(@Body() createRestaurantDto: CreateRestaurantDto, @Req() req: any) {
        // For managers, ensure they can only create restaurants in their country
        if (req.user.role === Role.MANAGER) {
            createRestaurantDto.country = req.user.country as Country;
        }
        return this.restaurantsService.create(createRestaurantDto);
    }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all restaurants (country-filtered)' })
    findAll(@Req() req: any) {
        return this.restaurantsService.findAll(req.user.country, req.user.role);
    }

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get restaurant by ID' })
    findOne(@Param('id') id: string) {
        return this.restaurantsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update restaurant' })
    update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto, @Req() req: any) {
        // Add country validation for managers
        return this.restaurantsService.update(id, updateRestaurantDto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete restaurant' })
    remove(@Param('id') id: string) {
        return this.restaurantsService.remove(id);
    }
}