# fiscal-file-export-ui Specification

## Purpose
Exportação em lote dos XMLs de um período pela interface, para entrega ao
contador no fechamento mensal. Consome `GET /fiscal/documents/xml/export`.

## Requirements
### Requirement: Exportar os XMLs de um período
A lista de documentos fiscais SHALL oferecer uma ação de exportação que permita
escolher período, estabelecimento, modelo e ambiente, e baixar um ZIP com os XMLs
correspondentes.

A ação SHALL ser gated por `fiscal.read`.

#### Scenario: Exportar o mês passado
- **WHEN** o usuário escolhe o atalho "mês passado" e confirma
- **THEN** o navegador baixa um ZIP com os XMLs do período

#### Scenario: Usuário sem permissão
- **WHEN** o usuário não tem `fiscal.read`
- **THEN** a ação de exportação não é exibida

#### Scenario: Período sem documentos
- **WHEN** o período escolhido não tem documentos autorizados nem cancelados
- **THEN** o download acontece normalmente e a interface informa que o período não teve movimento

> ⚠️ **Parcialmente implementado (12/08/2026).** O download acontece; o aviso de
> "período sem movimento" **não existe**. O cliente recebe um `Blob` e não tem
> como contar os documentos sem descompactar o ZIP. Para fechar: o backend
> precisa devolver o total num header exposto no CORS **e** o `httpClient`
> precisa passar a expor os headers da resposta — hoje devolve só `data`.
> Enquanto isso, o total fica no `_relacao.csv` dentro do ZIP.

### Requirement: Período com atalhos de fechamento
A interface SHALL oferecer atalhos de mês fechado além da escolha manual de
datas, porque a exportação é usada no fechamento mensal.

#### Scenario: Atalho preenche as datas
- **WHEN** o usuário escolhe "mês passado"
- **THEN** as datas de início e fim são preenchidas com o primeiro e o último dia daquele mês, e continuam editáveis

### Requirement: Ambiente explícito na exportação
A interface SHALL usar produção como padrão e SHALL avisar, de forma visível,
quando o usuário escolher homologação.

#### Scenario: Aviso de homologação
- **WHEN** o usuário seleciona o ambiente de homologação
- **THEN** a interface exibe aviso de que os arquivos são de teste e não servem para escrituração

### Requirement: Feedback durante a exportação
A interface SHALL indicar que a exportação está em andamento e SHALL impedir
disparos repetidos enquanto o arquivo é preparado.

#### Scenario: Exportação em andamento
- **WHEN** o usuário confirma a exportação
- **THEN** o botão entra em estado de carregamento, novos cliques são ignorados, e a interface informa que o arquivo está sendo preparado

#### Scenario: Falha na exportação
- **WHEN** a requisição falha
- **THEN** o botão volta ao estado normal e o erro é exibido, permitindo nova tentativa

### Requirement: Limites do backend traduzidos para o usuário
Os erros de período e de volume devolvidos pela API SHALL ser exibidos como
orientação de como dividir a exportação, resolvidos pela subclasse de
`DomainError` correspondente e nunca por comparação de texto.

#### Scenario: Período longo demais
- **WHEN** o usuário escolhe um intervalo maior que o limite e a API responde `400`
- **THEN** o modal exibe a orientação de reduzir o período, sem fechar e sem perder o que foi preenchido

#### Scenario: Volume acima do teto
- **WHEN** a API recusa por quantidade de documentos
- **THEN** o modal orienta a fatiar por estabelecimento ou por intervalo menor

