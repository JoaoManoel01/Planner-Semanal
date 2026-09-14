import { formatarHoras } from "../../domain/time.js";
import { formatarDiaMes } from "../../domain/time.js";

/**
 * Curva de investimento — duas leituras no mesmo desenho.
 *
 * Barras: horas por semana. É o ritmo, e cai quando o projeto para.
 * Linha:  total acumulado. É o crescimento, e só sobe.
 *
 * Sozinho, o acumulado nunca acusa abandono: um projeto parado há dois meses
 * exibe a mesma curva bonita, apenas plana. As barras é que denunciam.
 */
export default function CurvaInvestimento({ serie, altura = 200 }) {
  if (!serie?.length) return null;

  const w = 640;
  const h = altura;
  const padEsq = 46;
  const padDir = 46;
  const padTopo = 16;
  const padBase = 28;

  const largura = w - padEsq - padDir;
  const alturaUtil = h - padTopo - padBase;

  const picoSemana = Math.max(...serie.map(s => s.minutos), 1);
  const totalFinal = serie[serie.length - 1].acumulado || 1;

  const passo = largura / serie.length;
  const larguraBarra = Math.max(2, Math.min(22, passo * 0.6));

  const xBarra = i => padEsq + passo * i + (passo - larguraBarra) / 2;
  const xCentro = i => padEsq + passo * i + passo / 2;
  const yBarra = min => padTopo + alturaUtil - (min / picoSemana) * alturaUtil;
  const yLinha = acc => padTopo + alturaUtil - (acc / totalFinal) * alturaUtil;

  const linha = serie.map((s, i) => `${xCentro(i).toFixed(1)},${yLinha(s.acumulado).toFixed(1)}`).join(" ");
  const guias = [picoSemana, picoSemana / 2];

  return (
    <div className="curva">
      <div className="grafico-legenda">
        <span className="legenda-item"><i className="amostra barra" />horas na semana</span>
        <span className="legenda-item"><i className="amostra acumulado" />total acumulado</span>
      </div>

      <svg
        className="grafico-linha"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Investimento acumulado de ${formatarHoras(totalFinal)} ao longo de ${serie.length} semanas`}
      >
        {guias.map((v, i) => (
          <g key={i} className="grafico-guia">
            <line x1={padEsq} y1={yBarra(v)} x2={w - padDir} y2={yBarra(v)} />
            <text x={padEsq - 8} y={yBarra(v)} textAnchor="end" dominantBaseline="middle">
              {formatarHoras(v)}
            </text>
          </g>
        ))}

        <line className="grafico-base" x1={padEsq} y1={padTopo + alturaUtil} x2={w - padDir} y2={padTopo + alturaUtil} />

        {serie.map((s, i) => (
          <rect
            key={s.semana}
            className={"curva-barra" + (s.minutos ? "" : " is-vazia")}
            x={xBarra(i)}
            y={s.minutos ? yBarra(s.minutos) : padTopo + alturaUtil - 1}
            width={larguraBarra}
            height={s.minutos ? Math.max(1.5, alturaUtil - (yBarra(s.minutos) - padTopo)) : 1}
            rx="1.5"
          >
            <title>{`${formatarDiaMes(s.semana)} · ${formatarHoras(s.minutos)}`}</title>
          </rect>
        ))}

        <polyline className="grafico-serie acumulado" fill="none" points={linha} />
        <circle
          className="grafico-ultimo"
          cx={xCentro(serie.length - 1)}
          cy={yLinha(totalFinal)}
          r={4}
        />
        <text
          className="curva-total"
          x={w - padDir + 6}
          y={yLinha(totalFinal)}
          dominantBaseline="middle"
        >
          {formatarHoras(totalFinal)}
        </text>

        <g className="grafico-rotulo-x">
          <text x={padEsq} y={h - 6}>{formatarDiaMes(serie[0].semana)}</text>
          <text x={w - padDir} y={h - 6} textAnchor="end">{formatarDiaMes(serie[serie.length - 1].semana)}</text>
        </g>
      </svg>
    </div>
  );
}
