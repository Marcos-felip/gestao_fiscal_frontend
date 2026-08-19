# nfe-emission-ui Specification

## Purpose
A emissão de NF-e modelo 55 pela interface: quem escolhe o modelo, o que a tela
pergunta antes de emitir, o que ela mostra quando o cadastro do destinatário não
está pronto e como o detalhe exibe o retrato congelado da emissão.

## Requirements
### Requirement: Emitir NF-e pela interface
A interface SHALL permitir emitir NF-e a partir do detalhe da venda, gated por
`fiscal.nfe.emit`, acompanhando o status até um estado terminal.

#### Scenario: Emissão com destinatário completo
- **WHEN** o usuário confirma a emissão de uma venda para cliente pessoa jurídica com cadastro completo
- **THEN** a NF-e é enfileirada e a interface acompanha o status por polling até autorizar, rejeitar ou falhar

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.nfe.emit`
- **THEN** a ação de emitir NF-e não é exibida

### Requirement: A finalidade é perguntada, não deduzida
O diálogo de emissão SHALL perguntar se a mercadoria será revendida ou consumida,
em português, e SHALL NOT assumir um padrão.

O mesmo produto muda de tratamento conforme o destino da mercadoria, e quem sabe
é quem lançou a venda. A pergunta aparece como "Revender" / "Consumir ou usar",
não como `indFinal`.

#### Scenario: Escolha da finalidade
- **WHEN** o usuário abre a emissão de NF-e
- **THEN** precisa escolher a finalidade antes de confirmar

### Requirement: Pendências do destinatário mostradas como vieram
A interface SHALL exibir a recusa do backend quando o cadastro do destinatário
estiver incompleto, com a mensagem que nomeia cada campo faltante.

A conferência de completude vive no backend: duplicá-la na tela criaria uma
segunda regra para divergir da primeira. A tela não oferece link direto para o
cadastro do parceiro — a mensagem o identifica por nome, não por id.

#### Scenario: Parceiro sem endereço completo
- **WHEN** o usuário emite para um parceiro sem CEP, município ou indicador de IE
- **THEN** a interface exibe a mensagem do backend nomeando os campos faltantes

### Requirement: Indicador de IE no cadastro de parceiro
O formulário de parceiro SHALL permitir informar o indicador de inscrição
estadual, com as opções descritas em português, e o código IBGE do município.

#### Scenario: Escolher o indicador
- **WHEN** o usuário edita um parceiro pessoa jurídica
- **THEN** pode escolher entre contribuinte, isento e não contribuinte, com descrição de cada opção

#### Scenario: Código IBGE pelo CEP
- **WHEN** o usuário informa o CEP do parceiro
- **THEN** o código IBGE do município é preenchido pela consulta de endereço

### Requirement: Série e numeração de NF-e na configuração fiscal
A tela de configuração fiscal SHALL exibir série e próxima numeração de NF-e ao
lado das de NFC-e, agrupadas por modelo, deixando explícito que são sequências
independentes.

#### Scenario: Configurar numeração
- **WHEN** o usuário abre a seção de numeração da configuração fiscal
- **THEN** vê um bloco por modelo, cada um com sua série e seu próximo número

### Requirement: Modelo identificado na lista
A lista de documentos fiscais SHALL identificar o modelo de cada documento e
permitir filtrar por ele.

#### Scenario: Filtrar por modelo
- **WHEN** o usuário filtra a lista por NF-e
- **THEN** apenas documentos do modelo 55 são exibidos

### Requirement: DANFE baixado no formato que o servidor declarou
A interface SHALL respeitar o tipo de conteúdo devolvido no download do DANFE.

O DANFE da NF-e é HTML e o da NFC-e é PDF. Forçar `application/pdf` entregou um
HTML renomeado que o navegador recusou abrir.

#### Scenario: DANFE de NF-e
- **WHEN** o usuário baixa o DANFE de uma NF-e
- **THEN** o arquivo é salvo como `.html`, com o tipo declarado pelo servidor

### Requirement: O retrato da emissão é exibido como foi gravado
O detalhe do documento SHALL exibir os dados do snapshot no formato em que o
backend os grava, incluindo itens, pagamentos, totais fiscais e o quadro
tributário de cada item.

O snapshot é gravado na versão 2, com as chaves em português (`itens`,
`pagamentos`, `venda`, `emitente`). O frontend o lê por mapper próprio com Zod —
o `as FiscalSnapshot` que existia antes transformou contrato divergente em nota
sem itens, por dois dias, sem um erro sequer.

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
O documento continua utilizável: ele tem chave, protocolo e XML.

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
