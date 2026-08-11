## Why

O contador recebe os XMLs das notas — é deles que ele monta a escrituração. Hoje
a única forma de tirar XML do sistema é pelo detalhe de um documento, um por vez.
Fechar um mês com 300 notas é abrir 300 telas.

Esta change dá ao usuário a exportação do período inteiro, consumindo a rota que
a change irmã do backend publica.

## What Changes

- **Ação "Exportar XMLs" na lista de documentos fiscais**, abrindo um modal com
  período, estabelecimento, modelo e ambiente.
- **Período com atalhos** de mês fechado (mês passado, mês atual), que é como o
  contador pensa — ninguém digita data no fechamento.
- **Download do ZIP** a partir da resposta em stream (`Blob`), seguindo o mesmo
  caminho já usado no download do XML individual e do DANFE.
- **Ambiente explícito e visível**: produção é o padrão; escolher homologação
  exibe aviso de que aqueles arquivos não valem para escrituração.
- **Feedback de operação longa**: a exportação pode demorar. Botão em estado de
  carregamento, bloqueio de clique repetido e mensagem de que o arquivo está
  sendo preparado.
- **Erros do backend traduzidos**: período acima de 92 dias e lote acima de 5.000
  documentos voltam como `400` e devem virar mensagem clara no modal, resolvida
  por `instanceof` de `DomainError` — nunca por comparação de string.
- **Gating** por `fiscal.read`, o mesmo da lista de documentos.

## Capabilities

### New Capabilities
- `fiscal-file-export-ui`: exportação em lote dos XMLs de um período pela
  interface, para entrega ao contador.

### Modified Capabilities
<!-- Nenhuma; `openspec/specs/` deste repositório ainda está vazio (o sync do
change arquivado `2026-08-04-add-fiscal-mvp-nfce` nunca rodou). -->

## Impact

- `src/modules/fiscal/` ganha caso de uso, repository e schema de exportação,
  seguindo o fluxo `Page → Controller → UseCase → Repository → HttpClient`.
- **Resposta binária**: o repository precisa pedir `Blob`/`ArrayBuffer`, como já
  acontece no DANFE. Não passa por mapper Zod — não é JSON.
- `src/modules/fiscal/presentation/pages/` — a lista de documentos ganha a ação.
- **Depende do backend**: a change irmã
  (`gestao_fiscal_backend/openspec/changes/exportar-xmls-em-lote`) precisa ir
  primeiro.
- Sem impacto em permissões: reaproveita `fiscal.read`.
- Etapa **0** do roteiro fiscal (`gestao_fiscal_backend/ROADMAP_FISCAL.md`).
