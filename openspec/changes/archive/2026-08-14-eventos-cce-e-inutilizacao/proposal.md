## Why

O backend passa a emitir carta de correção e inutilização de numeração. As duas
são ações do usuário, e as duas têm regra legal que a interface precisa comunicar
**antes** do erro — não depois.

A CC-e é o caso mais delicado: o usuário quase sempre chega nela querendo
corrigir algo que a CC-e não corrige. Uma tela que só oferece um campo de texto
e devolve erro é uma tela que ensina errado.

## What Changes

- **Ação "Carta de correção"** no detalhe do documento autorizado, gated por
  `fiscal.cce`, com o histórico das correções anteriores.
- **A tela diz o que a CC-e não corrige**, de forma visível: valores, datas,
  emitente e destinatário exigem cancelamento e nova emissão. Isso antes do
  campo de texto, não como mensagem de erro.
- **Contador de correções restantes** — 20 é o limite legal, e o usuário precisa
  saber onde está antes de gastar a última.
- **Ação "Inutilizar numeração"** na configuração fiscal, gated por
  `fiscal.inutilizar`, com confirmação reforçada: é ato irreversível sobre
  numeração.
- **Correções visíveis no documento**: o detalhe passa a listar as CC-e emitidas,
  com texto, sequência, data e download do XML.
- **Documentos inutilizados** aparecem na lista com o status próprio.

## Capabilities

### New Capabilities
- `fiscal-events-ui`: carta de correção e inutilização de numeração pela
  interface, com as regras legais comunicadas antes da ação.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio. -->

## Impact

- `src/modules/fiscal/` — casos de uso, repositories e telas dos dois eventos.
- Detalhe do documento ganha a seção de correções.
- Configuração fiscal ganha a ação de inutilização.
- **Depende do backend**, que depende da etapa 3.
- **Revisar antes de implementar** — ver o aviso no roteiro fiscal.
- Etapa **4** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
