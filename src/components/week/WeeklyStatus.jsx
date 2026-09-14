import { formatarHoras } from "../../domain/time.js";

/**
 * Camada 2 — leitura quantitativa da semana.
 * Faixa compacta: um número principal, uma barra fina, três métricas.
 */
export default function WeeklyStatus({ summary, decorrido }) {
  const percentual = Math.round(summary.conclusao * 100);
  const dominante = summary.dominante;

  return (
    <section className="status" aria-label="Situação da semana">
      <div className="status-principal">
        <span className="status-rotulo">Semana</span>
        <div className="status-numero">
          <strong>{percentual}</strong>
          <span>%</span>
        </div>
        <div className="status-barra">
          <i className="status-preenchimento" style={{ width: percentual + "%" }} />
          {decorrido != null && (
            <i
              className="status-agora"
              style={{ left: Math.min(100, Math.max(0, decorrido * 100)) + "%" }}
              title="Posição do momento atual na semana"
            />
          )}
        </div>
      </div>

      <div className="status-metricas">
        <div className="status-metrica">
          <span className="metrica-rotulo">Blocos</span>
          <span className="metrica-valor">
            {summary.feitos} <em>/ {summary.blocos}</em>
          </span>
        </div>
        <div className="status-metrica">
          <span className="metrica-rotulo">Planejado</span>
          <span className="metrica-valor">{formatarHoras(summary.totalMin)}</span>
        </div>
        <div className="status-metrica">
          <span className="metrica-rotulo">Predominante</span>
          <span className="metrica-valor metrica-categoria">
            {dominante ? (
              <>
                <i className="ponto" style={{ background: dominante.cor }} />
                {dominante.nome}
              </>
            ) : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}
