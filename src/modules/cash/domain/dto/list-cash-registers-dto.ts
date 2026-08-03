/** Filtros da listagem de caixas (`GET /cash-registers`). */
export class ListCashRegistersDto {
  establishmentId?: string
  isActive?: boolean

  constructor(fields: { establishmentId?: string; isActive?: boolean } = {}) {
    this.establishmentId = fields.establishmentId
    this.isActive = fields.isActive
  }
}
