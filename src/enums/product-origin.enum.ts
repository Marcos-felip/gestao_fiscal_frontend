export const productOriginLabels: Record<number, string> = {
  0: '0 — Nacional',
  1: '1 — Estrangeira (importação direta)',
  2: '2 — Estrangeira (adquirida no mercado interno)',
  3: '3 — Nacional (importação entre 40% e 70%)',
  4: '4 — Nacional (processos produtivos básicos)',
  5: '5 — Nacional (importação até 40%)',
  6: '6 — Estrangeira (importação direta, sem similar nacional)',
  7: '7 — Estrangeira (mercado interno, sem similar nacional)',
  8: '8 — Nacional (importação superior a 70%)',
}

export const productOriginOptions: { value: string; label: string }[] =
  Object.entries(productOriginLabels).map(([value, label]) => ({
    value,
    label,
  }))
