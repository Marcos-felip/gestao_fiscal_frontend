## Why

O backend passa a resolver CFOP, situação tributária e alíquotas por operação, em
vez de ler direto do cadastro do produto. Isso só vira produto se o usuário puder
**cadastrar** essas regras e **conferir** o que elas produzem.

E conferir é o ponto. Hoje a única forma de descobrir o que vai sair numa nota é
emitir e abrir o XML — o que consome numeração. Quando algo sai errado, não há
como saber qual regra respondeu.

## What Changes

- **Cadastro de regras fiscais** — lista, criação, edição e remoção, gated por
  `fiscal.rules.read` e `fiscal.rules.edit`.
- **Formulário em duas metades**: os critérios que fazem a regra casar (NCM, CEST,
  UF de destino, tipo de operação, perfil do destinatário) e o resultado que ela
  produz (CFOP, situação tributária, alíquotas).
- **Simulador** — escolher produto e operação e ver o quadro que sairia, com a
  regra que respondeu. É a ferramenta de conferência do contador e a de
  diagnóstico de quem suporta.
- **Origem do imposto visível no documento fiscal**: o detalhe do documento passa
  a mostrar, por item, qual regra determinou o quadro — ou que veio do cadastro
  do produto.
- **Conflito de regras exibido como erro acionável**: quando duas regras
  igualmente específicas casam, a API recusa nomeando as duas. A interface leva o
  usuário direto para elas, em vez de mostrar texto solto.

## Capabilities

### New Capabilities
- `fiscal-rules-ui`: cadastro de regras fiscais, simulação do quadro tributário e
  exibição da origem do imposto nos documentos.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio. -->

## Impact

- Módulo `fiscal-rules` novo no frontend, seguindo o fluxo
  `Page → Controller → UseCase → Repository → HttpClient` com mapper Zod.
- Detalhe do documento fiscal ganha a origem do quadro por item.
- **Gating** novo na sidebar e nas rotas, espelhando as permissões criadas no
  backend.
- **Depende do backend**: a change irmã precisa ir primeiro.
- Enums de situação tributária reaproveitados da etapa 1 — validados com
  `z.nativeEnum`, conforme a regra de [Enums no mapper](../../../AGENTS.md).
- Etapa **2** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
