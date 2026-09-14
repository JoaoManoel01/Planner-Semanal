import { formatarHoras } from "../../domain/time.js";

/**
 * Camada 2 — interpretação quantitativa.
 * Distribuição horizontal compacta, sem virar gráfico.
 */
export default function WeekSummary({ summary }) {
  const { porCategoria, porDia, totalMin } = summary;
  const pico = Math.max(...porDia.map(d => d.minutos), 1);

  return (
    <section className="resumo" aria-label="Resumo da semana">
      <div className="secao-cabeca">
        <h2 className="secao-titulo">Resumo</h2>
        <span className="secao-linha" aria-hidden="true" />
        <span className="resumo-total">
          {formatarHoras(totalMin)} <em>na semana</em>
        </span>
      </div>

      {totalMin > 0 ? (
        <>
          <div className="distribuicao" role="img" aria-label="Distribuição por categoria">
            {porCategoria.map(c => (
              <span
                key={c.id}
                className="distribuicao-faixa"
                style={{ width: `${c.fatia * 100}%`, background: c.cor }}
                title={`${c.nome} · ${formatarHoras(c.minutos)} (${Math.round(c.fatia * 100)}%)`}
              />
            ))}
          </div>

          <div className="resumo-categorias">
            {porCategoria.map(c => (
              <div key={c.id} className="resumo-chip" style={{ "--cor": c.cor }}>
                <i className="ponto" />
                <span className="chip-nome">{c.nome}</span>
                <b>{formatarHoras(c.minutos)}</b>
                <span className="chip-fatia">{Math.round(c.fatia * 100)}%</span>
              </div>
            ))}
          </div>

          <div className="resumo-dias">
            {porDia.map(d => (
              <div key={d.index} className={"dia-coluna" + (d.hoje ? " hoje" : "")}>
                <div className="dia-barra">
                  <i style={{ height: `${(d.minutos / pico) * 100}%` }} />
                </div>
                <span className="dia-nome">{d.curto}</span>
                <span className="dia-horas">{d.minutos ? formatarHoras(d.minutos) : "—"}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="vazio">Sem atividades registradas nesta semana.</p>
      )}
    </section>
  );
}
