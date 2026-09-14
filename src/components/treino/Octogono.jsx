import { formatarCarga } from "./formato.js";

/**
 * Octógono de desempenho — oito grupos, um eixo cada.
 * O viewBox reserva margem para os rótulos: eles pertencem ao desenho, não sobram dele.
 */
export default function Octogono({ dados, size = 280 }) {
  const margem = 34;
  const total = size + margem * 2;
  const centro = total / 2;
  const raio = size * 0.38;

  const n = Math.max(3, dados.length);
  const angulo = i => (-90 + (i * 360) / n) * (Math.PI / 180);
  const ponto = (i, fator) => [
    centro + Math.cos(angulo(i)) * raio * fator,
    centro + Math.sin(angulo(i)) * raio * fator
  ];
  const poligono = fator => dados.map((_, i) => ponto(i, fator).join(",")).join(" ");
  const valor = dados.map((d, i) => ponto(i, Math.max(d.valor, 0.02)).join(",")).join(" ");
  const vazio = dados.every(d => !d.carga);

  return (
    <svg
      className={"octogono" + (vazio ? " is-vazio" : "")}
      viewBox={`0 0 ${total} ${total}`}
      width={total}
      height={total}
      role="img"
      aria-label="Desempenho por grupo muscular"
    >
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon key={f} className="octogono-anel" points={poligono(f)} />
      ))}

      {dados.map((d, i) => {
        const [x, y] = ponto(i, 1);
        return <line key={d.id} className="octogono-eixo" x1={centro} y1={centro} x2={x} y2={y} />;
      })}

      <polygon className="octogono-valor" points={valor} />

      {dados.map((d, i) => {
        const [x, y] = ponto(i, Math.max(d.valor, 0.02));
        return (
          <circle key={d.id} className={"octogono-ponto" + (d.carga ? "" : " is-vazio")} cx={x} cy={y} r={2.5}>
            <title>{`${d.nome} · ${formatarCarga(d.carga)}kg`}</title>
          </circle>
        );
      })}

      {dados.map((d, i) => {
        const [x, y] = ponto(i, 1.22);
        return (
          <text
            key={d.id}
            className={"octogono-rotulo" + (d.carga ? " tem-carga" : "")}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {d.nome}
          </text>
        );
      })}
    </svg>
  );
}
