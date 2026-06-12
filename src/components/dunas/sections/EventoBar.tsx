import { useCountdown, getWorkshopDate } from "@/hooks/useWorkshopBits";
import zoomIcon from "@/assets/zoom-icon.webp";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

// Barra de evento ao vivo. Comunica que a oferta é um evento no Zoom com data
// fixa e countdown. Estilo sóbrio dourado (high ticket), nunca vermelho gritante.
// Reutiliza getWorkshopDate / useCountdown (fonte única em useWorkshopBits).
export function EventoBar() {
  const d = getWorkshopDate();
  const { days, hours, minutes, seconds } = useCountdown();

  const diaSemana = DIAS_SEMANA[d.getDay()];
  const dataExtenso = `${diaSemana}, ${d.getDate()} de ${MESES[d.getMonth()]}, às ${d.getHours()}h`;

  const blocos: [number, string][] = [
    [days, "dias"],
    [hours, "horas"],
    [minutes, "min"],
    [seconds, "seg"],
  ];

  return (
    <section className="relative px-5 py-8" style={{ background: "var(--color-surface-1)", borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)" }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: "var(--color-gold-halo)", color: "var(--color-gold-light)", border: "1px solid var(--color-line)" }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
                style={{ background: "var(--color-gold)" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--color-gold)" }} />
            </span>
            Ao vivo
          </span>
          <div className="flex items-center gap-2.5">
            <img src={zoomIcon} alt="Zoom" className="w-6 h-6 rounded-full object-cover" loading="lazy" />
            <p className="font-sans-dunas text-sm sm:text-base" style={{ color: "var(--color-text-primary)" }}>
              {dataExtenso}, ao vivo no Zoom
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {blocos.map(([valor, label]) => (
            <div key={label} className="flex flex-col items-center">
              <span className="font-serif-dunas italic text-2xl sm:text-3xl tabular-nums leading-none" style={{ color: "var(--color-gold-light)" }}>
                {String(valor).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-wider mt-1" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
