## ADDED Requirements

### Requirement: Tela de configuração fiscal do estabelecimento
A interface SHALL permitir visualizar e editar as configurações fiscais por
estabelecimento (ambiente, série e próxima numeração da NFC-e, CSC/idCSC),
consumindo `/fiscal/settings`, e SHALL respeitar o gating: sem
`fiscal.settings.edit`, a tela abre em somente leitura.

#### Scenario: Estabelecimento ainda sem configuração
- **WHEN** o usuário abre a configuração de um estabelecimento cujo `GET /fiscal/settings/:establishmentId` retorna vazio (`null` com 200)
- **THEN** a interface mostra um estado "sem configuração fiscal" com ação de criar, em vez de erro

#### Scenario: Usuário sem permissão de edição
- **WHEN** um usuário sem `fiscal.settings.edit` abre a configuração fiscal
- **THEN** os campos ficam desabilitados e a barra de ações de salvar não aparece

### Requirement: Exibição do certificado A1
A interface SHALL exibir os metadados do certificado do estabelecimento (validade e
titular) quando presentes e SHALL alertar quando estiver perto do vencimento ou
vencido. O upload/substituição do certificado fica fora desta fase (sem endpoint).

#### Scenario: Certificado próximo do vencimento
- **WHEN** o certificado do estabelecimento vence em 30 dias ou menos
- **THEN** a interface exibe um alerta destacado na configuração fiscal

#### Scenario: Certificado ausente
- **WHEN** o estabelecimento não tem metadados de certificado
- **THEN** a interface indica que o certificado ainda não está configurado, sem oferecer upload nesta fase

### Requirement: Dados fiscais da empresa
A interface SHALL permitir complementar os dados fiscais da empresa (CRT, IE/IM,
código IBGE, contribuinte de ICMS, telefone/e-mail fiscal) na página de Empresa e
SHALL exibir o indicador `fiscalConfigComplete`.

#### Scenario: Empresa fiscalmente incompleta
- **WHEN** a empresa está sem CRT ou sem código IBGE
- **THEN** a interface sinaliza a configuração fiscal como incompleta e destaca os campos faltantes

### Requirement: Dados e pendências fiscais dos produtos
A interface SHALL oferecer uma seção fiscal no formulário de produto (NCM, CEST,
origem, CFOP, CSOSN/CST, alíquotas, unidade, GTIN), SHALL exibir o indicador
`fiscalComplete` e SHALL listar os produtos fiscalmente incompletos.

#### Scenario: Produto com pendência
- **WHEN** um produto está com `fiscalComplete=false` (ex.: sem NCM ou CFOP)
- **THEN** ele aparece na lista de pendências fiscais e seu formulário destaca os campos faltantes
