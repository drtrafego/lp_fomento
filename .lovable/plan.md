

## Alternar Cores de Fundo Entre Seções

### Problema
Várias seções consecutivas usam a mesma cor de fundo (`#0a1628`), criando um "buraco" visual sem separação entre elas. Precisa alternar entre `#0a1628` (escuro) e `#0f1d32` (um tom mais claro) para criar quebra visual.

### Sequência corrigida (alternância consistente)

| Seção | Cor atual | Cor corrigida |
|-------|-----------|---------------|
| Hero | `#0a1628` | `#0a1628` ✅ |
| NÃO É EMPRÉSTIMO | `#0a1628` | **`#0f1d32`** |
| 42+ PROGRAMAS | `dark` (#0a1628) | **`dark={false}`** (#0f1d32) → mas mesma que anterior. Trocar para `dark` (#0a1628) |
| O QUE VAI APRENDER | `#0f1d32` | **`#0f1d32`** ✅ → trocar para `#0a1628` para alternar |
| BÔNUS | `#0a1628` | **`#0f1d32`** |
| PIX + "Já pensou" | `#0a1628` | **`#0a1628`** ✅ |
| PROVA SOCIAL | `dark` (#0a1628) | **`dark={false}`** (#0f1d32) |
| MENTORES | `dark={false}` (#0f1d32) | **`dark`** (#0a1628) |
| GARANTIA | `dark={false}` (#0f1d32) | **`dark={false}`** (#0f1d32) ✅ |
| OFERTA | `dark` (#0a1628) | **`dark`** (#0a1628) ✅ |
| FAQ | `dark={false}` (#0f1d32) | **`dark={false}`** (#0f1d32) ✅ |
| FOOTER | `#0a1628` | `#0a1628` ✅ |

### Mudanças em `src/pages/Index.tsx`

1. **Seção 3 (NÃO É EMPRÉSTIMO, linha 805)**: Trocar `bg-[#0a1628]` → `bg-[#0f1d32]`
2. **Seção 4 (42+ PROGRAMAS, linha 873)**: Trocar `dark` → `dark={false}` (fica `#0f1d32`). Na verdade precisa ficar `#0a1628` para alternar. Manter `dark`.
3. **Seção 5 (O QUE VAI APRENDER, linha 919)**: Trocar `bg-[#0f1d32]` → `bg-[#0a1628]`... Mas vamos simplificar.

**Alternância limpa (seção por seção):**

- Hero: `#0a1628` (A)
- NÃO É EMPRÉSTIMO: `#0f1d32` (B) — **mudar linha 805**
- 42+ PROGRAMAS: `#0a1628` (A) — já está `dark` ✅
- O QUE VAI APRENDER: `#0f1d32` (B) — já está ✅
- BÔNUS: `#0a1628` (A) — já está ✅
- PIX/Já pensou: `#0a1628` (A) — ✅ (continuação)
- PROVA SOCIAL: `#0f1d32` (B) — **mudar `dark` → `dark={false}`**
- MENTORES: `#0a1628` (A) — **mudar `dark={false}` → `dark`**
- GARANTIA: `#0f1d32` (B) — já `dark={false}` ✅
- OFERTA: `#0a1628` (A) — já `dark` ✅
- FAQ: `#0f1d32` (B) — já `dark={false}` ✅
- FOOTER: `#0a1628` (A) — ✅

### Resumo das edições
1. **Linha 805**: `bg-[#0a1628]` → `bg-[#0f1d32]`
2. **Linha 950**: `Section dark` → `Section dark={false}`
3. **Linha 960**: `Section dark={false}` → `Section dark`

3 linhas alteradas, alternância perfeita entre todas as seções.

