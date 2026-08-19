## Why

**Change irmã do backend `buscar-notas-de-entrada-na-sefaz`**, e continuação da
`importar-nota-de-entrada-por-xml` deste repositório.

Com a importação por upload, o XML ainda precisa chegar por e-mail. Com a
distribuição da SEFAZ, ele aparece sozinho — e aí a interface passa a ter um
problema que não tinha: **uma caixa de entrada fiscal**, com notas que a empresa
não pediu e sobre as quais precisa decidir.

A decisão não é cosmética. Manifestar **ciência** é o que libera o XML completo, e
manifestar **desconhecimento** é a única defesa contra nota fria emitida contra o
CNPJ da empresa. São atos com efeito legal, disparados por um botão — e a tela é
o que separa um do outro.

## What Changes

- **Caixa de entrada de notas**: as notas descobertas na SEFAZ, com emitente,
  valor, data e situação.
- **Emitente desconhecido destacado** — CNPJ que nunca foi fornecedor emitindo
  contra a empresa é o formato que a nota fria tem.
- **Manifestar** ciência, confirmação, desconhecimento e operação não realizada,
  com o efeito de cada uma dito em português antes de enviar.
- **Desconhecimento e operação não realizada pedem confirmação explícita**, como
  o cancelamento de documento já pede: são declarações contra o emitente.
- **Resumo é exibido como resumo.** Enquanto só há resumo, não há itens — e a
  importação não é oferecida.
- **Importar dali** usa a tela de conferência que a change irmã já entregou.
- **Estado da descoberta visível**: quando foi a última consulta e se a SEFAZ
  recusou por frequência — senão "nenhuma nota nova" é indistinguível de
  "a consulta está falhando há três dias".

## Capabilities

### New Capabilities
- `dfe-inbox-ui`: a caixa de entrada de notas descobertas na SEFAZ e a
  manifestação do destinatário.

### Modified Capabilities
- `nfe-import-ui`: a conferência passa a ser alcançável também a partir de uma
  nota da SEFAZ, e a origem do XML é exibida.

## Impact

- **Depende das duas changes anteriores**: da importação deste repositório (a
  tela de conferência) e da busca no backend (os dados).
- **Frontend:** módulo `src/modules/dfe/`, com a mesma arquitetura em camadas.
- **Gating:** `dfe.read` para ver, `dfe.manifestar` para agir — separados de
  propósito: ver a caixa de entrada não é poder declarar à SEFAZ.
- **Espelhar o contrato** em `gestao_fiscal_frontend/API.md`.
