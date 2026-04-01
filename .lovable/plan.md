

## Alterar título da seção de aprendizado

O usuário quer trocar o título atual "O que você vai aprender no WORKSHOP AO VIVO do Zero à Captação" pelo texto mostrado na imagem: "O que você precisa para estar apto aos programas de incentivo." com um ícone de clipboard/checklist acima.

### Alterações em `src/components/BelowFoldSections.tsx`

1. **Linhas 250-256** — Substituir o bloco de título:
   - Adicionar um ícone de clipboard (ClipboardCheck do Lucide) centralizado acima do texto, em verde-claro (#a3e635)
   - Trocar o título para: `1️⃣ O que você precisa para estar apto aos programas de incentivo.` — com "O que você precisa" destacado em verde-claro/lima e o restante em branco
   - Remover o subtítulo "Em apenas 1 hora ao vivo"

2. **Import** — Adicionar `ClipboardCheck` ao import de lucide-react no topo do arquivo

