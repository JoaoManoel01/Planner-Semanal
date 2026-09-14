import { formatarNumero } from "./numeros.js";

/**
 * Gráfico de linha do módulo.
 * A escala acompanha os dados (nunca força o zero): numa curva de peso corporal,
 * ancorar em zero achata a variação real até ela desaparecer.
 */
export default function GraficoLinha({
  series,
  altura = 160,
  rotulos,
  formatar = formatarNumero,
  unidade = ""
}) {
  const w = 640;
  const h = altura;
  const padEsq = 42;
  const padDir = 14;
  const padTopo = 14;
  const padBase = rotulos ? 26 : 14;

  const todos = series.flatMap(s => s.valores).filter(v => Number.isFinite(v));
  if (!todos.length) return null;

  const bruto = { min: Math.min(...todos), max: Math.max(...todos) };
  const folga = (bruto.max - bruto.min) * 0.12 || Math.max(1, bruto.max * 0.04);
  const min = bruto.min - folga;
  const max = bruto.max + folga;
  const alcance = max - min || 1;

  const n = Math.max(...series.map(s => s.valores.length), 2);
  const x = i => padEsq + (i * (w - padEsq - padDir)) / Math.max(1, n - 1);
  const y = v => h - padBase - ((v - min) / alcance) * (h - padTopo - padBase);

  const linhasGuia = [bruto.max, (bruto.max + bruto.min) / 2, bruto.min];
  const principal = series[0];
  const ultimo = principal.valores[principal.valores.length - 1];

  return (
    <svg
      className="grafico-linha"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Evolução de ${formatar(bruto.min)} a ${formatar(bruto.max)} ${unidade}`}
    >
      {linhasGuia.map((v, i) => (
        <g key={i} className="grafico-guia">
          <line x1={padEsq} y1={y(v)} x2={w - padDir} y2={y(v)} />
          <text x={padEsq - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">
            {formatar(v)}
          </text>
        </g>
      ))}

      {series.map((s, si) => {
        const pontos = s.valores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        const classe = "grafico-serie" + (s.classe ? " " + s.classe : "");

        return (
          <g key={si}>
            {si === 0 && s.valores.length > 1 && (
              <polygon
                className="grafico-area"
                points={`${x(0)},${h - padBase} ${pontos} ${x(s.valores.length - 1)},${h - padBase}`}
              />
            )}
            <polyline className={classe} fill="none" points={pontos} />
            {s.valores.map((v, i) => (
              <circle key={i} className={"grafico-ponto" + (s.classe ? " " + s.classe : "")} cx={x(i)} cy={y(v)} r={2.5}>
                <title>{`${formatar(v)} ${unidade}`}</title>
              </circle>
            ))}
          </g>
        );
      })}

      <circle className="grafico-ultimo" cx={x(principal.valores.length - 1)} cy={y(ultimo)} r={4} />

      {rotulos && (
        <g className="grafico-rotulo-x">
          <text x={padEsq} y={h - 6}>{rotulos[0]}</text>
          <text x={w - padDir} y={h - 6} textAnchor="end">{rotulos[rotulos.length - 1]}</text>
        </g>
      )}
    </svg>
  );
}
