

## Melhorar Visualmente a Seção "Não é Empréstimo"

### Problemas identificados
- A imagem do homem parece "voando" — sem base/ancoragem visual
- Badge "Não é empréstimo" não está centralizado no mobile
- Layout 3 colunas no desktop com imagem no centro fragmenta a leitura

### Novo layout (inspirado na referência)

```text
Mobile:
┌─────────────────────────────┐
│      [IMAGEM do homem]      │  ← com gradiente na base
│      fundido no fundo       │     para não parecer voando
│                             │
│     NÃO É EMPRÉSTIMO        │  ← badge centralizado
│                             │
│  NÃO É EMPRÉSTIMO.          │
│  NÃO É FAVOR.               │
│  É SEU DIREITO POR LEI.     │
│                             │
│  Copy de apoio...           │
│                             │
│  [QUERO MEU INGRESSO]       │
└─────────────────────────────┘
```

### Mudanças

1. **Imagem**: Colocar na parte superior com gradiente `from-transparent to-[#0a1628]` na base para fundir com o fundo (eliminar efeito "voando")
2. **Badge vermelho**: Centralizar com `text-center` no mobile
3. **Layout**: Empilhar verticalmente — imagem no topo, headline + copy abaixo centralizado
4. **Desktop**: Manter 2 colunas (imagem à esquerda com gradiente, texto à direita) em vez de 3 colunas
5. **Copy completa**: Manter os 3 parágrafos conforme o usuário aprovou + adicionar CTA "QUERO MEU INGRESSO"
6. **Anéis dourados**: Posicionar atrás da imagem (não no centro da seção) para dar contexto à pessoa

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Refatorar seção 3: layout, gradiente na imagem, centralizar badge, CTA |

