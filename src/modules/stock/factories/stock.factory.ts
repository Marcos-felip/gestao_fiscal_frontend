import { StockRepository } from '@/modules/stock/data/repositories/stock-repository'
import { ListStockMovementsUseCase } from '@/modules/stock/application/use-cases/list-stock-movements.use-case'
import { CreateStockMovementUseCase } from '@/modules/stock/application/use-cases/create-stock-movement.use-case'
import { ProductsRepository } from '@/modules/products/data/repositories/products-repository'
import { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { StockController } from '@/modules/stock/presentation/controllers/stock-controller'

export function makeStockController(): StockController {
  const repository = new StockRepository()

  return new StockController(
    new ListStockMovementsUseCase(repository),
    new CreateStockMovementUseCase(repository),
    new ListProductsUseCase(new ProductsRepository()),
  )
}
