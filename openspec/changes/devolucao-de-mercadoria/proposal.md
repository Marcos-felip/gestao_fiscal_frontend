## Why

O backend passa a emitir devolução. A interface precisa dar ao usuário o que
nenhuma API dá sozinha: escolher **o que** e **quanto** devolver, com o saldo
visível.

Devolução parcial é o caso comum — cliente devolve dois de cinco itens — e é
onde o usuário mais erra se a tela não mostrar quanto ainda pode ser devolvido.

## What Changes

- **Ação "Devolver"** no detalhe do documento autorizado, gated por
  `fiscal.devolucao`.
- **Seleção de itens e quantidades**, com o **saldo devolvível** de cada item
  visível e o campo limitado por ele.
- **Atalho de devolução total**, que é o caso mais frequente.
- **Aviso quando a original não tem dados fiscais suficientes** — notas emitidas
  antes da etapa 1 não podem ser devolvidas, e a tela deve explicar por quê em
  vez de mostrar erro seco.
- **Devoluções listadas no documento original**, com link, e a original
  identificada no documento de devolução.
- **Reflexo em estoque e financeiro comunicado antes da confirmação**: o usuário
  precisa saber que a devolução devolve mercadoria ao estoque e mexe no título a
  receber.

## Capabilities

### New Capabilities
- `fiscal-return-ui`: devolução de mercadoria pela interface, com escolha de
  itens, controle de saldo e rastreabilidade com a nota original.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio. -->

## Impact

- `src/modules/fiscal/` — caso de uso, repository e telas da devolução.
- Detalhe do documento ganha a seção de devoluções e a ação.
- **Depende do backend**, que depende das etapas 1, 2 e 3.
- **Revisar antes de implementar** — é a proposta escrita mais longe do código
  real. Ver o aviso no roteiro fiscal.
- Etapa **5** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
