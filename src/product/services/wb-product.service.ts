import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class WbProductService {
  constructor(private readonly productRepository: ProductRepository) {}
  public async getProducts(userId: string): Promise<ProductEntity[]> {
    return this.productRepository.find({ where: { token: { user: { id: userId } } }, relations: ['token'] });
  }
}
