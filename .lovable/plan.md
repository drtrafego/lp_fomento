

## Glassmorphism nas Notificações de PIX

### Mudança

Alterar o estilo de cada card de notificação na `PixNotificationsSection` (linha 639) de fundo branco opaco para vidro jateado (frosted glass):

**De:** `bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl`
**Para:** `bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20`

Ajustar as cores do texto de cinza escuro para branco/claro:
- Título "Pix recebido": `text-white font-semibold`
- "agora": `text-white/50`
- "ORDEM DE PAGAMENTO": `text-white/70`
- Valor: `text-white font-bold`

### Arquivo

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Linha 639: trocar bg/cores para glassmorphism |

