# nfe-emission-ui Specification

## Purpose
A emissão de NF-e modelo 55 pela interface: quem escolhe o modelo, o que a tela
pergunta antes de emitir e o que ela mostra quando o cadastro do destinatário não
está pronto.

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
