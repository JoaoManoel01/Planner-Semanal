import { useRef } from "react";
import { IconCheck, IconEdit, IconTrash } from "../ui/Icon.jsx";

/**
 * Bloco da grade. Barra lateral = cor da categoria.
 * O título domina; o horário é metadado.
 */
export default function ActivityCard({
  bloco, cor, duracao, selecionado, arrastando, esmaecido, conflito,
  onSelecionar, onEditar, onExcluir, onAlternarFeito, onDragStart, onDragEnd, style
}) {
  /* Gesto iniciado sobre um controle não arrasta o bloco: sem isso, o menor
     tremor do mouse vira um drag e o clique no controle nunca acontece. */
  const gestoEmControle = useRef(false);

  const compacto = duracao <= 40;
  const minimo = duracao <= 20;

  const classes = [
    "atividade",
    compacto && "compacta",
    minimo && "minima",
    bloco.feito && "concluida",
    selecionado && "selecionada",
    arrastando && "arrastando",
    esmaecido && "esmaecida",
    conflito && "conflito"
  ].filter(Boolean).join(" ");

  return (
    <article
      className={classes}
      style={{ ...style, "--cor": cor }}
      draggable
      tabIndex={0}
      aria-label={`${bloco.rot}, ${bloco.ini} às ${bloco.fim}`}
      onPointerDown={e => { gestoEmControle.current = !!e.target.closest("button"); }}
      onPointerUp={() => { gestoEmControle.current = false; }}
      onDragStart={e => {
        if (gestoEmControle.current) { e.preventDefault(); return; }
        onDragStart(e);
      }}
      onDragEnd={e => { gestoEmControle.current = false; onDragEnd(e); }}
      onClick={e => { e.stopPropagation(); onSelecionar(); }}
      onDoubleClick={e => {
        if (e.target.closest("button")) return;
        onEditar();
      }}
      onKeyDown={e => {
        if (e.key === "Enter") { e.preventDefault(); onEditar(); }
      }}
    >
      <span className="atividade-barra" aria-hidden="true" />

      <button
        type="button"
        className={"atividade-marca" + (bloco.feito ? " marcada" : "")}
        aria-label={bloco.feito ? `Desmarcar ${bloco.rot}` : `Concluir ${bloco.rot}`}
        aria-pressed={bloco.feito}
        onClick={e => { e.stopPropagation(); onAlternarFeito(); }}
      >
        {bloco.feito && <IconCheck size={10} strokeWidth={2.4} />}
      </button>

      <div className="atividade-corpo">
        <h3 className="atividade-titulo">{bloco.rot}</h3>
        {!minimo && (
          <p className="atividade-horario">
            {bloco.ini} — {bloco.fim}
          </p>
        )}
        {!compacto && bloco.nota && <p className="atividade-nota">{bloco.nota}</p>}
      </div>

      <div className="atividade-acoes">
        <button
          type="button"
          className="acao-mini"
          aria-label={`Editar ${bloco.rot}`}
          onClick={e => { e.stopPropagation(); onEditar(); }}
        >
          <IconEdit size={13} />
        </button>
        <button
          type="button"
          className="acao-mini perigo"
          aria-label={`Excluir ${bloco.rot}`}
          onClick={e => { e.stopPropagation(); onExcluir(); }}
        >
          <IconTrash size={13} />
        </button>
      </div>
    </article>
  );
}
