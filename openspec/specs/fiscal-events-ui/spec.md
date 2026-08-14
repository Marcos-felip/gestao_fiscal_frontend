# fiscal-events-ui Specification

## Purpose
As telas dos dois eventos que a nota aceita depois de emitida: a carta de
correção, no detalhe do documento, e a inutilização de numeração, na configuração
fiscal. As duas têm regra legal que a interface precisa comunicar **antes** do
erro — não depois.

## Requirements
### Requirement: Emitir carta de correção pelo detalhe do documento
A interface SHALL oferecer a emissão de carta de correção para documento
autorizado, gated por `fiscal.cce`, com campo de texto validado entre 15 e 1000
caracteres.

Não existe campo de sequência: quem a atribui é o servidor.

#### Scenario: Correção emitida
- **WHEN** o usuário escreve uma correção válida e confirma
- **THEN** a correção é enviada e passa a aparecer no histórico do documento, sem recarregar a lista

#### Scenario: Documento não autorizado
- **WHEN** o documento está rejeitado, em erro ou cancelado
- **THEN** a ação de correção não é oferecida

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.cce`
- **THEN** a ação não é exibida

#### Scenario: Texto curto demais
- **WHEN** o usuário escreve menos de 15 caracteres
- **THEN** o campo acusa erro e a requisição não é enviada

### Requirement: A interface ensina o que a CC-e não corrige
Antes do campo de texto, a interface SHALL informar que a carta de correção não
altera valores, datas, emitente nem destinatário, e que esses casos exigem
cancelamento e nova emissão.

Quem chega nesta tela quase sempre quer corrigir justamente o que a CC-e não
corrige. Uma tela que só oferece um campo e recusa depois ensina errado.

#### Scenario: Orientação visível
- **WHEN** o usuário abre a carta de correção
- **THEN** vê, antes de escrever, a lista do que não pode ser corrigido e o caminho alternativo

#### Scenario: Recusa da SEFAZ
- **WHEN** a API recusa a correção
- **THEN** a interface exibe a mensagem como veio, decidindo por `instanceof` de `DomainError` e nunca pelo texto

### Requirement: A condição de uso exibida é a que o servidor devolveu
A interface SHALL exibir o texto legal de condição de uso vindo da resposta da
API, e SHALL NOT usar uma cópia local desse texto.

A redação muda com o tempo, e o que vale é a que estava vigente quando a correção
foi feita.

#### Scenario: Nota com correção anterior
- **WHEN** o documento já tem uma carta de correção
- **THEN** o diálogo exibe a condição de uso gravada com ela

### Requirement: Correções restantes visíveis
A interface SHALL exibir quantas cartas de correção restam até o limite legal de
20, calculadas a partir do histórico.

#### Scenario: Contador exibido
- **WHEN** o usuário abre a carta de correção de uma nota com três correções
- **THEN** a interface informa que restam 17

#### Scenario: Limite atingido
- **WHEN** a nota já tem 20 correções
- **THEN** o campo fica bloqueado e a interface explica o limite legal

### Requirement: Histórico de correções no documento
O detalhe do documento SHALL listar as cartas de correção emitidas, com
sequência, texto, data e download do XML.

#### Scenario: Documento com correções
- **WHEN** o usuário abre um documento que tem cartas de correção
- **THEN** vê a lista em ordem de sequência, com o XML de cada uma nomeado pela chave de acesso

#### Scenario: Documento sem correções
- **WHEN** o documento não tem correções
- **THEN** a seção não é exibida, sem espaço vazio na tela

#### Scenario: Correção sem XML guardado
- **WHEN** uma correção não tem XML disponível
- **THEN** a linha aparece sem a ação de download, em vez de oferecer um download que falha

#### Scenario: Histórico indisponível
- **WHEN** a listagem de correções falha
- **THEN** a seção some e o restante do detalhe continua utilizável

### Requirement: Inutilização na configuração fiscal
A interface SHALL oferecer a inutilização de faixa de numeração na seção de
numeração da configuração fiscal, gated por `fiscal.inutilizar`.

O lugar é esse porque a inutilização age sobre a **numeração do estabelecimento**,
não sobre um documento — os números em questão nunca viraram nota. Fica fora do
formulário: não é configuração que se salva, é ato enviado à SEFAZ, com permissão
própria.

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.inutilizar`
- **THEN** a seção não é exibida

#### Scenario: Numeração perdida existente
- **WHEN** o estabelecimento tem números reservados que nunca viraram documento
- **THEN** a seção avisa que há numeração perdida

### Requirement: Confirmação reforçada e faixas sugeridas
A interface SHALL confirmar a inutilização em duas etapas, repetindo na segunda
os números por extenso, e SHALL oferecer as faixas pendentes calculadas pelo
servidor em vez de exigir que o usuário digite o intervalo.

Inutilizar não se desfaz, e a faixa errada queima numeração válida.

#### Scenario: Inutilizar faixa sugerida
- **WHEN** o usuário escolhe uma faixa sugerida, informa a justificativa e confirma as duas etapas
- **THEN** a inutilização é enviada e as faixas pendentes são recarregadas

#### Scenario: Revisão antes do envio
- **WHEN** o usuário chega à segunda etapa
- **THEN** vê modelo, série e os números que serão inutilizados, e pode voltar

#### Scenario: Conflito com documento existente
- **WHEN** a API recusa por a faixa conter documento emitido
- **THEN** a mensagem que nomeia o número e a chave fica exibida junto do formulário preenchido, não em um aviso que some
