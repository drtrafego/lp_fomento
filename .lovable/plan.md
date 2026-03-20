

## Alterações na Primeira Dobra (Hero) e Botões

### Mudanças solicitadas

**1. Barra de data/evento no topo da hero (antes do H1)**
- Estilo similar às referências: "Quinta-feira às 20h / ● online ao vivo"
- Layout inline com separador visual

**2. Nova H1**
- De: "Como captar de R$ 39 mil a R$ 400 mil para a sua empresa ou ideia de negócio"
- Para: "Em 1h ao vivo, eu vou te mostrar o passo a passo de como você vai captar de **R$ 39 mil a R$ 400 mil** para sua empresa ou ideia de negócio"

**3. Botão sem preço**
- Texto: "GARANTIR MINHA VAGA" (sem "— R$ 47")
- Abaixo do botão: "🛡 Garantia de 30 dias · Compra segura"

**4. Barra de contador de dias até o workshop**
- Visível apenas terça, quarta e quinta-feira
- Progress bar visual (3 etapas: terça → quarta → quinta)
- Texto dinâmico:
  - Terça: "Faltam 2 dias"
  - Quarta: "É amanhã!"
  - Quinta: "É hoje!"
- Nos outros dias da semana, a barra não aparece

**5. Todos os botões da página**
- Remover preço de todos os CTAs (manter apenas no pricing section)
- Manter abaixo de cada botão: "Garantia de 30 dias · Compra segura"

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Refatorar hero section, atualizar todos os GoldButton, adicionar lógica de dia da semana para barra de countdown |

### Lógica do contador de dias

```text
const dayOfWeek = new Date().getDay()
// 2 = terça, 3 = quarta, 4 = quinta
if (dayOfWeek === 2) → "Faltam 2 dias" (barra 33%)
if (dayOfWeek === 3) → "É amanhã!" (barra 66%)
if (dayOfWeek === 4) → "É hoje!" (barra 100%)
else → barra oculta
```

