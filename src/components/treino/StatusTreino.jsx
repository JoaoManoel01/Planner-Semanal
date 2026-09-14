import { DIAS_CURTOS } from "../../domain/time.js";
import { GRUPOS } from "../../domain/treinos.js";
import { formatarCarga, formatarPeso, formatarDelta, formatarPercentual, direcao } from "./formato.js";

/**
 * Ritmo da semana: uma barra por dia.
 * Dia planejado sem registro aparece como contorno — a lacuna é informação.
 */
function RitmoSemanal({ resumo, dias, onDia }) {
  const pico = Math.max(...resumo.porDia, 1);

  return (
    <div className="ritmo" role="group" aria-label="Volume por dia da semana">
      {dias.map(dia => {
        const volume = resumo.porDia[dia.index] || 0;
        const planejado = resumo.diasPlanejados.includes(dia.index);
        const altura = volume ? Math.max(8, Math.round((volume / pico) * 100)) : 0;
        const estado = volume ? "feito" : planejado ? "planejado" : "livre";

        return (
          <button
            key={dia.iso}
            type="button"
            className={"ritmo-dia estado-" + estado + (dia.hoje ? " is-hoje" : "")}
            onClick={() => onDia(dia.iso)}
            title={`${dia.nome} · ${volume ? formatarCarga(volume) + "kg" : planejado ? "planejado" : "sem treino"}`}
          >
            <span className="ritmo-trilho">
              <span className="ritmo-barra" style={{ height: altura + "%" }} />
            </span>
            <span className="ritmo-rotulo">{DIAS_CURTOS[dia.index][0]}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function StatusTreino({ resumo, peso, dias, onDia }) {
  const variacao = formatarPercentual(resumo.variacao);
  const deltaPeso = peso ? formatarDelta(peso.delta) : null;

  return (
    <section className="status status-treino" aria-label="Situação da semana de treino">
      <div className="status-principal">
        <span className="status-rotulo">Volume da semana</span>
        <div className="status-numero">
          <strong>{formatarCarga(resumo.volume)}</strong>
          <span>kg</span>
          {variacao && (
            <span className={"status-variacao dir-" + direcao(resumo.variacao)}>
              {variacao}
              <em>vs. semana anterior</em>
            </span>
          )}
        </div>
      </div>

      <RitmoSemanal resumo={resumo} dias={dias} onDia={onDia} />

      <div className="status-metricas">
        <div className="status-metrica">
          <span className="metrica-rotulo">Sessões</span>
          <span className="metrica-valor">
            {resumo.sessoes} <em>/ {resumo.diasPlanejados.length || 7}</em>
          </span>
        </div>
        <div className="status-metrica">
          <span className="metrica-rotulo">Grupos</span>
          <span className="metrica-valor">
            {resumo.gruposTocados} <em>/ {GRUPOS.length}</em>
          </span>
        </div>
        <div className="status-metrica">
          <span className="metrica-rotulo">Peso</span>
          <span className="metrica-valor">
            {peso ? (
              <>
                {formatarPeso(peso.peso)} <em>kg</em>
                {deltaPeso && deltaPeso !== "estável" && (
                  <i className={"metrica-delta dir-" + direcao(peso.delta)}>{deltaPeso}</i>
                )}
              </>
            ) : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}
