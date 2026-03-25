

# Aumentar tamanho do canvas mobile no Heatmap

## Problema
O canvas mobile está com `280px` de largura, ficando minúsculo e difícil de visualizar, especialmente no próprio mobile.

## Solução
Em `src/components/dashboard/HeatmapTab.tsx`, linha 21:

- Aumentar o `canvasWidth` mobile de `280` para `390` (tamanho real de um celular)
- Manter desktop em `400` (ou subir para `500` para melhor visualização também)

Isso fará o canvas preencher melhor a tela e os pontos de calor ficarem mais visíveis.

