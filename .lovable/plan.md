

# Simplificar datas da barra de lote: mostrar apenas data de virada

## Alteração em `src/components/BelowFoldSections.tsx` (linhas 774-804)

- Remover variáveis `d2`, `d1` e função `fmt` (linhas 776-778)
- Manter apenas `today` para formatar a data do dia atual como "DD/MM"
- Substituir as 3 datas (linhas 797-801) por uma única linha centralizada: **"Data da virada de lote: DD/MM"** em texto branco/dourado, sempre mostrando a data do dia em que o lead acessa a página
- Remover a IIFE desnecessária — simplificar para inline com `new Date()`

