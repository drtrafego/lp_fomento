

## Bônus: Trocar Cards por Lista

### Mudança

Substituir o grid de 2 cards (linhas 522-561) por uma lista vertical simples, onde cada bônus aparece como um item de lista horizontal: ícone à esquerda, título + descrição no meio, preço riscado + "GRÁTIS" à direita.

### Implementação em `src/pages/Index.tsx`

**Linhas 522-561**: Substituir o `grid md:grid-cols-2` por uma lista vertical `flex flex-col gap-4 max-w-2xl mx-auto`:

```tsx
<div className="flex flex-col gap-4 max-w-2xl mx-auto">
  {bonuses.map((b, i) => (
    <div key={b.title}
      className="flex items-center gap-4 bg-[#0f1d32] border border-[#d4a853]/15 rounded-xl px-5 py-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${i * 200}ms`,
        transition: "all 0.6s ease",
      }}
    >
      {/* Ícone */}
      <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0 border border-[#d4a853]/20">
        {/* ícone existente */}
      </div>

      {/* Título + Descrição */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-white">{b.title}</h3>
        <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{b.desc}</p>
      </div>

      {/* Preço */}
      <div className="flex-shrink-0 text-right">
        <p className="text-white/40 text-xs line-through">{b.price}</p>
        <p className="text-[#d4a853] font-extrabold text-lg">GRÁTIS</p>
      </div>
    </div>
  ))}
</div>
```

Layout funciona igual em mobile, tablet e desktop — responsivo por padrão como lista vertical.

