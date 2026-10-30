import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query() query: ListProductsDto) {
    return this.products.findAll(query);
  }

  // Phải đặt trước ':id'
  @Get('toppings')
  findToppings() {
    return this.products.findToppings();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(id);
  }
}
