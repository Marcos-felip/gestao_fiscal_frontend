/** Dados para cancelar um documento fiscal autorizado. */
export class CancelFiscalDocumentDto {
  readonly justificativa: string

  constructor(justificativa: string) {
    this.justificativa = justificativa
  }
}
