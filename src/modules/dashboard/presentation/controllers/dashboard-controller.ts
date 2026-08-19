import { computed, ref, type Ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { SalesChartRange } from '@/core/enums/sales-chart-range.enum'
import { GetSalesChartDto } from '@/modules/dashboard/domain/dto/get-sales-chart-dto'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'
import type { DashboardStockAlerts } from '@/modules/dashboard/domain/responses/dashboard-stock-alerts'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'
import type { GetSalesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-sales-indicators.use-case'
import type { GetSalesChartUseCase } from '@/modules/dashboard/application/use-cases/get-sales-chart.use-case'
import type { GetReceivablesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-receivables-indicators.use-case'
import type { GetPayablesIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-payables-indicators.use-case'
import type { GetFiscalIndicatorsUseCase } from '@/modules/dashboard/application/use-cases/get-fiscal-indicators.use-case'
import type { GetStockAlertsUseCase } from '@/modules/dashboard/application/use-cases/get-stock-alerts.use-case'
import type { GetCashStatusUseCase } from '@/modules/dashboard/application/use-cases/get-cash-status.use-case'
import { usePermissions } from '@/shared/composables/usePermissions'

/** Os blocos da tela de início. Cada um carrega e falha sozinho. */
export type DashboardBlock =
  | 'sales'
  | 'chart'
  | 'receivables'
  | 'payables'
  | 'fiscal'
  | 'stock'
  | 'cash'

/**
 * `hidden` não é erro: é o usuário sem a permissão daquele domínio. O bloco não
 * é requisitado nem desenhado — "sem perfil = sem acesso" é o esperado.
 */
export type BlockStatus = 'hidden' | 'loading' | 'ready' | 'failed'

/**
 * Permissão de cada bloco — a **mesma** que o endpoint exige.
 *
 * O gating decide o que é requisitado, não só o que é exibido: pedir para tomar
 * `403` transformaria falta de permissão em mensagem de erro na home.
 */
const BLOCK_PERMISSIONS: Record<DashboardBlock, string> = {
  sales: 'sales.list',
  chart: 'sales.list',
  receivables: 'receivables.list',
  payables: 'payables.list',
  fiscal: 'fiscal.read',
  stock: 'products.list',
  cash: 'cash.list',
}

export class DashboardController extends BaseController {
  private readonly salesUseCase: GetSalesIndicatorsUseCase
  private readonly chartUseCase: GetSalesChartUseCase
  private readonly receivablesUseCase: GetReceivablesIndicatorsUseCase
  private readonly payablesUseCase: GetPayablesIndicatorsUseCase
  private readonly fiscalUseCase: GetFiscalIndicatorsUseCase
  private readonly stockUseCase: GetStockAlertsUseCase
  private readonly cashUseCase: GetCashStatusUseCase
  private readonly permissions = usePermissions()

  readonly sales = ref<DashboardSales | null>(null)
  readonly chart = ref<DashboardSalesChart | null>(null)
  readonly receivables = ref<DashboardFinancial | null>(null)
  readonly payables = ref<DashboardFinancial | null>(null)
  readonly fiscal = ref<DashboardFiscal | null>(null)
  readonly stock = ref<DashboardStockAlerts | null>(null)
  readonly cash = ref<DashboardCash | null>(null)

  readonly chartRange = ref<SalesChartRange>(SalesChartRange.LAST_30_DAYS)

  readonly status = ref<Record<DashboardBlock, BlockStatus>>({
    sales: 'hidden',
    chart: 'hidden',
    receivables: 'hidden',
    payables: 'hidden',
    fiscal: 'hidden',
    stock: 'hidden',
    cash: 'hidden',
  })

  constructor(
    salesUseCase: GetSalesIndicatorsUseCase,
    chartUseCase: GetSalesChartUseCase,
    receivablesUseCase: GetReceivablesIndicatorsUseCase,
    payablesUseCase: GetPayablesIndicatorsUseCase,
    fiscalUseCase: GetFiscalIndicatorsUseCase,
    stockUseCase: GetStockAlertsUseCase,
    cashUseCase: GetCashStatusUseCase,
  ) {
    super()
    this.salesUseCase = salesUseCase
    this.chartUseCase = chartUseCase
    this.receivablesUseCase = receivablesUseCase
    this.payablesUseCase = payablesUseCase
    this.fiscalUseCase = fiscalUseCase
    this.stockUseCase = stockUseCase
    this.cashUseCase = cashUseCase
  }

  /** Algum bloco ainda em voo — o botão "Atualizar" fica ocupado. */
  readonly isLoadingAny = computed(() =>
    Object.values(this.status.value).includes('loading'),
  )

  /**
   * A empresa não tem movimento nenhum.
   *
   * A conclusão sai **do bloco de vendas**, e só dele. Deduzi-la dos blocos
   * visíveis faria um estoquista com apenas `products.list`, numa loja cheia e
   * sem nenhum produto em falta, ler "sua operação ainda não tem movimento":
   * ele não enxerga as vendas, e ausência de visão não é ausência de fato.
   *
   * Sem o bloco de vendas pronto, a resposta é não.
   */
  readonly isFresh = computed(() => {
    if (this.status.value.sales !== 'ready') return false

    const vendas = this.sales.value
    if (!vendas) return false

    const semVenda =
      vendas.month.count === 0 &&
      vendas.previousMonth.count === 0 &&
      vendas.openQuotes.count === 0
    const semTitulo =
      (this.receivables.value?.open.count ?? 0) === 0 &&
      (this.payables.value?.open.count ?? 0) === 0
    const semDocumento = (this.fiscal.value?.month.total ?? 0) === 0
    const semEstoque =
      (this.stock.value?.outOfStock ?? 0) === 0 &&
      (this.stock.value?.belowMinimum ?? 0) === 0
    const semCaixa = (this.cash.value?.openSessions.length ?? 0) === 0

    return semVenda && semTitulo && semDocumento && semEstoque && semCaixa
  })

  isVisible(block: DashboardBlock): boolean {
    return this.status.value[block] !== 'hidden'
  }

  statusOf(block: DashboardBlock): BlockStatus {
    return this.status.value[block]
  }

  async load(): Promise<void> {
    await Promise.all([
      this.loadSales(),
      this.loadChart(),
      this.loadReceivables(),
      this.loadPayables(),
      this.loadFiscal(),
      this.loadStock(),
      this.loadCash(),
    ])
  }

  /** Recarrega um bloco só — é o que o "tentar novamente" do cartão aciona. */
  async retry(block: DashboardBlock): Promise<void> {
    const loaders: Record<DashboardBlock, () => Promise<void>> = {
      sales: () => this.loadSales(),
      chart: () => this.loadChart(),
      receivables: () => this.loadReceivables(),
      payables: () => this.loadPayables(),
      fiscal: () => this.loadFiscal(),
      stock: () => this.loadStock(),
      cash: () => this.loadCash(),
    }

    await loaders[block]()
  }

  /** Troca o período do gráfico e recarrega **só** o gráfico. */
  async setChartRange(range: SalesChartRange): Promise<void> {
    if (this.chartRange.value === range) return

    this.chartRange.value = range
    await this.loadChart()
  }

  private async loadSales(): Promise<void> {
    if (!this.begin('sales')) return
    this.settle('sales', await this.salesUseCase.execute(), this.sales)
  }

  private async loadChart(): Promise<void> {
    if (!this.begin('chart')) return
    const dto = new GetSalesChartDto({ range: this.chartRange.value })
    this.settle('chart', await this.chartUseCase.execute(dto), this.chart)
  }

  private async loadReceivables(): Promise<void> {
    if (!this.begin('receivables')) return
    this.settle(
      'receivables',
      await this.receivablesUseCase.execute(),
      this.receivables,
    )
  }

  private async loadPayables(): Promise<void> {
    if (!this.begin('payables')) return
    this.settle('payables', await this.payablesUseCase.execute(), this.payables)
  }

  private async loadFiscal(): Promise<void> {
    if (!this.begin('fiscal')) return
    this.settle('fiscal', await this.fiscalUseCase.execute(), this.fiscal)
  }

  private async loadStock(): Promise<void> {
    if (!this.begin('stock')) return
    this.settle('stock', await this.stockUseCase.execute(), this.stock)
  }

  private async loadCash(): Promise<void> {
    if (!this.begin('cash')) return
    this.settle('cash', await this.cashUseCase.execute(), this.cash)
  }

  /** Marca o bloco como carregando, ou o esconde quando falta permissão. */
  private begin(block: DashboardBlock): boolean {
    if (!this.permissions.can(BLOCK_PERMISSIONS[block])) {
      this.status.value = { ...this.status.value, [block]: 'hidden' }
      return false
    }

    this.status.value = { ...this.status.value, [block]: 'loading' }
    return true
  }

  /**
   * Resolve um bloco.
   *
   * O `handleResult` do `BaseController` guarda **um** erro, e aqui há sete
   * blocos que falham sozinhos: a falha vira estado do bloco, e o erro global é
   * limpo porque a home não tem faixa de erro única. O texto genérico e o
   * `console.error` de erro não-esperado continuam vindo do `BaseController`.
   */
  private settle<T>(
    block: DashboardBlock,
    result: Either<DomainError, T>,
    target: Ref<T | null>,
  ): void {
    this.handleResult(
      result,
      (value) => {
        target.value = value
        this.status.value = { ...this.status.value, [block]: 'ready' }
      },
      () => {
        this.status.value = { ...this.status.value, [block]: 'failed' }
      },
    )

    this.clearError()
  }
}
