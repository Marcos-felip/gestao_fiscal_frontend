> **Reveja esta proposta antes de começar** — escrita antes da etapa 3.

> **Contrato fechado do lado do backend em 14/08/2026.** As quatro rotas estão em
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

## 1. Pré-requisitos

- [ ] 1.1 Change irmã do backend aplicada, com as permissões `fiscal.cce` e `fiscal.inutilizar` semeadas
- [ ] 1.2 Espelhar rotas e regras em `gestao_fiscal_frontend/API.md`
- [ ] 1.3 Revisar esta proposta contra o que a etapa 3 produziu

## 2. Carta de correção

- [ ] 2.1 DTO, repository e caso de uso
- [ ] 2.2 Schema de apresentação: texto entre 15 e 1000 caracteres, em PT-BR
- [ ] 2.3 Modal com a orientação legal **antes** do campo de texto
- [ ] 2.4 Contador de correções restantes até o limite de 20
- [ ] 2.5 Ação indisponível quando o limite for atingido, com explicação
- [ ] 2.6 Gating por `fiscal.cce`, e ação oferecida só para documento autorizado

## 3. Histórico no documento

- [ ] 3.1 Seção listando as correções, com sequência, texto, data e download do XML
- [ ] 3.2 Seção omitida quando não houver correções
- [ ] 3.3 Download do XML pelo mesmo caminho de `Blob` já usado

## 4. Inutilização

- [ ] 4.1 DTO, repository e caso de uso
- [ ] 4.2 Tela na configuração fiscal com série, faixa e justificativa
- [ ] 4.3 Confirmação reforçada, por ser irreversível
- [ ] 4.4 Conflito com documento existente exibido nomeando o documento
- [ ] 4.5 Gating por `fiscal.inutilizar`

## 5. Lista de documentos

- [ ] 5.1 Status `INUTILIZADO` com tom próprio no badge
- [ ] 5.2 Conferir que os 10 valores do enum de status continuam cobertos

## 6. Testes

- [ ] 6.1 Schema da correção: limites de tamanho
- [ ] 6.2 Ação oculta para documento não autorizado e para usuário sem permissão
- [ ] 6.3 Contador de restantes correto; ação bloqueada no limite
- [ ] 6.4 Erros da API resolvidos por `instanceof`, nunca por texto
- [ ] 6.5 Documento sem correções não exibe a seção
- [ ] 6.6 `npm run verify` verde

## 7. Contexto

- [ ] 7.1 Atualizar `AGENTS.md` com os dois eventos
