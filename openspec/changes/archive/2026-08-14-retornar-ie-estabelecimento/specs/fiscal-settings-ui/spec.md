## ADDED Requirements

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
