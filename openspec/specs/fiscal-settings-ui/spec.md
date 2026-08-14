# fiscal-settings-ui Specification

## Purpose
TBD - created by archiving change validar-formato-csc. Update Purpose after archive.
## Requirements
### Requirement: Validação do CSC e do idCSC no formulário fiscal
O formulário de configuração fiscal SHALL validar o CSC e o idCSC antes de enviar
a requisição. O `codigoCsc` SHALL ter de 16 a 64 caracteres alfanuméricos e o
`idCsc` SHALL ter de 1 a 6 dígitos. As mensagens SHALL estar em português e SHALL
indicar que os valores são obtidos no portal da SEFAZ da UF, na área de
credenciamento de NFC-e.

O CSC SHALL nunca aparecer em log de console, toast, mensagem de erro ou
telemetria.

#### Scenario: CSC curto demais
- **WHEN** o usuário informa um CSC com menos de 16 caracteres e tenta salvar
- **THEN** o campo acusa erro em português com o formato esperado, e nenhuma requisição é enviada à API

#### Scenario: idCSC não numérico
- **WHEN** o usuário informa um idCSC com letras ou com mais de 6 dígitos
- **THEN** o campo acusa erro em português explicando que o idCSC é o token numérico de até 6 posições, e nenhuma requisição é enviada

#### Scenario: Campos válidos
- **WHEN** o usuário informa um CSC de 32 caracteres e um idCSC de 6 dígitos
- **THEN** a validação passa e a configuração é enviada à API

#### Scenario: Configuração antiga inválida aberta para edição
- **WHEN** o usuário abre uma configuração fiscal cujo CSC foi salvo antes desta validação e está fora do formato
- **THEN** o campo acusa o erro ao ser tocado, e o formulário só permite salvar após a correção

#### Scenario: Erro de formato devolvido pela API
- **WHEN** a API recusa o CSC com 400 por formato inválido
- **THEN** a mensagem é resolvida pela subclasse de `DomainError` correspondente, nunca por comparação de texto, e é exibida no campo

### Requirement: Orientação sobre a origem do CSC e do idCSC
A interface SHALL exibir, junto aos campos, um texto curto explicando que "ID do
CSC" e "Código CSC" são valores distintos emitidos em par pela SEFAZ da UF, e que
o par é específico do ambiente (homologação ou produção).

#### Scenario: Texto de apoio visível
- **WHEN** o usuário abre o formulário de configuração fiscal
- **THEN** os dois campos exibem a orientação sobre origem e sobre o par ser por ambiente

#### Scenario: Troca de ambiente
- **WHEN** o usuário alterna entre homologação e produção
- **THEN** a interface deixa explícito que o par CSC/idCSC não é compartilhado entre os ambientes

### Requirement: Round-trip da Inscrição Estadual do emitente
A página de Empresa SHALL exibir, na seção "Sede", a Inscrição Estadual gravada no
estabelecimento matriz. O valor SHALL sobreviver ao ciclo salvar → recarregar sem
que o usuário precise redigitá-lo.

A interface SHALL deixar claro que essa IE é a do estabelecimento emissor — a que
a NFC-e utiliza — e não um segundo cadastro independente.

#### Scenario: IE persiste após recarregar
- **WHEN** o usuário grava a Inscrição Estadual na seção "Sede" e recarrega a página de Empresa
- **THEN** o campo é exibido preenchido com o valor gravado

#### Scenario: Matriz sem IE cadastrada
- **WHEN** a empresa tem matriz sem Inscrição Estadual
- **THEN** o campo é exibido vazio e editável, sem erro

#### Scenario: Empresa sem matriz
- **WHEN** a empresa ainda não tem estabelecimento matriz
- **THEN** a seção "Sede" permanece indisponível, sem quebrar o carregamento da página

#### Scenario: Origem da IE explicitada
- **WHEN** o usuário visualiza o campo de Inscrição Estadual na seção "Sede"
- **THEN** a interface indica que é a IE do estabelecimento emissor, usada na emissão da NFC-e

### Requirement: Contrato da empresa sem mascaramento de campo ausente
O mapper de empresa SHALL NOT usar valor padrão para converter campo ausente na
resposta da API em valor válido. Campo declarado no contrato e não entregue pela
API SHALL produzir `ContractError`.

#### Scenario: Campo ausente na resposta
- **WHEN** a API devolve a empresa sem o campo `stateRegistration` previsto no contrato
- **THEN** o mapper devolve `ContractError` em vez de silenciosamente assumir nulo

#### Scenario: Campo presente e nulo
- **WHEN** a API devolve `stateRegistration` explicitamente nulo
- **THEN** o mapper aceita o valor e a entidade carrega nulo, sem erro

