import { DashboardRepository } from '@/modules/dashboard/data/repositories/dashboard-repository'
import { GetSalesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-sales-indicators.use-case'
import { GetSalesChartUseCase } from '@/modules/dashboard/application/use-cases/get-sales-chart.use-case'
import { GetReceivablesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-receivables-indicators.use-case'
import { GetPayablesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-payables-indicators.use-case'
import { GetFiscalIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-fiscal-indicators.use-case'
import { GetStockAlertsUseCase } from '@/modules/dashboard/application/use-cases/get-stock-alerts.use-case'
import { GetCashStatusUseCase } from '@/modules/dashboard/application/use-cases/get-cash-status.use-case'
import { DashboardController } from '@/modules/dashboard/presentation/controllers/dashboard-controller'

export function makeDashboardController(): DashboardController {
  const repository = new DashboardRepository()

  return new DashboardController(
    new GetSalesIndicatorsUseCase(repository),
    new GetSalesChartUseCase(repository),
    new GetReceivablesIndicatorsUseCase(repository),
    new GetPayablesIndicatorsUseCase(repository),
    new GetFiscalIndicatorsUseCase(repository),
    new GetStockAlertsUseCase(repository),
    new GetCashStatusUseCase(repository),
  )
}
