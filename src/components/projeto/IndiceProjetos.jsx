import { ordenarProjetos, resumoDoProjeto, ESTADOS_POR_ID } from "../../domain/projetos.js";
import { formatarHoras, formatarDiaMes } from "../../domain/time.js";
import { IconPlus, IconChevronRight } from "../ui/Icon.jsx";

/** Miniatura do ritmo — as últimas semanas, sem eixo nem rótulo. */
function Faisca({ serie }) {
  const recentes = serie.slice(-14);
  if (recentes.length < 2) return null;
  const pico = Math.max(...recentes.map(s => s.minutos), 1);

  return (
    <span className="faisca" aria-hidden="true">
      {recentes.map(s => (
        <i key={s.semana} style={{ height: Math.max(2, Math.round((s.minutos / pico) * 100)) + "%" }} />
      ))}
    </span>
  );
}

function CartaoProjeto({ projeto, onAbrir }) {
  const resumo = resumoDoProjeto(projeto);
  const estado = ESTADOS_POR_ID[projeto.estado]?.nome || "Ativo";

  return (
    <button type="button" className={"projeto-cartao estado-" + projeto.estado} onClick={() => onAbrir(projeto.id)}>
      <header className="projeto-cartao-topo">
        <h3>{projeto.nome}</h3>
        <span className={"selo-estado est-" + projeto.estado}>{estado}</span>
      </header>

      {projeto.descricao && <p className="projeto-descricao">{projeto.descricao}</p>}

      <div className="projeto-cartao-numeros">
        <span className="projeto-total">{formatarHoras(resumo.totalMin)}<em>investidas</em></span>
        <Faisca serie={resumo.serie} />
      </div>

      <footer className="projeto-cartao-rodape">
        {resumo.proximo ? (
          <span className={"projeto-prazo" + (resumo.proximo.atrasado ? " is-atrasado" : "")}>
            {resumo.proximo.atrasado
              ? `atrasado ${Math.abs(resumo.proximo.dias)}d`
              : resumo.proximo.dias === 0
                ? "vence hoje"
                : `em ${resumo.proximo.dias}d`}
            <em>{formatarDiaMes(resumo.proximo.data)} · {resumo.proximo.titulo}</em>
          </span>
        ) : (
          <span className="projeto-prazo vazio">sem marcos</span>
        )}
        <IconChevronRight size={14} />
      </footer>
    </button>
  );
}

export default function IndiceProjetos({ projetos, onAbrir, onCriar }) {
  const ordenados = ordenarProjetos(projetos);

  if (!ordenados.length) {
    return (
      <div className="estado-vazio">
        <p>Nenhum projeto ainda.</p>
        <span className="dica">
          Cada projeto é um espaço próprio — prazos, registros e a curva de tempo investido —
          independente da sua semana.
        </span>
        <button type="button" className="btn btn-primary" onClick={onCriar}>
          <IconPlus />Criar o primeiro projeto
        </button>
      </div>
    );
  }

  return (
    <div className="projetos-grade">
      {ordenados.map(projeto => (
        <CartaoProjeto key={projeto.id} projeto={projeto} onAbrir={onAbrir} />
      ))}
    </div>
  );
}
