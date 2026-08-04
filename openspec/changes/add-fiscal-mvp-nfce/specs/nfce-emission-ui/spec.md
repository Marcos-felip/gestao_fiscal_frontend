## ADDED Requirements

### Requirement: Emissão de NFC-e a partir da venda
A interface SHALL permitir emitir NFC-e de uma venda concluída (no PDV e/ou no
detalhe da venda) via `POST /fiscal/documents/nfce`, SHALL acompanhar o status
assíncrono por polling até AUTORIZADO/REJEITADO/ERRO e SHALL refletir o status
fiscal na venda.

#### Scenario: Emissão e acompanhamento assíncrono
- **WHEN** o operador emite a NFC-e de uma venda válida
- **THEN** a interface registra a emissão como PENDENTE e vai atualizando o status por polling (PROCESSANDO → AUTORIZADO/REJEITADO/ERRO), sem travar a tela

#### Scenario: Configuração ou produto incompleto
- **WHEN** o operador tenta emitir com configuração fiscal ou produto incompleto
- **THEN** a interface avisa (pré-checagem client-side e/ou erro 400 do backend) e aponta o que falta, sem criar documento

#### Scenario: Rejeição exibida
- **WHEN** a emissão termina como REJEITADO ou ERRO
- **THEN** a interface mostra o código e a mensagem de rejeição na venda e no documento

### Requirement: Lista e detalhe de documentos fiscais
A interface SHALL listar os documentos fiscais (`GET /fiscal/documents`) com filtros
(status, período, estabelecimento, modelo) e paginação sobre o envelope
`{ data, total, page, limit }`, e SHALL exibir o detalhe (`GET /fiscal/documents/:id`)
com chave, protocolo, datas, valores, snapshot dos itens/pagamentos, histórico de
status e eventos, além de permitir baixar o XML disponível.

#### Scenario: Filtrar e paginar
- **WHEN** o usuário filtra por status e período
- **THEN** a lista aplica os filtros e navega pelas páginas usando `total`/`page`/`limit`

#### Scenario: Baixar XML
- **WHEN** o usuário abre um documento que tem XML enviado/autorizado/cancelamento
- **THEN** consegue baixar o XML correspondente (`/xml/:tipo`), tratado como texto e salvo como arquivo `.xml`

#### Scenario: Ações indisponíveis na Fase A
- **WHEN** o usuário abre um documento autorizado
- **THEN** as ações de cancelar, reprocessar, consultar SEFAZ e baixar DANFE/QR ficam ocultas ou desabilitadas (sem endpoint nesta fase)
