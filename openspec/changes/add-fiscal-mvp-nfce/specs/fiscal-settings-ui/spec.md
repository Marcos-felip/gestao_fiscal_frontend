## ADDED Requirements

### Requirement: Tela de configuração fiscal do estabelecimento
A interface SHALL permitir visualizar e editar as configurações fiscais do
estabelecimento (ambiente, série/numeração da NFC-e, CSC/idCSC) e SHALL respeitar
o gating: sem `fiscal.settings.edit`, a tela abre em somente leitura.

#### Scenario: Usuário sem permissão de edição
- **WHEN** um usuário sem `fiscal.settings.edit` abre a configuração fiscal
- **THEN** os campos ficam desabilitados e a barra de ações de salvar não aparece

### Requirement: Gestão do certificado A1
A interface SHALL permitir enviar o certificado A1 com a senha, exibir validade e
titular, alertar quando estiver perto do vencimento ou vencido, e permitir
substituí-lo. A senha SHALL NOT ser exibida após o envio.

#### Scenario: Certificado próximo do vencimento
- **WHEN** o certificado do estabelecimento vence em 30 dias ou menos
- **THEN** a interface exibe um alerta destacado na configuração fiscal

### Requirement: Teste de comunicação com a SEFAZ
A interface SHALL oferecer uma ação de testar a comunicação com a SEFAZ e exibir o
resultado (disponível/indisponível) sem sair da tela.

#### Scenario: Teste bem-sucedido
- **WHEN** o usuário aciona o teste e a SEFAZ responde disponível
- **THEN** um feedback de sucesso é exibido

### Requirement: Pendências fiscais dos produtos
A interface SHALL listar os produtos com dados fiscais incompletos e SHALL oferecer
uma seção fiscal no formulário de produto para preenchê-los.

#### Scenario: Produto com pendência
- **WHEN** um produto está sem NCM ou CFOP
- **THEN** ele aparece na lista de pendências e seu formulário destaca os campos fiscais faltantes
