## ADDED Requirements

### Requirement: O retrato da emissão é exibido como foi gravado
O detalhe do documento SHALL exibir os dados do snapshot no formato em que o
backend os grava, incluindo itens, pagamentos, totais fiscais e o quadro
tributário de cada item.

#### Scenario: Nota com itens
- **WHEN** o usuário abre um documento autorizado
- **THEN** vê os itens com descrição, quantidade, unidade, valor, NCM, CFOP e situação tributária

#### Scenario: Formas de pagamento
- **WHEN** o snapshot registra os pagamentos
- **THEN** cada forma é exibida pelo nome em português, com o valor

### Requirement: Retrato ilegível é dito, não escondido
Quando houver snapshot e o formato não for reconhecido, a interface SHALL avisar
que não conseguiu lê-lo, e SHALL NOT exibir a nota como se ela não tivesse itens.

Formato desconhecido é contrato divergindo — bug nosso, não ausência de dados.
Silenciar isso escondeu, por dois dias, o snapshot inteiro deixando de aparecer.

#### Scenario: Formato desconhecido
- **WHEN** o snapshot está num formato que esta versão não conhece
- **THEN** a tela avisa e aponta o XML como fonte do que foi enviado, e o restante do detalhe continua utilizável

#### Scenario: Documento sem snapshot
- **WHEN** o documento não tem snapshot
- **THEN** nenhum aviso é exibido — não há retrato a ler

### Requirement: Grupos exclusivos do modelo 55 no detalhe
O detalhe de uma NF-e SHALL exibir natureza da operação, tipo, finalidade,
destino da mercadoria e o destinatário completo; e SHALL exibir transporte e
cobrança quando informados.

#### Scenario: Detalhe de NF-e
- **WHEN** o usuário abre uma NF-e
- **THEN** vê a operação e o destinatário com endereço e indicador de inscrição estadual

#### Scenario: Detalhe de NFC-e
- **WHEN** o usuário abre uma NFC-e
- **THEN** os grupos do modelo 55 não aparecem, e o destinatário só é exibido se o consumidor tiver se identificado

#### Scenario: Nota sem transporte
- **WHEN** a NF-e foi emitida sem transporte nem cobrança
- **THEN** a seção não é exibida, sem campos vazios
