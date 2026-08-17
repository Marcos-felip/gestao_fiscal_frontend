## Why

A seção "Produção" da configuração fiscal mostra o checklist como uma lista
única, porque hoje ele é uma lista única — e toda de NFC-e. Quando o backend
passar a apurá-lo por modelo, uma lista plana vira uma tela que não responde a
pergunta que importa: **falta o quê, para qual nota?**

Há também um dado que ninguém pergunta hoje e que passa a ser necessário: **quais
modelos este estabelecimento emite.** Sem ele o sistema não distingue "não
configurou CSC" de "não emite NFC-e", e continua cobrando de quem não deve.

## What Changes

- **A configuração pergunta quais modelos o estabelecimento emite**, na seção de
  numeração — onde já vivem as séries de cada modelo.
- **O checklist é exibido agrupado por modelo**, com os itens comuns (certificado)
  separados dos que pertencem a um modelo só.
- **A contagem de produtos com pendência fiscal** aparece como aviso, com caminho
  para a lista de produtos pendentes que já existe.
- **A coluna de seções reflete o que falta** — a marca de pendência da seção
  "Produção" passa a considerar só os itens que se aplicam.

## Capabilities

### Modified Capabilities
- `fiscal-settings-ui`: a seção de produção passa a exibir o checklist por
  modelo, e a de numeração a coletar os modelos emitidos.

## Impact

- `src/modules/fiscal/` — mapper do checklist, seção de produção e formulário de
  numeração.
- **Depende da change irmã do backend** para o campo e o formato novos.
- **Não** libera produção nem emite nada: a tela mostra o portão, quem atravessa
  é o lojista.
