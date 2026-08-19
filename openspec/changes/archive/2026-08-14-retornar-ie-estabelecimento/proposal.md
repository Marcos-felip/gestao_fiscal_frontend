## Why

A Inscrição Estadual da Sede some da tela de Empresa quando a página recarrega. O
usuário preenche, salva, vê o toast de sucesso, volta — e o campo está vazio. O
dado **está gravado**; o que falta é o caminho de volta.

Duas causas, ambas no frontend:

1. `applySede` (`company-controller.ts:222`) copia da matriz o nome, a inscrição
   municipal e o endereço inteiro para o formulário — mas **não copia a
   `inscricaoEstadual`**, embora a entidade `Establishment` já a carregue
   (`establishment.mapper.ts:14`) e a matriz já esteja carregada por `loadMatriz`.
2. O formulário lê a IE de `company.stateRegistration`
   (`company-controller.ts:204`), e o mapper declara esse campo como
   `z.string().nullable().default(null)` (`company.mapper.ts:16`). O backend nunca
   o envia, então o `.default(null)` **transforma um campo ausente em `null`
   válido** — o contrato quebrado passa despercebido, sem `ContractError`.

O ponto 2 é o mais caro dos dois. Esse padrão de `.nullable().default(null)` sobre
campo que a API não devolve mascara divergência de contrato em silêncio, e já
apareceu antes neste módulo.

## What Changes

- **`applySede` passa a preencher a IE** a partir de `matriz.inscricaoEstadual`.
  Correção mínima, no lugar onde a propagação sede→formulário já mora, e que
  funciona **sem depender do backend**.
- **O mapper deixa de mascarar `stateRegistration`** assim que a change irmã do
  backend publicar o campo: `.default(null)` sai, o campo passa a ser
  `.nullable()` de verdade, e um contrato quebrado volta a virar `ContractError`.
- **Teste de regressão** garantindo que a IE sobrevive ao ciclo salvar →
  recarregar, que é o sintoma que o usuário relata.
- A tela deixa explícito que a IE editada na seção "Sede" é a **do
  estabelecimento** — que é a que a NFC-e usa.

## Capabilities

### New Capabilities
- `fiscal-settings-ui`: dados fiscais da empresa e do estabelecimento emissor na
  interface, incluindo a IE do emitente exibida na página de Empresa.

> Como na change irmã de CSC: `openspec/specs/` deste repositório está vazio
> porque o sync do change arquivado `2026-08-04-add-fiscal-mvp-nfce` nunca rodou.
> Por isso o delta entra como **ADDED**.

### Modified Capabilities
<!-- Nenhuma, pela ausência de baseline sincronizado (ver nota acima). -->

## Impact

- `src/modules/companies/presentation/controllers/company-controller.ts`:
  `applySede` ganha uma linha; nenhuma mudança de fluxo.
- `src/modules/companies/data/mappers/company.mapper.ts`: remoção do
  `.default(null)` em `stateRegistration` — **só depois** do backend publicar o
  campo, senão toda leitura de empresa passa a falhar com `ContractError`.
- `src/modules/companies/data/mappers/company.mapper.spec.ts` e o spec do
  controller: casos novos.
- **Ordem obrigatória**: a etapa do mapper depende da change irmã
  (`gestao_fiscal_backend/openspec/changes/retornar-ie-estabelecimento`). A etapa
  do `applySede` não depende de nada e pode ir antes.
- **Nenhuma mudança de camada ou de fronteira**: domain, data e presentation
  seguem como estão. Nenhum `eslint-disable` deve ser necessário.
- Sem impacto em permissões: a seção "Sede" já é gated pelo mesmo gating da página
  de Empresa.
