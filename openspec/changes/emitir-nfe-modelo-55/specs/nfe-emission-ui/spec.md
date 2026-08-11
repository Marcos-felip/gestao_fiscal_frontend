## ADDED Requirements

### Requirement: Emitir NF-e pela interface
A interface SHALL permitir emitir NF-e a partir de uma operação comercial,
exigindo escolha de destinatário e natureza da operação, gated por
`fiscal.nfe.emit`.

#### Scenario: Emissão com destinatário completo
- **WHEN** o usuário escolhe um parceiro com cadastro completo e confirma a emissão
- **THEN** a NF-e é enfileirada e a interface acompanha o status até um estado terminal

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.nfe.emit`
- **THEN** a ação de emitir NF-e não é exibida

### Requirement: Pendências do destinatário mostradas antes do envio
A interface SHALL verificar a completude do destinatário antes de enviar a
emissão e SHALL listar o que falta, com caminho direto para o cadastro do
parceiro.

#### Scenario: Parceiro sem endereço completo
- **WHEN** o usuário escolhe um parceiro sem CEP, município ou indicador de IE
- **THEN** a interface lista os campos faltantes e oferece link para completar o cadastro, sem enviar a requisição

#### Scenario: Parceiro corrigido
- **WHEN** o usuário completa o cadastro e volta
- **THEN** a emissão fica disponível

### Requirement: Indicador de IE no cadastro de parceiro
O formulário de parceiro SHALL permitir informar o indicador de inscrição
estadual, com as opções descritas em português.

#### Scenario: Escolher o indicador
- **WHEN** o usuário edita um parceiro pessoa jurídica
- **THEN** pode escolher entre contribuinte, isento e não contribuinte, com descrição de cada opção

### Requirement: Série e numeração de NF-e na configuração fiscal
A tela de configuração fiscal SHALL exibir série e próxima numeração de NF-e ao
lado das de NFC-e, deixando explícito que são sequências independentes.

#### Scenario: Configurar numeração
- **WHEN** o usuário abre a configuração fiscal de um estabelecimento
- **THEN** vê e edita as duas numerações separadamente, com indicação de que uma não afeta a outra

### Requirement: Modelos distinguidos na lista e no detalhe
A lista de documentos fiscais SHALL identificar o modelo de cada documento e
permitir filtrar por ele; o detalhe SHALL exibir os grupos próprios do modelo 55
quando presentes.

#### Scenario: Filtrar por modelo
- **WHEN** o usuário filtra a lista por NF-e
- **THEN** apenas documentos do modelo 55 são exibidos

#### Scenario: Detalhe de NF-e
- **WHEN** o usuário abre uma NF-e
- **THEN** vê destinatário, natureza da operação, finalidade e, quando houver, transporte, volumes e cobrança

#### Scenario: Detalhe de NFC-e inalterado
- **WHEN** o usuário abre uma NFC-e
- **THEN** a tela permanece como hoje, sem campos vazios do modelo 55
