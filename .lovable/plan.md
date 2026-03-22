

## Mover Referência do Evento para Abaixo do Botão CTA

### Mudanças em `src/pages/Index.tsx`

1. **Remover o header fixo inteiro** (linhas 677-700) — o bloco `<header>` com "AO VIVO no ZOOM", countdown e backdrop

2. **Remover `pt-20` da hero** (linha 703) — já não precisa de padding-top para compensar o header fixo. Trocar para `pt-8`

3. **Adicionar referência do evento abaixo do botão CTA** (após linha 779): Uma linha simples com o ícone do Zoom, texto "Quinta-feira às 20h · Zoom" e o countdown, similar ao que estava no header mas inline no hero:

```tsx
<div className="flex items-center justify-center gap-2 text-sm text-white/50 pt-2">
  <img src={zoomIcon} alt="Zoom" className="w-5 h-5 rounded-full object-cover" />
  <span>Quinta-feira às 20h · Zoom</span>
</div>
```

4. **Mover o countdown** para dentro dessa mesma área, logo abaixo, em formato compacto

### Resultado
- Header fixo removido — mais espaço visual
- Referência de data/hora aparece logo abaixo do botão CTA como informação contextual
- Countdown continua visível na hero

