## Why

**A tela de início mente.** `dashboard-page.vue` roda um `setTimeout(700ms)`
fingindo carregamento e entrega quatro cartões com valores escritos no código —
`R$ 0,00`, `0`, `0`, `0` — sob a legenda "Nenhuma nota emitida ainda" e um
painel dizendo "Tudo pronto para começar".

Quem vendeu o dia inteiro abre o sistema e lê que faturou zero. Depois de duas
visitas, ninguém mais olha para a primeira tela do produto: o usuário passa a
navegar direto para o PDV e nunca fica sabendo que há títulos vencidos, uma
NFC-e rejeitada ontem ou um caixa que ficou aberto desde a semana passada.

O backend acabou de expor os sete endpoints que respondem tudo isso
(change irmã `indicadores-da-tela-de-inicio` do repositório do backend). Falta a
tela consumi-los.

Além disso, dois dos quatro indicadores da maquete — produtos e parceiros
cadastrados — são números de implantação, não de operação. Contam quantas vezes
alguém usou um formulário, não como o negócio foi hoje. Eles saem.

## What Changes

- **Módulo `dashboard` ganha as camadas que não tinha.** Hoje ele é só
  `presentation/`; passa a ter `domain/`, `data/`, `application/` e `factories/`,
  como todo módulo do projeto.
- **Cada bloco carrega e falha sozinho.** Sete requisições em paralelo; o cartão
  que falhar mostra o próprio erro com "tentar novamente", sem derrubar os
  outros.
- **A tela só pede o que o usuário pode ver.** O gating usa `usePermissions` com
  a mesma permissão que o endpoint exige, então o bloco negado não é requisitado
  nem aparece — em vez de pedir, tomar `403` e mostrar erro.
- **Gráfico de faturamento em SVG**, com alternância entre 30 dias e 12 meses.
- **Nenhuma variação percentual enganosa.** Comparar um dia em curso com um dia
  fechado produziria "-90%" às nove da manhã. O contexto vem como valor
  absoluto do período anterior.
- **O fechamento às cegas é respeitado na tela**: quando o backend devolve o
  total da sessão como nulo, o cartão diz que o valor está oculto — não zero.

**Fora do escopo, de propósito:**

- **Filtro por estabelecimento.** O contrato aceita `establishmentId`, mas não há
  seletor de filial na home. Entra junto com o seletor, não antes dele.
- **Relatórios.** Período livre, exportação e detalhamento têm tela própria.
- **Personalizar quais cartões cada um vê.** A permissão já faz esse recorte.

## Capabilities

### New Capabilities
- `dashboard-ui`: a tela de início que mostra a operação do dia — o que foi
  vendido, o que entra e sai de dinheiro, como está a emissão, o que está
  acabando e quais caixas estão abertos.

## Impact

- **Módulo `src/modules/dashboard/`**: camadas novas e componentes novos; a
  maquete (`dashboard-stats.vue` com os literais) é substituída.
- **`src/core/enums/sales-chart-range.enum.ts`** novo.
- **Sem dependência nova.** O gráfico é SVG inline: trazer uma biblioteca de
  gráficos para um cartão custaria mais peso do que o desenho inteiro.
- **API.md** já espelhado com os sete contratos.
