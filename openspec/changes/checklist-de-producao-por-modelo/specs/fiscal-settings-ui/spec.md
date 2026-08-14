## ADDED Requirements

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
