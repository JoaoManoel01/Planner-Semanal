import { useId } from "react";
import { GRUPOS_POR_ID } from "../../domain/treinos.js";

/**
 * Mapa corporal — silhueta humana desenhada por âncoras.
 *
 * O contorno é definido por pontos e convertido em curvas (Catmull-Rom → Bézier)
 * na carga do módulo: ajustar a anatomia é mexer em coordenadas legíveis, não em
 * números de controle de Bézier. Custo em tempo de render: zero.
 *
 * Sistema: 240 × 520, centro em x=120, figura de ~7,5 cabeças.
 * Marcos: topo 26 · queixo 89 · ombro 117 · cintura 210 · virilha 274 ·
 *         joelho 376 · chão 500.
 */

const W = 240;

function suave(pts, { fechado = true, t = 0.8 } = {}) {
  const p = pts.map(([x, y]) => ({ x, y }));
  const n = p.length;
  const at = i => p[fechado ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${p[0].x} ${p[0].y}`;
  const fim = fechado ? n : n - 1;
  for (let i = 0; i < fim; i++) {
    const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
    const c1x = +(b.x + ((c.x - a.x) / 6) * t).toFixed(1);
    const c1y = +(b.y + ((c.y - a.y) / 6) * t).toFixed(1);
    const c2x = +(c.x - ((e.x - b.x) / 6) * t).toFixed(1);
    const c2y = +(c.y - ((e.y - b.y) / 6) * t).toFixed(1);
    d += `C${c1x} ${c1y} ${c2x} ${c2y} ${c.x} ${c.y}`;
  }
  return d + (fechado ? "Z" : "");
}

const espelhar = pts => pts.map(([x, y]) => [W - x, y]);
const par = (pts, o) => [suave(pts, o), suave(espelhar(pts), o)];
const simetrico = (meio, o) => suave([...meio, ...espelhar([...meio].reverse().slice(1, -1))], o);
const traco = pts => suave(pts, { fechado: false });

/* ── Silhueta ────────────────────────────────────────────────────── */

const CABECA = simetrico([
  [120, 26], [133, 31], [141, 43], [141, 57],   // crânio
  [137, 70], [130, 81],                          // mandíbula
  [124, 89]                                      // queixo
], { t: 0.7 });

const TRONCO = simetrico([
  [120, 84], [127, 88],          // base do maxilar
  [129, 94], [131, 100],         // pescoço
  [143, 106], [157, 117],        // trapézio até a articulação do ombro
  [153, 137],                    // sob a axila
  [156, 158], [154, 178],        // caixa torácica
  [150, 196], [149, 210],        // cintura
  [155, 232], [158, 250],        // quadril
  [154, 262], [144, 270],        // virilha
  [120, 274]
]);

const BRACO = [
  [148, 108], [163, 114], [176, 126], [183, 145],   // deltoide
  [186, 169], [188, 191],                            // braço
  [191, 212],                                        // cotovelo
  [195, 235], [196, 261],                            // antebraço
  [194, 282],                                        // punho
  [199, 294], [198, 314], [191, 321],                // mão
  [184, 316], [183, 295],                            // retorno pela face interna
  [181, 271], [177, 239],
  [173, 214],
  [169, 188], [165, 164],
  [160, 144], [152, 125]
];

const PERNA = [
  [136, 262], [152, 268], [161, 288],                // quadril e coxa
  [157, 318], [150, 350], [148, 376],                // joelho
  [152, 398], [147, 428],                            // panturrilha
  [138, 458], [134, 474],                            // tornozelo
  [136, 486], [153, 494], [151, 500], [126, 500],    // pé
  [123, 476], [126, 450],                            // calcanhar e canela
  [129, 398], [130, 374],
  [128, 340], [126, 300], [130, 272]                 // face interna da coxa
];

const SILHUETA = [CABECA, TRONCO, ...par(BRACO), ...par(PERNA)];

/* ── Grupos musculares ───────────────────────────────────────────── */

const DELTOIDE = [[149, 110], [163, 116], [175, 128], [181, 146], [179, 162], [170, 169], [161, 158], [156, 137], [152, 120]];
const BICEPS = [[165, 166], [177, 175], [183, 193], [180, 210], [173, 213], [168, 199], [164, 181]];
const TRICEPS = [[164, 168], [176, 178], [182, 196], [179, 213], [171, 215], [166, 201], [162, 183]];
const QUADRICEPS = [[131, 274], [151, 282], [159, 308], [156, 338], [149, 364], [139, 362], [133, 330], [130, 296]];
const POSTERIOR = [[132, 288], [152, 294], [160, 316], [157, 342], [150, 366], [140, 364], [134, 334], [131, 306]];
const PANTURRILHA = [[133, 382], [147, 390], [152, 412], [148, 436], [139, 446], [132, 430], [130, 404]];
const DORSAL = [[152, 144], [156, 164], [153, 186], [144, 208], [132, 224], [126, 218], [132, 194], [140, 168]];

const FRENTE = {
  ombros: par(DELTOIDE),
  peito: par([[121, 116], [136, 115], [149, 122], [155, 136], [153, 151], [144, 160], [131, 161], [121, 156]]),
  biceps: par(BICEPS),
  core: [suave([[120, 166], [130, 170], [136, 184], [138, 202], [136, 222], [131, 244], [120, 262],
                [109, 244], [104, 222], [102, 202], [104, 184], [110, 170]])],
  pernas: par(QUADRICEPS)
};

const COSTAS = {
  ombros: par(DELTOIDE),
  costas: [
    /* trapézio */
    suave([[120, 102], [138, 112], [150, 126], [144, 148], [132, 170], [120, 182],
           [108, 170], [96, 148], [90, 126], [102, 112]]),
    ...par(DORSAL)
  ],
  triceps: par(TRICEPS),
  gluteos: par([[122, 234], [140, 238], [151, 250], [152, 268], [144, 282], [129, 284], [121, 270]]),
  pernas: [...par(POSTERIOR), ...par(PANTURRILHA)]
};

/* Traços anatômicos: dão leitura de corpo sem virar ilustração. */
const TRACOS_FRENTE = [
  traco([[106, 112], [120, 119], [134, 112]]),   // clavículas
  traco([[120, 122], [120, 164]]),               // esterno
  traco([[120, 170], [120, 258]]),               // linha alba
  traco([[109, 192], [131, 192]]),
  traco([[107, 210], [133, 210]]),
  traco([[109, 230], [131, 230]])
];

const TRACOS_COSTAS = [
  traco([[120, 104], [120, 228]]),               // coluna
  traco([[103, 116], [120, 126], [137, 116]]),   // trapézio superior
  traco([[111, 148], [120, 142], [129, 148]])    // escápulas
];

/* ── Componente ──────────────────────────────────────────────────── */

function Figura({ titulo, grupos, tracos, intensidades, uid }) {
  const clip = `corpo-${uid}-${titulo}`;

  return (
    <div className="mapa-coluna">
      <span className="mapa-titulo">{titulo}</span>
      <svg
        className="corpo-svg"
        viewBox={`0 0 ${W} 520`}
        role="img"
        aria-label={`Mapa corporal — ${titulo.toLowerCase()}`}
      >
        <defs>
          <clipPath id={clip}>
            {SILHUETA.map((d, i) => <path key={i} d={d} />)}
          </clipPath>
        </defs>

        {SILHUETA.map((d, i) => <path key={i} className="corpo-base" d={d} />)}

        <g clipPath={`url(#${clip})`}>
          {Object.entries(grupos).map(([grupo, paths]) => {
            const i = intensidades?.[grupo] || 0;
            const nome = GRUPOS_POR_ID[grupo]?.nome || grupo;
            return (
              <g
                key={grupo}
                className="corpo-regiao"
                style={{
                  fill: "var(--accent)",
                  fillOpacity: i > 0 ? 0.14 + i * 0.58 : 0.04,
                  stroke: "var(--accent)",
                  strokeOpacity: i > 0 ? 0.45 : 0.1
                }}
              >
                <title>{nome}</title>
                {paths.map((d, j) => <path key={j} d={d} />)}
              </g>
            );
          })}
        </g>

        <g className="corpo-traco" clipPath={`url(#${clip})`}>
          {tracos.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>
    </div>
  );
}

export default function MapaCorporal({ intensidades }) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className="mapa-corpo">
      <Figura titulo="Frente" grupos={FRENTE} tracos={TRACOS_FRENTE} intensidades={intensidades} uid={uid} />
      <Figura titulo="Costas" grupos={COSTAS} tracos={TRACOS_COSTAS} intensidades={intensidades} uid={uid} />
    </div>
  );
}
