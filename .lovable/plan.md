
# Duplicar barra "AO VIVO" entre o título e o card de preço

## Alteração em `src/components/BelowFoldSections.tsx` (entre linhas 726 e 727)

Inserir uma cópia da barra de evento (indicador vermelho pulsante + ícone Zoom + data) centralizada, logo após o `<h2>Workshop Do Zero à Captação</h2>` e antes do card `<div className="bg-[#0f1d32] border-2...">`.

### Código a inserir

```tsx
<div className="flex items-center justify-center gap-3 text-sm flex-wrap">
  <span className="bg-red-500/20 text-red-400 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-500/30">
    AO VIVO
  </span>
  <div className="flex items-center gap-2.5 text-sm sm:text-base text-white/50">
    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
    <img src={zoomIcon} alt="Zoom" className="w-6 h-6 rounded-full object-cover" loading="lazy" />
    <span>Terça-feira dia 31/03/26 às 20h</span>
  </div>
</div>
```

Será necessário importar `zoomIcon` no componente (verificar se já está importado).
