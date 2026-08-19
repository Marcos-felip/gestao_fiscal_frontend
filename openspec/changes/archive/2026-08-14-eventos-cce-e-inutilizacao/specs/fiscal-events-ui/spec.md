## ADDED Requirements

### Requirement: Emitir carta de correção pelo detalhe do documento
A interface SHALL oferecer a emissão de carta de correção para documento
autorizado, gated por `fiscal.cce`, com campo de texto validado entre 15 e 1000
caracteres.

#### Scenario: Correção emitida
- **WHEN** o usuário escreve uma correção válida e confirma
- **THEN** a correção é enviada e passa a aparecer no histórico do documento

#### Scenario: Documento não autorizado
- **WHEN** o documento está rejeitado, em erro ou cancelado
- **THEN** a ação de correção não é oferecida

#### Scenario: Texto curto demais
- **WHEN** o usuário escreve menos de 15 caracteres
- **THEN** o campo acusa erro e a requisição não é enviada

### Requirement: A interface ensina o que a CC-e não corrige
Antes do campo de texto, a interface SHALL informar que a carta de correção não
altera valores, datas, emitente nem destinatário, e que esses casos exigem
cancelamento e nova emissão.

#### Scenario: Orientação visível
- **WHEN** o usuário abre a carta de correção
- **THEN** vê, antes de escrever, a lista do que não pode ser corrigido por esse instrumento

#### Scenario: Recusa do backend explicada
- **WHEN** a API recusa a correção por tentar alterar campo proibido
- **THEN** a interface exibe a orientação de cancelar e reemitir, resolvida por `instanceof` de `DomainError`

### Requirement: Correções restantes visíveis
A interface SHALL exibir quantas cartas de correção a nota já tem e quantas
restam até o limite legal de 20.

#### Scenario: Contador exibido
- **WHEN** o usuário abre a carta de correção de uma nota com três correções
- **THEN** a interface informa que restam 17

#### Scenario: Limite atingido
- **WHEN** a nota já tem 20 correções
- **THEN** a ação fica indisponível, com explicação do limite

### Requirement: Histórico de correções no documento
O detalhe do documento SHALL listar as cartas de correção emitidas, com
sequência, texto, data e download do XML.

#### Scenario: Documento com correções
- **WHEN** o usuário abre um documento que tem cartas de correção
- **THEN** vê a lista completa, em ordem de sequência, com o XML de cada uma

#### Scenario: Documento sem correções
- **WHEN** o documento não tem correções
- **THEN** a seção não é exibida, sem espaço vazio na tela

### Requirement: Inutilização de numeração com confirmação reforçada
A interface SHALL permitir inutilizar faixa de numeração, gated por
`fiscal.inutilizar`, exigindo confirmação explícita por ser ato irreversível.

#### Scenario: Inutilizar faixa
- **WHEN** o usuário informa série, faixa e justificativa e confirma duas vezes
- **THEN** a inutilização é enviada

#### Scenario: Conflito com documento existente
- **WHEN** a API recusa por a faixa conter documento autorizado
- **THEN** a interface nomeia o documento em conflito

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.inutilizar`
- **THEN** a ação não é exibida
