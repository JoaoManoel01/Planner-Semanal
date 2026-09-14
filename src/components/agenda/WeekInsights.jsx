import { ICONES_INSIGHT } from "../ui/Icon.jsx";

const ROTULO = {
  conflict: "Conflito",
  deadline: "Prazo",
  attention: "Atenção",
  pattern: "Padrão",
  planning: "Planejamento",
  reminder: "Agora"
};

/**
 * Camada 3 — interpretação contextual.
 * Os cards vêm do motor de regras: variam com a semana e podem não existir.
 */
export default function WeekInsights({ insights }) {
  if (!insights.length) return null;

  return (
    <section className="insights" aria-label="Leitura da semana">
      <div className="secao-cabeca">
        <h2 className="secao-titulo">Leitura da semana</h2>
        <span className="secao-linha" aria-hidden="true" />
        <span className="secao-contagem">{insights.length}</span>
      </div>

      <div className="insights-grade">
        {insights.map(insight => {
          const Icone = ICONES_INSIGHT[insight.type] || ICONES_INSIGHT.planning;
          return (
            <article key={insight.id} className={`insight tipo-${insight.type}`}>
              <header className="insight-topo">
                <span className="insight-icone"><Icone size={14} /></span>
                <span className="insight-tipo">{ROTULO[insight.type] || "Insight"}</span>
              </header>
              <h3 className="insight-titulo">{insight.title}</h3>
              <p className="insight-corpo">{insight.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
