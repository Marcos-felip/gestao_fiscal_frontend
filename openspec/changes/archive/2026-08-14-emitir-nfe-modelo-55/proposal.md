## Why

O backend passa a emitir NF-e modelo 55. Sem interface, ninguém emite.

E a NF-e não é a NFC-e com outro rótulo: ela exige destinatário completo, tem
numeração e série próprias, admite transporte e cobrança, e distingue finalidade
da nota. Cada uma dessas coisas é um pedaço de tela que não existe.

## What Changes

- **Emitir NF-e** a partir da venda ou do pedido, gated por `fiscal.nfe.emit`,
  com escolha do destinatário e da natureza da operação.
- **Bloqueio antecipado com motivo**: parceiro sem endereço completo ou sem
  indicador de IE impede a emissão, com a lista do que falta e link direto para o
  cadastro — em vez de erro seco depois do envio.
- **Indicador de IE** no cadastro de parceiro (contribuinte, isento, não
  contribuinte).
- **Série e numeração de NF-e** na configuração fiscal, ao lado das de NFC-e,
  deixando claro que são independentes.
- **Transporte, volumes e cobrança** como seções opcionais no formulário de
  emissão.
- **Documentos fiscais** passam a distinguir os modelos na lista e no detalhe,
  com o DANFE de NF-e servido como o da NFC-e.

## Capabilities

### New Capabilities
- `nfe-emission-ui`: emissão de NF-e pela interface, com destinatário completo,
  finalidade, transporte e cobrança.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio. -->

## Impact

- `src/modules/fiscal/` — fluxo de emissão de NF-e, separado do da NFC-e.
- `src/modules/partners/` — indicador de IE no formulário e no mapper.
- `src/modules/fiscal/presentation/pages/fiscal-settings-detail-page.vue` — série
  e numeração de NF-e.
- **Depende do backend**, que depende das etapas 1 e 2.
- **Revisar antes de implementar** — proposta escrita antes das etapas
  anteriores existirem.
- Enums novos (`indIEDest`, `tpNF`, `finNFe`) validados com `z.nativeEnum`,
  conforme a regra de [Enums no mapper](../../../AGENTS.md).
- Etapa **3** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
