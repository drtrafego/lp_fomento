

# Ocultar botão da hero + barra fixa só na segunda dobra

## Alterações

### 1. `src/pages/Index.tsx` — Ocultar GoldButton da hero (sem excluir)
- Comentar o bloco do `<GoldButton>` (linhas 255-258) para preservar o código para uso futuro

### 2. `src/pages/Index.tsx` — Barra fixa aparece só ao rolar para segunda dobra
- Adicionar um estado `showBottomBar` (começa `false`)
- Usar `useEffect` com `IntersectionObserver` no `<section data-section="Hero">` — quando o hero **sai** da viewport, mostrar a barra; quando volta, esconder
- Aplicar classe condicional de visibilidade (`translate-y-full` + `opacity-0` quando escondida, transição suave ao aparecer)

### Detalhes técnicos
- Criar um `ref` para a seção Hero
- Observer com `threshold: 0` detecta quando hero sai de vista
- Barra recebe `transition-transform duration-300` para animação suave de entrada/saída

