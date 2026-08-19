# product-taxation-ui Specification

## Purpose
Campos fiscais do produto na interface: situação tributária de ICMS, PIS e
COFINS, com a alíquota condicionada à forma de apuração. Alimenta o quadro
tributário que o backend monta por item.
## Requirements
### Requirement: Situação tributária de PIS e COFINS no cadastro do produto
O formulário de produto SHALL exigir a situação tributária de PIS e de COFINS, e
SHALL oferecê-las como seleção a partir dos códigos válidos, com a descrição de
cada um.

#### Scenario: Produto novo sem PIS ou COFINS
- **WHEN** o usuário tenta salvar um produto sem escolher CST de PIS ou de COFINS
- **THEN** o formulário acusa erro em português nos campos e não envia a requisição

#### Scenario: Seleção com descrição
- **WHEN** o usuário abre a lista de CST de PIS
- **THEN** cada opção exibe o código e a descrição, sem exigir que ele saiba de cor o significado

#### Scenario: Produto completo
- **WHEN** o usuário preenche NCM, CFOP, origem, situação de ICMS e as situações de PIS e COFINS
- **THEN** o produto é salvo e o indicador de completude fiscal fica positivo

### Requirement: Campos de valor pedidos conforme a situação tributária
A interface SHALL exigir alíquota e base apenas quando a situação tributária
escolhida os comportar, e SHALL ocultar ou desabilitar os campos quando não.

#### Scenario: Situação sem valores
- **WHEN** o usuário escolhe uma situação tributária que não comporta valores
- **THEN** os campos de alíquota correspondentes não são exigidos

#### Scenario: Situação que exige alíquota
- **WHEN** o usuário escolhe uma situação tributária que exige alíquota
- **THEN** o campo passa a ser obrigatório e o formulário o cobra antes de salvar

### Requirement: Pendências fiscais incluem PIS e COFINS
O relatório de pendências fiscais dos produtos SHALL listar produto sem situação
tributária de PIS ou COFINS, exibindo o motivo devolvido pela API.

#### Scenario: Listagem de pendências
- **WHEN** existem produtos sem CST de PIS cadastrado
- **THEN** eles aparecem no relatório de pendências com o motivo correspondente

### Requirement: Valores herdados de migração são sinalizados para revisão
A interface SHALL indicar que a situação tributária de PIS e COFINS dos produtos
anteriores à mudança foi preenchida por migração para preservar comportamento, e
SHALL orientar a revisão com o contador.

#### Scenario: Produto migrado
- **WHEN** o usuário abre um produto cujo CST de PIS veio da migração
- **THEN** a seção fiscal exibe aviso de que o valor preserva o comportamento anterior e merece conferência, citando bebidas como caso típico

#### Scenario: Produto revisado
- **WHEN** o usuário altera e salva a situação tributária do produto
- **THEN** o aviso de revisão deixa de ser exibido para aquele produto

