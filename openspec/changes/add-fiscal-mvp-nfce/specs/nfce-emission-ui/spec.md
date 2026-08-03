## ADDED Requirements

### Requirement: Emissão de NFC-e a partir da venda
A interface SHALL permitir emitir NFC-e de uma venda concluída (no PDV e/ou no
detalhe da venda) e SHALL acompanhar o status assíncrono até AUTORIZADO ou
REJEITADO, refletindo o status fiscal na venda.

#### Scenario: Emissão autorizada
- **WHEN** o operador emite a NFC-e de uma venda válida e a SEFAZ autoriza
- **THEN** a interface mostra a nota autorizada e a venda passa a exibir o status fiscal correspondente

#### Scenario: Configuração incompleta
- **WHEN** o operador tenta emitir com configuração fiscal ou produto incompleto
- **THEN** a interface bloqueia/avisa e aponta o que falta

### Requirement: Lista e detalhe de documentos fiscais
A interface SHALL listar os documentos fiscais com filtros (status, período,
estabelecimento, modelo) e SHALL exibir o detalhe com chave, protocolo, datas,
valores e o snapshot, além de permitir ver/baixar DANFE, baixar XML, exibir o QR
Code e reimprimir.

#### Scenario: Baixar DANFE e XML
- **WHEN** o usuário abre uma NFC-e autorizada
- **THEN** consegue visualizar/baixar o DANFE, baixar o XML autorizado e ver o QR Code

### Requirement: Cancelamento e central de rejeições
A interface SHALL permitir cancelar uma nota autorizada com justificativa de no
mínimo 15 caracteres, e SHALL apresentar uma central de rejeições com código,
mensagem amigável e ação de reprocessar.

#### Scenario: Cancelamento com justificativa curta
- **WHEN** o usuário digita uma justificativa com menos de 15 caracteres
- **THEN** o botão de cancelar permanece bloqueado e a interface explica o mínimo exigido

#### Scenario: Reprocessar nota rejeitada
- **WHEN** uma nota está rejeitada e o cadastro foi corrigido
- **THEN** o usuário aciona o retry pela central de rejeições e acompanha a nova tentativa
