export interface ProductionChecklistItem {
  item: string
  ok: boolean
  detalhe?: string
  bloqueante?: boolean
}

export interface ProductionChecklist {
  liberada: boolean
  liberadaEm: string | null
  itens: ProductionChecklistItem[]
}

export interface ConsultaPublicaResult {
  validada: boolean
  chaveAcesso: string
  situacao: string
}
