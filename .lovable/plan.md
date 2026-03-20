

## Barra Rotativa de Cases de Sucesso

Adicionar uma barra estilo marquee/ticker logo abaixo do header fixo (antes da hero), com 30 cases de empresas que captaram recursos. Cada item mostra: foto de perfil circular + @ do Instagram + valor captado.

### Estrutura visual de cada item

```text
(○ foto)  @bulldogburguer  R$ 400.000
```

### Implementação

**Arquivo: `src/pages/Index.tsx`**

1. Criar array `cases` com 30 entradas (handle + valor + placeholder para foto)
2. Adicionar componente `MarqueeCases` logo após o `</header>` e antes da hero
3. A barra usa animação CSS `@keyframes marquee` — duplica o conteúdo para loop infinito
4. Fundo `#0f1d32` com borda sutil dourada, posição fixa abaixo do header (`top: ~56px`)
5. Ajustar `pt` da hero para compensar a altura extra

**Arquivo: `src/index.css`**

6. Adicionar keyframes `marquee` para scroll horizontal contínuo:
```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### Dados dos 30 cases

Serão preenchidos com dados placeholder (ex: `@bulldogburguer · R$ 400.000`, `@empresa2 · R$ 180.000`, etc.) — o array fica editável para substituir pelos dados reais. Cada case terá um círculo colorido como avatar placeholder até fotos reais serem fornecidas.

### Layout

- Desktop: scroll contínuo horizontal, ~30s de duração
- Mobile: mesma animação, velocidade ajustada
- Itens espaçados com `gap`, texto pequeno (`text-xs`/`text-sm`), valor em dourado

