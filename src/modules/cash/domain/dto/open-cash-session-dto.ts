/** Abertura de caixa (`POST /cash-sessions/open`) — fundo em `openingAmount`. */
export class OpenCashSessionDto {
  cashRegisterId: string
  openingAmount: number

  constructor(fields: { cashRegisterId: string; openingAmount: number }) {
    this.cashRegisterId = fields.cashRegisterId
    this.openingAmount = fields.openingAmount
  }
}
