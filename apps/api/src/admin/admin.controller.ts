import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminReportsService } from './admin-reports.service';
import { AdjustStockDto, CreateProductDto, CreateToppingDto, UpdateProductDto, UpdateToppingDto } from './dto/product.dto';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class AdminController {
  constructor(
    private readonly catalog: AdminCatalogService,
    private readonly reports: AdminReportsService,
  ) {}

  @Get('products')
  listProducts() {
    return this.catalog.listProducts();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalog.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.catalog.updateProduct(id, dto);
  }

  @Post('products/:id/stock')
  adjustStock(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdjustStockDto) {
    return this.catalog.adjustStock(id, dto);
  }

  @Get('toppings')
  listToppings() {
    return this.catalog.listToppings();
  }

  @Post('toppings')
  createTopping(@Body() dto: CreateToppingDto) {
    return this.catalog.createTopping(dto);
  }

  @Patch('toppings/:id')
  updateTopping(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateToppingDto) {
    return this.catalog.updateTopping(id, dto);
  }

  @Get('reports/revenue')
  revenue(@Query() query: RevenueQueryDto) {
    return this.reports.revenue(query.days);
  }
}
