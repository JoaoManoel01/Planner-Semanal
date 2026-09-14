import { formatarDiaMes, DIAS_CURTOS, isoParaData } from "../../domain/time.js";
import { ICONES_EVENTO, IconPlus, IconEdit, IconTrash } from "../ui/Icon.jsx";

const ROTULO_TIPO = {
  event: "Evento",
  deadline: "Prazo",
  milestone: "Marco",
  reminder: "Lembrete"
};

function diaDaSemana(iso) {
  return DIAS_CURTOS[(isoParaData(iso).getDay() + 6) % 7];
}

function CartaoContexto({ item, onEditar, onExcluir }) {
  const Icone = ICONES_EVENTO[item.type] || ICONES_EVENTO.event;
  const horario = item.startTime ? `${item.startTime}${item.endTime ? `–${item.endTime}` : ""}` : null;

  return (
    <article
      className={`contexto-card tipo-${item.type} prioridade-${item.priority || "medium"}` + (item.date ? "" : " fixo")}
      onDoubleClick={() => onEditar(item)}
    >
      <header className="contexto-topo">
        <span className="contexto-icone"><Icone size={14} /></span>
        <h3 className="contexto-titulo">{item.title}</h3>
        {item.date ? (
          <span className="contexto-data">
            {diaDaSemana(item.date)} {formatarDiaMes(item.date)}
          </span>
        ) : (
          <span className="contexto-data contexto-fixo">fixo</span>
        )}
      </header>

      {(horario || item.description) && (
        <p className="contexto-corpo">
          {horario && <span className="contexto-horario">{horario}</span>}
          {item.description}
        </p>
      )}

      <div className="contexto-acoes">
        <button type="button" className="acao-mini" aria-label={`Editar ${item.title}`} onClick={() => onEditar(item)}>
          <IconEdit size={13} />
        </button>
        <button type="button" className="acao-mini perigo" aria-label={`Remover ${item.title}`} onClick={() => onExcluir(item.id)}>
          <IconTrash size={13} />
        </button>
      </div>

      <span className="contexto-tipo">{ROTULO_TIPO[item.type] || "Evento"}</span>
    </article>
  );
}

/**
 * Camada de contexto — recebe apenas o que pertence à semana visível.
 * Nenhum texto de semana específica vive aqui.
 */
export default function WeekContext({ eventos, contextItems, onNovo, onEditar, onExcluir }) {
  const itens = [...eventos, ...contextItems];

  return (
    <section className="contexto" aria-label="Contexto da semana">
      <div className="secao-cabeca">
        <h2 className="secao-titulo">Contexto</h2>
        <span className="secao-linha" aria-hidden="true" />
        <button type="button" className="btn btn-ghost btn-mini" onClick={onNovo}>
          <IconPlus size={13} />Evento
        </button>
      </div>

      {itens.length ? (
        <div className="contexto-grade">
          {itens.map(item => (
            <CartaoContexto key={item.id} item={item} onEditar={onEditar} onExcluir={onExcluir} />
          ))}
        </div>
      ) : (
        <p className="vazio">Nenhum evento nesta semana.</p>
      )}
    </section>
  );
}
