

## Hero Desktop: Foto Full com Degradê + Nome/Credencial

### Mudança

No desktop, substituir a foto circular por a nova foto completa (`Gemini_Generated_Image_p81ahfp81ahfp81a-2.png`) com degradê transparente nas bordas para transicionar suavemente para o fundo escuro. Manter "PEDRO DINIZ" e "+ de 50 milhões captados" sobrepostos na foto.

No mobile, manter o layout circular atual.

### Implementação em `src/pages/Index.tsx`

1. **Copiar imagem** para `src/assets/pedro-palco-desktop.png`

2. **Coluna direita (linhas 680-699)**: Adicionar dois blocos condicionais via classes responsivas:
   - **Mobile (`lg:hidden`)**: Manter o bloco circular atual (foto redonda + anéis animados)
   - **Desktop (`hidden lg:block`)**: Novo bloco com a foto full, degradê e texto:

```tsx
<div className="hidden lg:block relative">
  <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl">
    <img src={pedroPalcoDesktop} alt="Pedro Diniz" className="w-full h-auto object-cover" />
    {/* Degradê inferior */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
    {/* Degradê lateral esquerda */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-transparent" />
    {/* Nome e credencial */}
    <div className="absolute bottom-4 left-0 right-0 text-center">
      <h3 className="text-white font-bold text-lg tracking-widest uppercase">PEDRO DINIZ</h3>
      <p className="text-[#d4a853] text-sm font-medium mt-1">+ de 50 milhões captados</p>
    </div>
  </div>
</div>
```

3. **Import**: `import pedroPalcoDesktop from "@/assets/pedro-palco-desktop.png"`

### Resultado
- Desktop: foto profissional do Pedro no palco, com degradê suave para o fundo escuro, nome e credencial sobrepostos
- Mobile: mantém a foto circular atual sem alterações

