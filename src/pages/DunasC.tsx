import { useDunasPage } from "@/components/dunas/useDunasPage";
import { DunasShell } from "@/components/dunas/DunasShell";
import { HeroDados } from "@/components/dunas/HeroDados";
import { dunasThemeC } from "@/components/dunas/themes";

// ─── Versão C · Prova e Números ───
// Painel de fintech / terminal Bloomberg: o dado é o protagonista. Hero com
// "R$ 50 milhões" em CountUp, gráfico ascendente e chips de cotação. Copy
// idêntica às demais versões (consumida de content via shell e hero).
export default function DunasC() {
  const { root, handleCta } = useDunasPage();
  return (
    <DunasShell
      theme={dunasThemeC}
      hero={<HeroDados onCta={handleCta} />}
      rootRef={root}
      onCta={handleCta}
    />
  );
}
