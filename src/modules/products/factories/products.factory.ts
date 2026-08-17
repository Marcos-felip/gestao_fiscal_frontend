import { ProductsRepository } from '@/modules/products/data/repositories/products-repository'
import { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { GetProductUseCase } from '@/modules/products/application/use-cases/get-product.use-case'
import { CreateProductUseCase } from '@/modules/products/application/use-cases/create-product.use-case'
import { UpdateProductUseCase } from '@/modules/products/application/use-cases/update-product.use-case'
import { DeleteProductUseCase } from '@/modules/products/application/use-cases/delete-product.use-case'
import { ListFiscalPendingProductsUseCase } from '@/modules/products/application/use-cases/list-fiscal-pending-products.use-case'
import { ProductsListController } from '@/modules/products/presentation/controllers/products-list-controller'
import { ProductFormController } from '@/modules/products/presentation/controllers/product-form-controller'
import { FiscalPendingProductsController } from '@/modules/products/presentation/controllers/fiscal-pending-products-controller'

export function makeProductsListController(): ProductsListController {
  const repository = new ProductsRepository()

  return new ProductsListController(
    new ListProductsUseCase(repository),
    new DeleteProductUseCase(repository),
  )
}

export function makeFiscalPendingProductsController(): FiscalPendingProductsController {
  const repository = new ProductsRepository()

  return new FiscalPendingProductsController(
    new ListFiscalPendingProductsUseCase(repository),
  )
}

export function makeProductFormController(): ProductFormController {
  const repository = new ProductsRepository()

  return new ProductFormController(
    new GetProductUseCase(repository),
    new CreateProductUseCase(repository),
    new UpdateProductUseCase(repository),
  )
}
