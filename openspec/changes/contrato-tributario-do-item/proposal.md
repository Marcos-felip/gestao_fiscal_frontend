## Why

A seção fiscal do cadastro de produto tem cinco campos que não fazem nada:
`cstPis`, `cstCofins`, `aliquotaIcms`, `aliquotaPis` e `aliquotaCofins`. O
usuário preenche "Alíquota ICMS 18%", salva, vê o toast de sucesso — e a nota sai
idêntica. Os valores são gravados no banco e nunca lidos: o motor fiscal cravava
PIS e COFINS em CST 07 e derivava o ICMS só de origem + CSOSN.

Um campo de formulário é uma promessa. Estes prometiam controle fiscal que não
existia.

A change irmã do backend acaba com isso: o item da nota passa a carregar o quadro
tributário completo, e esses campos passam a alimentar o XML. Esta change ajusta
a interface para acompanhar — e, mais importante, para **exigir** o que virou
obrigatório.

## What Changes

- **CST de PIS e de COFINS viram obrigatórios** na seção fiscal do produto: sem
  eles o item não compõe o quadro tributário e a venda não emite.
- **Seleção a partir de lista, não texto livre.** Hoje são campos abertos; passam
  a ser `Select` com os códigos válidos e a descrição de cada um — ninguém
  decora que 04 é "monofásica, revenda a alíquota zero".
- **As alíquotas passam a ser exigidas conforme a situação tributária escolhida**,
  espelhando a regra que o backend publica. Situação que não comporta valor não
  pede alíquota.
- **Relatório de pendências fiscais** passa a listar produto sem CST de PIS ou
  COFINS, com o texto que o backend devolve.
- **Aviso de revisão após a migration**: os produtos existentes recebem CST que
  preserva o comportamento anterior, não a classificação correta. A tela do
  produto deve deixar visível que o valor veio de migração e merece conferência
  do contador — especialmente em bebidas, que são monofásicas.

## Capabilities

### New Capabilities
- `product-taxation-ui`: dados tributários do produto na interface — situação
  tributária de ICMS, PIS e COFINS, alíquotas e completude fiscal.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio. -->

## Impact

- `src/modules/products/presentation/` — seção fiscal do formulário e schema de
  validação.
- `src/core/enums/` — enums novos para CST de PIS e de COFINS, com rótulos
  descritivos. Seguir a regra de [Enums no mapper](../../../AGENTS.md): o mapper
  do produto valida com `z.nativeEnum`, nunca `z.string()` + `as`.
- `src/modules/products/data/mappers/product.mapper.ts` — hoje usa
  `value.unit as UnitOfMeasure`; ao tocar o arquivo, migrar também esse cast.
- **Depende do backend**: a change irmã precisa ir primeiro, senão a tela passa a
  exigir campo que a API ainda não usa.
- **Mudança visível para o usuário**: campos que eram opcionais passam a barrar o
  salvamento. Precisa de aviso claro, não de erro seco.
- Etapa **1** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
