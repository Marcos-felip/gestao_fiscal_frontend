## Why

O backend fiscal (MVP NFC-e) passa a existir; falta o frontend para o usuário
**configurar o fiscal, corrigir pendências dos produtos, emitir NFC-e no PDV,
acompanhar os documentos, baixar DANFE/XML, cancelar e resolver rejeições**. Sem
isso o operador não consegue usar a emissão.

## What Changes

- Módulo `fiscal` no frontend (Clean Architecture), consumindo a API fiscal.
- Telas de **configuração fiscal** (empresa + estabelecimento), **upload de
  certificado A1**, **teste de comunicação com a SEFAZ**.
- **Pendências fiscais de produto** (lista do que falta preencher + edição).
- **Emissão de NFC-e** disparada da venda concluída (PDV/detalhe), com
  acompanhamento de status assíncrono.
- **Lista e detalhe de documentos fiscais** com DANFE, XML e QR Code, reimpressão.
- **Cancelamento** com justificativa e **central de rejeições**.

## Capabilities

### New Capabilities
- `fiscal-settings-ui`: telas de configuração fiscal da empresa/estabelecimento, upload de certificado, teste SEFAZ e pendências fiscais dos produtos.
- `nfce-emission-ui`: emitir NFC-e a partir da venda, listar/detalhar documentos, ver/baixar DANFE/XML/QR, cancelar e central de rejeições.

### Modified Capabilities
<!-- Nenhuma capability de spec existente muda de comportamento. -->

## Impact

- Novo módulo `src/modules/fiscal/**` (domain/data/application/factories/presentation).
- Novas rotas e itens de sidebar (grupo "Fiscal" ou dentro de "Operação"/"Configurações").
- Novas permissões consumidas: `fiscal.settings.read/edit`, `fiscal.emit`, `fiscal.cancel`, `fiscal.read`.
- Integração com o PDV/detalhe da venda (botão/gatilho de emissão + status fiscal).
- Enums fiscais no frontend espelhando o backend (modelo, ambiente, status).
- Depende do change de backend `add-fiscal-mvp-nfce` (contrato da API).
