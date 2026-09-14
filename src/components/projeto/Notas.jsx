import { useState } from "react";
import * as store from "../../store/projetos.js";
import { formatarDiaMes } from "../../domain/time.js";
import { IconPlus, IconTrash } from "../ui/Icon.jsx";

/**
 * Notas do projeto — texto puro, gravado enquanto você digita.
 *
 * Sem editor rico de propósito: contenteditable com barra de formatação é um
 * poço sem fundo, e o que essa zona precisa fazer é guardar o que você pensou.
 */
export default function Notas({ projeto }) {
  const notas = projeto.notas || [];
  const [abertaId, setAbertaId] = useState(notas[0]?.id || null);

  const aberta = notas.find(n => n.id === abertaId) || notas[0] || null;

  function criar() {
    setAbertaId(store.adicionarNota(projeto.id));
  }

  return (
    <section className="projeto-card">
      <header className="card-topo">
        <div>
          <h3>Notas</h3>
          <p className="card-contexto">
            {notas.length
              ? `${notas.length} ${notas.length === 1 ? "nota" : "notas"} · salvas automaticamente`
              : "Referências, ideias, o que precisar ficar registrado"}
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={criar}>
          <IconPlus />Nova nota
        </button>
      </header>

      {notas.length ? (
        <div className="notas">
          <ul className="notas-lista">
            {notas.map(nota => (
              <li key={nota.id}>
                <button
                  type="button"
                  className={"nota-item" + (nota.id === aberta?.id ? " is-ativa" : "")}
                  onClick={() => setAbertaId(nota.id)}
                >
                  <span className="nota-titulo">{nota.titulo || "Sem título"}</span>
                  <span className="nota-data">{formatarDiaMes(nota.atualizadoEm.slice(0, 10))}</span>
                </button>
              </li>
            ))}
          </ul>

          {aberta && (
            <div className="nota-editor">
              <div className="nota-editor-topo">
                <input
                  className="input nota-titulo-campo"
                  value={aberta.titulo}
                  aria-label="Título da nota"
                  placeholder="Título"
                  onChange={e => store.atualizarNota(projeto.id, aberta.id, { titulo: e.target.value })}
                />
                <button
                  type="button"
                  className="acao-mini perigo"
                  aria-label="Remover nota"
                  onClick={() => {
                    store.removerNota(projeto.id, aberta.id);
                    setAbertaId(null);
                  }}
                >
                  <IconTrash size={13} />
                </button>
              </div>

              <textarea
                className="input area nota-corpo"
                value={aberta.corpo}
                placeholder="Escreva aqui."
                aria-label="Conteúdo da nota"
                onChange={e => store.atualizarNota(projeto.id, aberta.id, { corpo: e.target.value })}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="estado-vazio">
          <p>Nenhuma nota neste projeto.</p>
          <button type="button" className="btn btn-ghost btn-mini" onClick={criar}>
            Criar a primeira
          </button>
        </div>
      )}
    </section>
  );
}
