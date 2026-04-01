

## Mover foto do Pedro Diniz para logo abaixo do banner headline no mobile

O bloco da foto circular do Pedro Diniz com nome e "+ de 50 milhões captados" (linhas 234-241) será movido para aparecer logo após o banner "Como captar $ com Programas de Incentivo Federais" (após linha 145), dentro da mesma div mobile do headline.

### Alteração em `src/pages/Index.tsx`

1. **Remover** o bloco "Mobile: Pedro Diniz photo + credibility" da posição atual (linhas 234-241)
2. **Inserir** esse mesmo bloco logo após a tag `</p>` de "Programas de Incentivo Federais" (linha 144), ainda dentro da div `lg:hidden` do headline banner

Isso fará a ordem no mobile ser: badge Workshop → headline → foto Pedro → h1 → bullets → CTA.

