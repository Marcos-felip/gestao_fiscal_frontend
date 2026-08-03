/** Dados para editar um caixa (`PATCH /cash-registers/:id`) — envio parcial. */
export class UpdateCashRegisterDto {
  name?: string
  isActive?: boolean

  constructor(fields: { name?: string; isActive?: boolean }) {
    this.name = fields.name
    this.isActive = fields.isActive
  }
}
