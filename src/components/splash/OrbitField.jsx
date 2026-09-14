/**
 * Campo orbital de fundo.
 * Uma órbita dominante cujas laterais cruzam a tela, uma segunda mais aberta
 * para profundidade, e duas faixas de luz difusa nos cantos opostos.
 * O progresso do ativador contrai o campo e acende os arcos.
 */
export default function OrbitField({ progress = 0, saindo = false }) {
  const escala = saindo ? 0.88 : 1 - progress * 0.06;
  const acender = progress * 0.6;

  return (
    <svg
      className="splash-campo"
      viewBox="0 0 1536 1004"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ "--acender": acender }}
    >
      <defs>
        <filter id="campo-difusao" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="54" />
        </filter>
      </defs>

      <g className="splash-campo-brilhos" filter="url(#campo-difusao)">
        <path d="M -60 -80 C 250 90, 320 330, 150 660" />
        <path d="M 1640 480 C 1400 690, 1210 810, 1000 1080" />
      </g>

      <g className="splash-campo-corpo" style={{ transform: `scale(${escala})` }}>
        {/* órbita principal: só as laterais entram no quadro */}
        <g className="splash-campo-arco splash-campo-arco-1">
          <ellipse cx="768" cy="468" rx="634" ry="548" transform="rotate(-8 768 468)" />
          <circle className="splash-campo-ponto" cx="134" cy="468" r="3.6" />
          <circle className="splash-campo-ponto pequeno" cx="1402" cy="468" r="2.6" />
        </g>

        {/* órbita secundária, mais aberta e mais fraca */}
        <g className="splash-campo-arco splash-campo-arco-2">
          <ellipse cx="768" cy="520" rx="742" ry="612" transform="rotate(12 768 520)" />
          <circle className="splash-campo-ponto pequeno" cx="26" cy="520" r="2.2" />
        </g>
      </g>
    </svg>
  );
}
