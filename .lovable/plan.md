

## Mover "AO VIVO" Badge para Baixo do CTA

### O que muda

O bloco "AO VIVO · Quinta-feira às 20h · Zoom" que está no topo da coluna esquerda do hero será movido para baixo, ficando após o botão CTA e a garantia, logo acima da referência dinâmica do evento (ou substituindo-a).

### Implementação em `src/pages/Index.tsx`

1. **Remover** o bloco "AO VIVO" do topo (linhas 712-718) — o `<div>` com o badge vermelho "AO VIVO" e o texto "Quinta-feira às 20h · Zoom"

2. **Mover** esse bloco para depois do `GoldButton` + garantia (após linha 765), **antes** do bloco de referência dinâmica do evento (linha 767). Ou integrar visualmente com o bloco dinâmico existente, adicionando o badge "AO VIVO" ao lado do indicador de data dinâmico.

### Resultado
- O topo do hero fica mais limpo, indo direto para o headline
- O badge "AO VIVO" + data do evento ficam juntos embaixo do CTA, reforçando urgência perto da ação

