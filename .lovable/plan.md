

## Adicionar Logo do Zoom no Header Fixo

### Mudança

1. **Copiar imagem** do Zoom para `src/assets/zoom-icon.png`

2. **No header (linha 678-681)**: Inserir a logo do Zoom ao lado do texto "AO VIVO no ZOOM", com máscara redonda (`rounded-full overflow-hidden`) e tamanho pequeno (~20px) para caber no header

### Código resultante (linha 678-681):
```tsx
<div className="flex items-center gap-2.5 text-sm sm:text-base text-[#d4a853] font-bold tracking-wide uppercase">
  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
  AO VIVO no
  <img src={zoomIcon} alt="Zoom" className="w-5 h-5 rounded-full object-cover inline-block" />
  ZOOM · Quinta-feira 20h
</div>
```

Nota: já existe `zoomLogo` importado (linha 19). Vou verificar se é a mesma imagem ou se precisa usar a nova.

