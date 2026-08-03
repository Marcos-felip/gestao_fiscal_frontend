/**
 * Fechamento de caixa (`POST /cash-sessions/:id/close`). `notes` é obrigatório
 * quando há diferença entre o contado e o esperado.
 */
export class CloseCashSessionDto {
  countedCash: number
  notes?: string

  constructor(fields: { countedCash: number; notes?: string }) {
    this.countedCash = fields.countedCash
    this.notes = fields.notes
  }
}
