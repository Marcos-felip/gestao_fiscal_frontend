## ADDED Requirements

### Requirement: Importar o XML da nota de entrada pela interface
A interface SHALL permitir enviar o XML de uma NF-e de entrada e SHALL exibir o
que dele foi lido — fornecedor, número da nota, itens, valores e parcelas — antes
de qualquer confirmação.

#### Scenario: XML aceito
- **WHEN** o usuário envia um XML válido
- **THEN** vê o fornecedor, a nota e a lista de itens com o resultado do casamento

#### Scenario: Arquivo recusado
- **WHEN** o backend recusa o arquivo
- **THEN** a mensagem dele é exibida como veio, em português

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `purchases.import`
- **THEN** a ação de importar não é exibida

### Requirement: A tela mostra como cada item foi casado
A interface SHALL distinguir, para cada item, se ele foi casado por código de
barras, por memória de importação anterior daquele fornecedor, ou se não foi
casado.

Casamento por memória é uma escolha que alguém fez antes, não uma certeza — e
carrega o erro daquela vez. Exibir os dois com a mesma cara faria o usuário
confirmar uma entrada de estoque sem saber no que estava confiando.

#### Scenario: Item casado por código de barras
- **WHEN** o item foi casado pelo GTIN
- **THEN** a tela mostra o produto e indica que veio do código de barras

#### Scenario: Item casado por memória
- **WHEN** o item foi casado pelo código que o fornecedor usou antes
- **THEN** a tela mostra o produto e deixa claro que veio de uma escolha anterior, que pode ser trocada

#### Scenario: Item não casado
- **WHEN** o item não foi reconhecido
- **THEN** ele é destacado e a tela informa quantos itens ainda faltam resolver

### Requirement: Resolver o item que sobrou, sem criar produto por acidente
A interface SHALL permitir apontar o produto do catálogo para um item não casado,
e SHALL oferecer a criação de um produto novo já preenchido com os dados do XML.

A criação SHALL ser sempre um ato explícito.

Criar sozinho encheria o catálogo de duplicatas com o nome que o fornecedor
escreve — "REFRIG LATA 350" ao lado de "Refrigerante Lata 350ml".

#### Scenario: Apontar produto existente
- **WHEN** o usuário busca e escolhe um produto para o item
- **THEN** o item passa a casado e a escolha vale para as próximas notas daquele fornecedor

#### Scenario: Criar produto a partir do item
- **WHEN** o usuário opta por criar o produto
- **THEN** o formulário abre preenchido com descrição, NCM, unidade e código de barras do XML

### Requirement: Divergência de unidade é dita, não corrigida
A interface SHALL destacar o item cuja unidade no XML difere da unidade do
produto casado, e SHALL NOT converter quantidade automaticamente.

Caixa com 12 unidades é o erro mais provável de uma nota real. Converter por
palpite multiplica ou divide o estoque por um número que ninguém conferiu.

#### Scenario: Unidade diferente
- **WHEN** o XML traz `CX` e o produto está em `UN`
- **THEN** o item é exibido com aviso, e a quantidade permanece a do XML

### Requirement: Confirmar gera a compra em rascunho, não estoque
A interface SHALL deixar explícito que a confirmação cria uma **compra em
rascunho**, e SHALL levar o usuário até ela.

#### Scenario: Importação completa
- **WHEN** todos os itens estão casados e o usuário confirma
- **THEN** a compra em rascunho é criada e a tela leva até ela para conferência e confirmação

#### Scenario: Item pendente
- **WHEN** ainda há item sem casar
- **THEN** a confirmação fica indisponível, dizendo quantos faltam

### Requirement: A importação é alcançável a partir das compras
A interface SHALL oferecer a importação a partir da lista de compras.

Tela sem porta de entrada é tela que não existe — foi o que aconteceu com a lista
de pendências fiscais, que nasceu alcançável só pela URL.

#### Scenario: Caminho até a importação
- **WHEN** o usuário abre a lista de compras
- **THEN** encontra a ação de importar nota de entrada

### Requirement: Importações anteriores continuam consultáveis
A interface SHALL listar as importações, distinguindo as que viraram compra das
que ficaram pendentes, e SHALL permitir baixar o XML de cada uma.

#### Scenario: Retomar pendente
- **WHEN** o usuário abre uma importação com itens não resolvidos
- **THEN** pode continuar de onde parou, sem reenviar o arquivo
