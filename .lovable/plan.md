

## Reorganizar Seções Pós-PIX + Adicionar Copy de Transição + Reduzir Espaço Vazio

### Problemas identificados
1. Notificações PIX sobrepõem texto (sticky posicionamento conflitante)
2. Espaço azul vazio muito grande após as notificações (min-h-[80vh])
3. Ordem das seções não está como desejado

### Nova ordem (mobile)

```text
[Bônus]
   ↓
[PIX Notifications scroll-driven] ← reduzir min-h para 60vh
   ↓
"Já pensou se essa ordem de pagamento
 fosse na conta da sua empresa?
 Isso daria uma alavancada no seu negócio?
 Faça como eles 👇"
   ↓
[Vídeos Prova Social] ← mover para cá (era seção 8)
   ↓
[Mentores Pedro e Igor] ← mover para cá (era seção 7)
   ↓
[Pricing/CTA card] ← seção 10
```

### Mudanças em `src/pages/Index.tsx`

1. **Reduzir espaço vazio**: Trocar `min-h-[80vh]` por `min-h-[60vh]` no container do PixNotificationsSection
2. **Adicionar copy de transição**: Após `<PixNotificationsSection>`, inserir bloco mobile-only com texto "Já pensou se essa ordem de pagamento fosse na conta da sua empresa? isso daria uma alavancada no seu negócio? Faça como eles 👇" — centralizado, dourado
3. **Reordenar seções**: Mover seção 8 (Prova Social vídeos) para antes da seção 7 (Mentores), ficando logo após a copy de transição
4. **Manter desktop inalterado**: A reordenação se aplica no HTML geral (afeta ambos), mas a copy de transição é `sm:hidden`

