## Why

O formulário de configuração fiscal aceita qualquer texto no CSC. O schema de
apresentação declara `codigoCsc: z.string()` e `idCsc: z.string()`
(`fiscal-settings-schema.ts:44-45`), sem tamanho nem formato, e os inputs da tela
têm apenas `maxlength` (64 no código, 20 no ID).

Em 10/08/2026 um CSC de 6 dígitos foi salvo por essa tela, emitiu, consumiu
numeração de nota e voltou da SEFAZ como **rejeição 464 — QR-Code com hash
inválido**. Do lado do usuário, a tela deu sucesso: nada indicava que o valor
estava errado.

Esta change espelha no formulário a regra que a change irmã cria no backend, para
o erro aparecer **antes** do round-trip, com texto que diz onde pegar o valor
certo — e não uma mensagem genérica de 400 vinda da API.

## What Changes

- **Validação de `codigoCsc`** no schema de apresentação: 16 a 64 caracteres
  alfanuméricos. O mínimo é 16 e não 32 porque o tamanho varia por UF (MG emite 32
  hexadecimais); a regra pega o erro de digitação sem inventar regra estadual.
- **Validação de `idCsc`**: apenas dígitos, 1 a 6 posições, com o `maxlength` do
  input corrigido de 20 para 6.
- **Texto de apoio nos dois campos** explicando que ID e código são valores
  distintos obtidos no portal da SEFAZ da UF (credenciamento NFC-e) — a confusão
  entre os dois é o erro mais comum.
- **Mensagens em PT-BR** no padrão do módulo, resolvidas por `instanceof` de
  `DomainError` quando vierem da API, nunca por comparação de string.
- O CSC **continua sem ser exibido em log, toast ou telemetria**.

## Capabilities

### New Capabilities
- `fiscal-settings-ui`: configuração fiscal do estabelecimento na interface —
  ambiente, série/numeração, CSC/idCSC e metadados do certificado.

> A capability nasceu no change arquivado `2026-08-04-add-fiscal-mvp-nfce`, mas
> `openspec/specs/` deste repositório está vazio: o sync das delta specs nunca
> rodou. Por isso o delta entra como **ADDED** e não como MODIFIED. Sincronizar as
> specs do change arquivado é trabalho separado, fora desta change.

### Modified Capabilities
<!-- Nenhuma, pela ausência de baseline sincronizado (ver nota acima). -->

## Impact

- `src/modules/fiscal/presentation/schemas/fiscal-settings-schema.ts`: regras de
  tamanho e formato nos dois campos.
- `src/modules/fiscal/presentation/pages/fiscal-settings-detail-page.vue`: ajuste
  do `maxlength` do ID do CSC e textos de apoio nos dois inputs.
- **Nenhuma mudança de camada**: a validação é de apresentação, o repository e o
  mapper não mudam. Nenhum `eslint-disable` de fronteira deve ser necessário —
  se for, o desenho está errado.
- **Depende do backend**: a change irmã
  (`gestao_fiscal_backend/openspec/changes/validar-formato-csc`) precisa ir
  primeiro, senão a tela recusa um valor que a API ainda aceita e as duas regras
  divergem.
- Configurações já salvas com CSC inválido passam a acusar erro ao abrir o
  formulário para edição. É o comportamento desejado.
