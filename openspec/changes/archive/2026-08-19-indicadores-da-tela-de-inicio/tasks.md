> A tela consome os sete endpoints da change irmã do backend. Duas decisões que
> economizam retrabalho: o gating de permissão decide o que é **requisitado**
> (não só o que é exibido), e nenhum percentual compara período em curso com
> período fechado.

## 1. Domínio e contrato

- [x] 1.1 `domain/responses/` com um arquivo por resposta dos sete blocos
- [x] 1.2 `domain/interfaces/i-dashboard-repository.interface.ts`
- [x] 1.3 `core/enums/sales-chart-range.enum.ts` com rótulos
- [x] 1.4 DTO do gráfico com o período

## 2. Data

- [x] 2.1 `dashboard.mapper.ts` com schema Zod por bloco
- [x] 2.2 Decimais em string coagidos para número no mapper
- [x] 2.3 `salesTotal` nulo preservado como nulo — nunca coagido para zero
- [x] 2.4 `dashboard-repository.ts` com os sete métodos
- [x] 2.5 `dashboard.mapper.spec.ts`

## 3. Aplicação e composição

- [x] 3.1 Um use case por bloco
- [x] 3.2 `dashboard.factory.ts` como composition root

## 4. Controller

- [x] 4.1 Estado por bloco: carregando, pronto, falhou, oculto
- [x] 4.2 Carga em paralelo, sem barreira entre os blocos
- [x] 4.3 Só requisita o bloco cuja permissão o usuário tem
- [x] 4.4 Nova tentativa por bloco
- [x] 4.5 Troca de período do gráfico recarrega só o gráfico
- [x] 4.6 `dashboard-controller.spec.ts`

## 5. Tela

- [x] 5.1 Cartões de faturamento do dia e do mês, com o período anterior como contexto
- [x] 5.2 Cartões de a receber e a pagar destacando o vencido
- [x] 5.3 Gráfico SVG com alternância 30 dias / 12 meses e vazio explicado
- [x] 5.4 Cartão de caixa respeitando o fechamento às cegas
- [x] 5.5 Cartão fiscal com situações do mês e alerta de certificado
- [x] 5.6 Cartão de estoque com zerados e no mínimo
- [x] 5.7 Falha isolada por cartão, com "tentar novamente"
- [x] 5.8 Esqueleto por cartão durante a carga
- [x] 5.9 Grade se reorganiza sem buracos quando faltam permissões
- [x] 5.10 Empresa sem nenhum movimento vê orientação de primeiros passos

## 6. Verificação

- [x] 6.1 `npm run verify` limpo
