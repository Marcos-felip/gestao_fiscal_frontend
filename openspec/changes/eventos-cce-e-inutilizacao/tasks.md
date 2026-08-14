> **Reveja esta proposta antes de começar** — escrita antes da etapa 3.

> **Contrato fechado do lado do backend em 14/08/2026.** As cinco rotas estão em
> `gestao_fiscal_backend/API.md` → *Carta de correção e inutilização*. O que muda
> o desenho desta tela e não estava previsto aqui:
>
> - **A sequência da CC-e não é enviada** — o servidor a atribui. Não exista campo
>   para ela; o contador de restantes vem de `GET /fiscal/documents/:id/cartas-correcao`.
> - **A `condicaoDeUso` volta na resposta** (e também no `400` de recusa) e é
>   gravada com a carta. É esse texto que a tela deve exibir, não uma constante
>   copiada — o texto legal muda com o tempo.
> - **Existe `GET /fiscal/inutilizacoes/pendentes/:establishmentId`**, que devolve
>   as faixas de numeração perdida já calculadas. Sugerir a faixa é melhor do que
>   deixar digitar: errar a faixa aqui é irreversível.
> - **O conflito de faixa nomeia o número e a chave** na mensagem do `400` — dá
>   para exibi-la direto, sem interpretação.
> - **O download do XML da CC-e ganhou rota própria**
>   (`GET …/cartas-correcao/:sequencia/xml`), criada em 14/08/2026 ao implementar
>   esta change: `xml/:tipo` identifica o arquivo pelo documento, e aqui existem
>   até 20 na mesma nota.

## 1. Pré-requisitos

- [x] 1.1 Change irmã do backend aplicada, com as permissões `fiscal.cce` e `fiscal.inutilizar` semeadas
- [x] 1.2 Espelhar rotas e regras em `gestao_fiscal_frontend/API.md`
- [x] 1.3 Revisar esta proposta contra o que a etapa 3 produziu

## 2. Carta de correção

- [x] 2.1 DTO, repository e caso de uso — em `fiscal-events-repository`, próprio dos eventos
- [x] 2.2 Schema de apresentação: texto entre 15 e 1000 caracteres, em PT-BR
- [x] 2.3 Modal com a orientação legal **antes** do campo de texto
- [x] 2.4 Contador de correções restantes até o limite de 20
- [x] 2.5 Ação indisponível quando o limite for atingido, com explicação
- [x] 2.6 Gating por `fiscal.cce`, e ação oferecida só para documento autorizado

## 3. Histórico no documento

- [x] 3.1 Seção listando as correções, com sequência, texto, data e download do XML
- [x] 3.2 Seção omitida quando não houver correções
- [x] 3.3 Download do XML pelo mesmo caminho de `Blob` já usado, nomeado pela chave

## 4. Inutilização

- [x] 4.1 DTO, repository e caso de uso
- [x] 4.2 Tela na configuração fiscal, na seção *Ambiente e numeração* — mesmo assunto, fora do formulário
- [x] 4.3 Confirmação em duas etapas, repetindo os números por extenso
- [x] 4.3b **Faixas sugeridas** vindas do servidor, em vez de digitar o intervalo
- [x] 4.4 Conflito exibido junto do formulário, nomeando o número ocupado
- [x] 4.5 Gating por `fiscal.inutilizar`

## 5. Lista de documentos

- [x] 5.1 Status `INUTILIZADO` com tom próprio — já existia no enum, com tom `muted`
- [x] 5.2 Os 10 valores do enum de status continuam cobertos em labels, tones e options

## 6. Testes

- [x] 6.1 Schema da correção: limites de tamanho (e da inutilização: faixa invertida, número zero)
- [x] 6.2 Diálogo testado: orientação legal visível, campo bloqueado no limite, texto curto recusado.
  O gating da **ação** (`fiscal.cce` + status `AUTORIZADO`) é um computed de uma linha na página,
  sem teste próprio — montar a página inteira custaria mais do que a regra vale
- [x] 6.3 Contador de restantes correto; limite atingido reconhecido
- [x] 6.4 Erros da API resolvidos por `isUserFacing`, nunca por texto
- [x] 6.5 Documento sem correções não exibe a seção (teste de componente)
- [x] 6.6 `npm run verify` verde

## 7. Contexto

- [x] 7.1 Atualizar `AGENTS.md` com os dois eventos

## 8. Fora do escopo desta change

- [ ] 8.1 Validação ponta a ponta em homologação: uma CC-e numa nota real e uma
  inutilização de faixa — depende do motor no ar e do certificado A1
