/** Dados para cadastrar um caixa (`POST /cash-registers`). */
export class CreateCashRegisterDto {
  establishmentId: string
  name: string
  isActive?: boolean

  constructor(fields: {
    establishmentId: string
    name: string
    isActive?: boolean
  }) {
    this.establishmentId = fields.establishmentId
    this.name = fields.name
    this.isActive = fields.isActive
  }
}
