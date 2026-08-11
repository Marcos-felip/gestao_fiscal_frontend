## ADDED Requirements

### Requirement: Cadastro de regras fiscais
A interface SHALL permitir listar, criar, editar e remover regras fiscais da
empresa ativa, separando visualmente os critérios de casamento do resultado que a
regra produz.

O acesso SHALL ser gated por `fiscal.rules.read` para leitura e
`fiscal.rules.edit` para escrita.

#### Scenario: Criar regra
- **WHEN** o usuário cadastra uma regra com NCM, UF de destino e o resultado tributário
- **THEN** a regra é salva e passa a aparecer na listagem

#### Scenario: Somente leitura
- **WHEN** o usuário tem `fiscal.rules.read` mas não `fiscal.rules.edit`
- **THEN** a listagem é exibida e as ações de criar, editar e remover ficam indisponíveis

#### Scenario: Sem permissão nenhuma
- **WHEN** o usuário não tem `fiscal.rules.read`
- **THEN** o item não aparece na navegação e a rota não é acessível

### Requirement: Simulação do quadro tributário
A interface SHALL oferecer um simulador que, dado um produto e uma operação,
exibe o CFOP, a situação tributária, as alíquotas e a regra que respondeu — sem
emitir documento.

#### Scenario: Conferir antes de emitir
- **WHEN** o usuário simula a venda de um produto para outra UF
- **THEN** a interface mostra o quadro resultante e identifica a regra aplicada

#### Scenario: Nenhuma regra casou
- **WHEN** a simulação usa um contexto sem regra cadastrada
- **THEN** a interface mostra o quadro vindo do cadastro do produto e deixa claro que nenhuma regra casou

#### Scenario: Simulação não emite
- **WHEN** o usuário executa uma simulação
- **THEN** nenhum documento fiscal é criado e nenhuma numeração é consumida

### Requirement: Origem do imposto visível no documento
O detalhe do documento fiscal SHALL exibir, por item, qual regra determinou o
quadro tributário, ou indicar que veio do cadastro do produto.

#### Scenario: Rastrear item
- **WHEN** o usuário abre um documento fiscal e olha um item
- **THEN** vê qual regra fiscal determinou o CFOP e a situação tributária daquele item

### Requirement: Conflito entre regras é acionável
Quando a API recusar a emissão por empate entre regras, a interface SHALL
identificar as regras em conflito e oferecer caminho direto para editá-las.

#### Scenario: Empate na emissão
- **WHEN** a emissão falha por duas regras igualmente específicas
- **THEN** a interface nomeia as duas e permite abrir cada uma para correção, em vez de exibir apenas a mensagem de erro
