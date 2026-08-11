## ADDED Requirements

### Requirement: Devolver a partir do documento
A interface SHALL oferecer a devolução no detalhe de documento autorizado, gated
por `fiscal.devolucao`, permitindo escolher itens e quantidades.

#### Scenario: Devolução parcial
- **WHEN** o usuário seleciona dois dos cinco itens e informa quantidades
- **THEN** a devolução é enviada apenas com o que foi selecionado

#### Scenario: Atalho de devolução total
- **WHEN** o usuário aciona a devolução total
- **THEN** todos os itens são marcados com a quantidade integral, ainda editáveis antes de confirmar

#### Scenario: Sem permissão
- **WHEN** o usuário não tem `fiscal.devolucao`
- **THEN** a ação não é exibida

### Requirement: Saldo devolvível visível e respeitado
A interface SHALL exibir o saldo devolvível de cada item e SHALL impedir a
digitação de quantidade acima dele.

#### Scenario: Saldo exibido
- **WHEN** o usuário abre a devolução de uma nota que já teve devolução parcial
- **THEN** cada item mostra a quantidade original, a já devolvida e o saldo

#### Scenario: Quantidade acima do saldo
- **WHEN** o usuário tenta informar quantidade maior que o saldo
- **THEN** o campo acusa erro e a confirmação fica bloqueada

#### Scenario: Item sem saldo
- **WHEN** um item já foi integralmente devolvido
- **THEN** ele aparece marcado como sem saldo e não pode ser selecionado

### Requirement: Nota sem dados fiscais suficientes explicada
Quando a nota original não tiver o quadro tributário necessário, a interface
SHALL explicar por que a devolução não é possível, em vez de exibir erro genérico.

#### Scenario: Nota anterior ao quadro tributário
- **WHEN** o usuário tenta devolver uma nota emitida antes de o quadro tributário existir
- **THEN** a interface informa que a nota não tem os dados fiscais para gerar devolução, e orienta o caminho alternativo

### Requirement: Consequências comunicadas antes da confirmação
A interface SHALL informar, antes de confirmar, que a devolução devolve
mercadoria ao estoque e ajusta o título a receber correspondente.

#### Scenario: Resumo antes de confirmar
- **WHEN** o usuário revisa a devolução antes de enviar
- **THEN** vê o efeito sobre estoque e financeiro, além dos itens e quantidades

### Requirement: Rastreabilidade nos dois sentidos
O detalhe do documento SHALL listar as devoluções feitas sobre ele, e o documento
de devolução SHALL identificar a nota original, com navegação entre os dois.

#### Scenario: A partir da original
- **WHEN** o usuário abre uma nota que teve devoluções
- **THEN** vê a lista com link para cada documento de devolução

#### Scenario: A partir da devolução
- **WHEN** o usuário abre um documento de devolução
- **THEN** vê e pode abrir a nota original que ele referencia

#### Scenario: Documento sem devoluções
- **WHEN** a nota não teve devolução
- **THEN** a seção não é exibida
