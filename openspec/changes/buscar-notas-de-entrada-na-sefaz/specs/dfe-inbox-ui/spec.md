## ADDED Requirements

### Requirement: Caixa de entrada das notas descobertas
A interface SHALL listar as notas emitidas contra o CNPJ da empresa que a SEFAZ
entregou, com emitente, valor, data, situação e manifestação.

#### Scenario: Notas pendentes de decisão
- **WHEN** o usuário abre a caixa de entrada
- **THEN** vê as notas descobertas, com as que ainda não foram manifestadas em destaque

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `dfe.read`
- **THEN** a caixa de entrada não é exibida

### Requirement: Emitente desconhecido é destacado
A interface SHALL destacar a nota cujo emitente nunca foi fornecedor da empresa.

É o formato que a nota fria tem, e é a única chance de alguém reparar antes de
o prazo de manifestação passar.

#### Scenario: Primeira nota de um emitente
- **WHEN** o emitente não tem compra anterior
- **THEN** a nota aparece destacada, com o aviso de que a empresa nunca comprou dele

### Requirement: Manifestar com o efeito dito antes
A interface SHALL permitir manifestar ciência, confirmação, desconhecimento e
operação não realizada, e SHALL explicar em português o efeito de cada uma antes
do envio.

`210210` não diz nada a ninguém. O usuário precisa ler "ciência: confirma que
soube da operação e libera o XML completo".

#### Scenario: Escolher a manifestação
- **WHEN** o usuário abre a manifestação de uma nota
- **THEN** vê as opções com o efeito de cada uma descrito

#### Scenario: Manifestação recusada
- **WHEN** a SEFAZ recusa o evento
- **THEN** o motivo é exibido como veio, e a situação anterior é preservada

### Requirement: Declaração contra o emitente exige confirmação explícita
A interface SHALL exigir confirmação explícita para desconhecimento e para
operação não realizada.

São declarações à SEFAZ contra quem emitiu, com efeito legal — o mesmo peso que
já faz o cancelamento de documento pedir confirmação.

#### Scenario: Desconhecer operação
- **WHEN** o usuário escolhe desconhecer a operação
- **THEN** precisa confirmar antes do envio, com o efeito declarado na confirmação

### Requirement: Resumo é exibido como resumo
A interface SHALL deixar claro quando só existe o resumo da nota, e SHALL NOT
oferecer importação nesse estado.

Resumo traz emitente, valor e chave — não traz itens. Oferecer importação ali
levaria a uma tela de conferência vazia, sem explicar por quê.

#### Scenario: Nota só com resumo
- **WHEN** a nota ainda não teve ciência manifestada
- **THEN** a tela diz que só há o resumo e indica a ciência como caminho para obter os itens

#### Scenario: XML completo disponível
- **WHEN** o XML completo foi obtido
- **THEN** a importação é oferecida, levando à tela de conferência já existente

### Requirement: O estado da descoberta é visível
A interface SHALL exibir quando foi a última consulta à SEFAZ e SHALL informar
quando ela foi recusada por frequência.

Sem isso, "nenhuma nota nova" é indistinguível de "a consulta falha há três
dias" — e a segunda é uma compra que ninguém viu chegar.

#### Scenario: Consulta recusada
- **WHEN** a SEFAZ recusou por consumo indevido
- **THEN** a tela informa a recusa e quando a próxima tentativa é permitida
