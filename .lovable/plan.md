

# Adicionar barra de lote promocional abaixo do botão da Hero

## Alteração em `src/pages/Index.tsx` (após linha 259)

Adicionar o mesmo bloco de urgência/escassez que já existe na seção de oferta (`BelowFoldSections.tsx` linhas 792-809), logo após o `GoldButton` na hero. O bloco inclui:

- Linha "🔥 Ingressos vendidos à R$37" com "96%" à direita
- Barra de progresso com gradiente verde→amarelo→vermelho
- Texto "Restam poucas vagas — garanta a sua!"
- Data dinâmica da virada de lote (dia atual)

O código será uma cópia direta do bloco existente em `BelowFoldSections.tsx`, posicionado entre o `</GoldButton>` e o `</div>` que fecha a coluna de texto (linha 260), com `max-w-xs mx-auto lg:mx-0` para alinhar à esquerda no desktop.

