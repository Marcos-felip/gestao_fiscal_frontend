> Delta sobre a capacidade criada por `importar-nota-de-entrada-por-xml` neste
> repositório. Requisitos **acrescentados**: a conferência não muda.

## ADDED Requirements

### Requirement: Conferência alcançável a partir de uma nota da SEFAZ
A tela de conferência SHALL ser alcançável a partir de uma nota da caixa de
entrada, com o mesmo comportamento do XML enviado por upload.

Dois caminhos de conferência divergiriam, e um dos dois envelheceria.

#### Scenario: Importar da caixa de entrada
- **WHEN** o usuário importa uma nota cujo XML completo já foi obtido
- **THEN** cai na mesma tela de conferência, com o casamento dos itens já tentado

### Requirement: A origem do XML é exibida
A tela de importação SHALL informar se o XML veio de upload ou da SEFAZ.

#### Scenario: Importação vinda da SEFAZ
- **WHEN** o usuário abre uma importação originada na distribuição
- **THEN** a tela informa a origem, com a chave de acesso da nota
