## Why

O backend fiscal entregou a **Fase A** (emissão de NFC-e em homologação,
event-driven + fila): configuração fiscal por estabelecimento, dados fiscais de
empresa e produto, `FiscalDocument` com snapshot/status/histórico, e emissão
assíncrona disparada pela venda concluída. Falta o **frontend** para o usuário
configurar o fiscal, corrigir pendências dos produtos, emitir NFC-e e acompanhar
os documentos. Sem isso o operador não consegue usar a emissão.

## What Changes

- Módulo `fiscal` no frontend (Clean Architecture), consumindo a API fiscal
  (`/api/v1/fiscal/**`) da Fase A.
- **Configuração fiscal do estabelecimento**: ambiente, série/numeração NFC-e,
  CSC/idCSC (CRUD via `/fiscal/settings`), e exibição dos metadados do certificado
  (validade/titular) com alerta de vencimento.
- **Dados fiscais da empresa** (CRT, IE/IM, IBGE, contribuinte ICMS, tel/e-mail
  fiscal) na página de Empresa + indicador `fiscalConfigComplete`.
- **Dados fiscais de produto** (seção fiscal no formulário) + lista de pendências
  (produtos com `fiscalComplete=false`) e indicador de completude.
- **Emissão de NFC-e** disparada da venda concluída (PDV/detalhe), com
  acompanhamento do status assíncrono por polling (PENDENTE → PROCESSANDO →
  AUTORIZADO/REJEITADO/ERRO) e badge de status fiscal na venda.
- **Lista e detalhe de documentos fiscais** (filtros, paginação, snapshot,
  histórico e eventos), com **download do XML** (enviado/autorizado/cancelamento).

## Out of Scope (dependem de Fase B/C do backend — ainda sem endpoint)

- **Upload de certificado A1 (.pfx)** e substituição — backend guarda só referência
  (KMS); não há rota de upload na Fase A.
- **Teste de comunicação com a SEFAZ** — sem endpoint.
- **Cancelamento** de NFC-e e **central de rejeições / retry** — Fase B.
- **DANFE / QR Code** (visualizar/baixar/reimprimir) — colunas existem mas não são
  populadas nem servidas na Fase A.
- **Ativação de produção / checklist** — Fase C.

A UI da Fase A esconde/desabilita essas ações e será estendida quando o backend
liberar as fases seguintes.

## Capabilities

### New Capabilities
- `fiscal-settings-ui`: configuração fiscal do estabelecimento, dados fiscais de
  empresa e produto, pendências fiscais dos produtos e exibição do certificado.
- `nfce-emission-ui`: emitir NFC-e a partir da venda, acompanhar status assíncrono,
  listar/detalhar documentos e baixar XML.

### Modified Capabilities
<!-- Nenhuma capability de spec existente muda de comportamento. -->

## Impact

- Novo módulo `src/modules/fiscal/**` (domain/data/application/factories/presentation).
- Novas rotas e itens de sidebar (grupo "Fiscal" ou dentro de "Operação"/"Configurações").
- Permissões consumidas: `fiscal.settings.read/edit`, `fiscal.emit`, `fiscal.read`
  (semeadas só para ADMIN no backend; OWNER sempre passa).
- Integração com o PDV/detalhe da venda (gatilho de emissão + status fiscal).
- Enums fiscais no frontend espelhando o backend: `FiscalDocumentModel` (NFE/NFCE),
  `FiscalEnvironment`, `FiscalDocumentStatus` (10 valores) e o **distinto**
  `FiscalStatus` da venda (5 valores: NAO_EMITIDO/PROCESSANDO/AUTORIZADO/REJEITADO/
  CANCELADO), `TaxRegimeCode`/CRT e `FiscalPaymentCode`.
- Gotchas de contrato: decimais como **string** (`valorTotal`, alíquotas); GET de
  settings-por-estabelecimento e doc-por-venda retornam **`null` com 200**; lista de
  documentos usa envelope **`{ data, total, page, limit }`**; XML vem como **string
  crua** (não arquivo); prefixo global `/api/v1`.
- Depende do backend `add-fiscal-mvp-nfce` (Fase A).
