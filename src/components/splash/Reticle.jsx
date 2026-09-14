/**
 * Símbolo da marca: eixo temporal com o instante atual no centro.
 * Tudo reage ao progresso do ativador — o sistema "carrega" enquanto se arrasta.
 */
export default function Reticle({ progress = 0, saindo = false }) {
  const p = saindo ? 1 : progress;

  const anelInterno = 1 - p * 0.12;
  const marcaDeslize = p * 7;           // as marcas convergem para o centro
  const nucleo = 5.4 + p * 2.6;
  const halo = 9 + p * 7;
  const eixo = 1.9 + p * 1.2;

  return (
    <svg
      className={"reticulo" + (saindo ? " saindo" : "")}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
      style={{ "--p": p }}
    >
      <defs>
        <linearGradient id="reticulo-eixo" gradientUnits="userSpaceOnUse" x1="2" y1="100" x2="198" y2="100">
          <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0" />
          <stop offset="34%" stopColor="var(--color-brand-cyan)" stopOpacity="0.62" />
          <stop offset="50%" stopColor="var(--color-brand-cyan)" stopOpacity="1" />
          <stop offset="66%" stopColor="var(--color-brand-cyan)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-brand-cyan)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle
        className="reticulo-anel"
        cx="100" cy="100" r="46"
        style={{ transform: `scale(${anelInterno})`, opacity: 0.28 + p * 0.34 }}
      />
      <circle className="reticulo-anel reticulo-anel-pulso" cx="100" cy="100" r="46" />

      <line
        className="reticulo-eixo"
        x1="2" y1="100" x2="198" y2="100"
        stroke="url(#reticulo-eixo)"
        style={{ strokeWidth: eixo }}
      />

      <g className="reticulo-marcas" style={{ opacity: 0.9 + p * 0.1 }}>
        <line x1="100" y1={36 + marcaDeslize} x2="100" y2={62 + marcaDeslize} />
        <line x1="100" y1={70 + marcaDeslize * 0.6} x2="100" y2={86 + marcaDeslize * 0.6} />
        <line x1="100" y1={114 - marcaDeslize * 0.6} x2="100" y2={130 - marcaDeslize * 0.6} />
        <line x1="100" y1={138 - marcaDeslize} x2="100" y2={164 - marcaDeslize} />
      </g>

      <circle className="reticulo-halo" cx="100" cy="100" r={halo} />
      <circle className="reticulo-nucleo" cx="100" cy="100" r={nucleo} />
    </svg>
  );
}
