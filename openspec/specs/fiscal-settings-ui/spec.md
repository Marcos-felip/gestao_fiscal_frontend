# fiscal-settings-ui Specification

## Purpose
A tela de configuração fiscal do estabelecimento: CSC e idCSC, Inscrição
Estadual do emitente, modelos emitidos, numeração por modelo, e o checklist que
libera a emissão em produção — incluindo o caminho até os produtos que ainda não
podem sair numa nota.
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


### Requirement: Modelos emitidos escolhidos na configuração
A seção de numeração SHALL permitir escolher quais modelos o estabelecimento
emite, junto das séries de cada um, e SHALL exigir ao menos um.

#### Scenario: Escolher os modelos
- **WHEN** o usuário abre a seção de numeração
- **THEN** vê quais modelos estão marcados e pode alterá-los

#### Scenario: Nenhum modelo
- **WHEN** o usuário desmarca todos
- **THEN** o formulário acusa o erro antes de enviar

### Requirement: Checklist de produção agrupado por modelo
A seção de produção SHALL exibir o checklist agrupado, separando os itens comuns
dos que pertencem a um modelo específico, e SHALL identificar a qual modelo cada
grupo se refere.

Uma lista plana não responde "falta o quê, para qual nota?" — que é a pergunta de
quem está prestes a liberar.

#### Scenario: Estabelecimento com os dois modelos
- **WHEN** o estabelecimento emite NFC-e e NF-e
- **THEN** a tela mostra os itens comuns e um grupo por modelo

#### Scenario: Estabelecimento com um modelo
- **WHEN** o estabelecimento emite apenas um modelo
- **THEN** só o grupo daquele modelo é exibido, sem espaço vazio do outro

### Requirement: Pendência de cadastro visível antes da liberação
A tela SHALL exibir a quantidade de produtos com pendência fiscal como aviso,
com caminho para a lista de produtos pendentes.

#### Scenario: Produtos incompletos
- **WHEN** existem produtos sem o quadro tributário completo
- **THEN** a tela informa quantos são e leva à lista, sem impedir a liberação

### Requirement: Lista de produtos com pendência fiscal
A interface SHALL oferecer uma tela com os produtos que bloqueariam a emissão,
trazendo o motivo de cada pendência como o backend o escreveu.

A filtragem é do **servidor**: peneirar no cliente só enxergaria a página
carregada e diria "nenhuma pendência" quando elas estivessem na página seguinte.

#### Scenario: Chegando pelo checklist
- **WHEN** o item de produtos pendentes está pendente
- **THEN** ele oferece o caminho para a lista, reconhecido pelo código do item e não pelo texto

#### Scenario: Motivos de cada produto
- **WHEN** o usuário abre a lista
- **THEN** vê cada produto com o que falta nele, e um caminho para completar o cadastro

#### Scenario: Nenhuma pendência
- **WHEN** todos os produtos ativos estão completos
- **THEN** a tela diz que não há pendências, em vez de parecer uma busca sem resultado
