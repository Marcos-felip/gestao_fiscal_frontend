# dashboard-ui Specification

## Purpose
TBD - created by archiving change indicadores-da-tela-de-inicio. Update Purpose after archive.
## Requirements
### Requirement: A tela de início mostra dados reais
A tela de início SHALL exibir os indicadores vindos da API e NÃO SHALL exibir
valores fixos escritos no código.

Um painel que mostra zero para quem vendeu o dia inteiro é pior do que uma tela
vazia: ele ensina o usuário a não olhar para a primeira tela do produto.

#### Scenario: Empresa com movimento
- **WHEN** a empresa tem vendas, títulos e documentos no período
- **THEN** cada cartão mostra o número que a API devolveu

#### Scenario: Carregamento
- **WHEN** os blocos ainda estão sendo buscados
- **THEN** a tela mostra esqueleto no lugar de cada cartão, e não valores provisórios

#### Scenario: Empresa recém-criada
- **WHEN** a empresa não tem nenhum movimento em nenhum bloco
- **THEN** a tela orienta os primeiros passos em vez de repetir cartões zerados

### Requirement: Cada bloco carrega e falha sozinho
A tela SHALL requisitar os blocos em paralelo e SHALL isolar a falha de um bloco
dos demais, oferecendo nova tentativa apenas para o que falhou.

#### Scenario: Um bloco falha
- **WHEN** a consulta de um bloco retorna erro
- **THEN** só aquele cartão mostra a falha, com ação de tentar novamente, e os outros seguem exibindo seus números

#### Scenario: Nova tentativa
- **WHEN** o usuário aciona "tentar novamente" no cartão que falhou
- **THEN** apenas aquele bloco é requisitado de novo

### Requirement: A tela pede apenas o que o usuário pode ver
A tela SHALL consultar somente os blocos cuja permissão o usuário possui, e
SHALL omitir os demais.

Pedir para tomar `403` transformaria falta de permissão em mensagem de erro —
e "sem perfil = sem acesso" é comportamento esperado, não falha.

#### Scenario: Usuário sem acesso ao financeiro
- **WHEN** o usuário não tem `receivables.list`
- **THEN** o cartão de contas a receber não é requisitado nem exibido, e nenhum erro aparece

#### Scenario: Usuário só com vendas
- **WHEN** o usuário tem apenas `sales.list`
- **THEN** a tela mostra faturamento e gráfico, e o restante da grade se reorganiza sem deixar buracos

### Requirement: Gráfico de faturamento
A tela SHALL apresentar a evolução do faturamento com alternância entre os
últimos 30 dias e os últimos 12 meses.

#### Scenario: Troca de período
- **WHEN** o usuário alterna para 12 meses
- **THEN** a série é recarregada e o eixo passa a mostrar meses

#### Scenario: Período sem nenhuma venda
- **WHEN** todos os pontos do período são zero
- **THEN** o gráfico informa que não houve venda no período, em vez de desenhar uma linha rente ao eixo sem explicação

### Requirement: Comparação sem percentual enganoso
A tela NÃO SHALL apresentar variação percentual entre um período em curso e um
período fechado; SHALL apresentar o valor do período anterior como contexto.

Às nove da manhã, comparar o dia em curso com o dia inteiro de ontem produz uma
queda de 90% que não significa nada — e é o tipo de número que faz alguém tomar
decisão errada.

#### Scenario: Faturamento do dia
- **WHEN** o cartão de vendas de hoje é exibido
- **THEN** ele mostra o valor de ontem como contexto, sem percentual de variação

### Requirement: O fechamento às cegas é respeitado na tela
Quando o total de uma sessão de caixa aberta vier nulo, a tela SHALL informar que
o valor está oculto pela conferência às cegas, e NÃO SHALL exibi-lo como zero.

#### Scenario: Empresa com conferência às cegas
- **WHEN** o backend devolve `salesTotal` nulo para a sessão aberta
- **THEN** o cartão explica que o valor está oculto até o fechamento

#### Scenario: Empresa sem conferência às cegas
- **WHEN** o backend devolve o valor
- **THEN** o cartão o exibe normalmente

