import { useState } from "react";
import * as store from "../../store/projetos.js";
import { colunasDo, cartoesDaColuna, progressoDoQuadro } from "../../domain/projetos.js";
import { formatarDiaMes, hojeISO, diasEntre } from "../../domain/time.js";
import { IconPlus, IconTrash } from "../ui/Icon.jsx";

/**
 * Quadro do projeto.
 *
 * O cartão pode apontar para um marco em vez de carregar data própria: assim
 * existe uma espinha só de prazos, e a tarefa herda o contexto da entrega sem
 * criar uma segunda lista de datas que diverge da primeira.
 */

function Cartao({ projeto, cartao, marcos, onArrastar, aberto, onAbrir }) {
  const marco = marcos.find(m => m.id === cartao.marcoId);
  const prazo = cartao.prazo || marco?.data || null;
  const dias = prazo ? diasEntre(hojeISO(), prazo) : null;

  return (
    <li
      className={"cartao" + (aberto ? " is-aberto" : "")}
      draggable={!aberto}
      onDragStart={e => {
        e.dataTransfer.setData("text/plain", cartao.id);
        e.dataTransfer.effectAllowed = "move";
        onArrastar(cartao.id);
      }}
      onDragEnd={() => onArrastar(null)}
    >
      {aberto ? (
        <div className="cartao-editor">
          <input
            className="input"
            value={cartao.titulo}
            aria-label="Título da tarefa"
            autoFocus
            onChange={e => store.atualizarCartao(projeto.id, cartao.id, { titulo: e.target.value })}
            onKeyDown={e => e.key === "Enter" && onAbrir(null)}
          />

          <textarea
            className="input area"
            value={cartao.detalhe}
            placeholder="Detalhe (opcional)"
            aria-label="Detalhe da tarefa"
            onChange={e => store.atualizarCartao(projeto.id, cartao.id, { detalhe: e.target.value })}
          />

          <label className="campo">
            <span>Vincular a um marco</span>
            <select
              className="input"
              value={cartao.marcoId || ""}
              onChange={e => store.atualizarCartao(projeto.id, cartao.id, { marcoId: e.target.value || null })}
            >
              <option value="">Nenhum</option>
              {marcos.map(m => (
                <option key={m.id} value={m.id}>{m.titulo} · {formatarDiaMes(m.data)}</option>
              ))}
            </select>
          </label>

          <label className="campo">
            <span>Ou uma data só desta tarefa</span>
            <input
              className="input"
              type="date"
              value={cartao.prazo || ""}
              onChange={e => store.atualizarCartao(projeto.id, cartao.id, { prazo: e.target.value || null })}
            />
          </label>

          <div className="cartao-acoes">
            <button
              type="button"
              className="btn btn-ghost btn-mini perigo"
              onClick={() => store.removerCartao(projeto.id, cartao.id)}
            >
              <IconTrash />Remover
            </button>
            <button type="button" className="btn btn-ghost btn-mini" onClick={() => onAbrir(null)}>
              Pronto
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="cartao-resumo" onClick={() => onAbrir(cartao.id)}>
          <span className="cartao-titulo">{cartao.titulo}</span>
          {cartao.detalhe && <span className="cartao-detalhe">{cartao.detalhe}</span>}
          {prazo && (
            <span className={"cartao-prazo" + (dias < 0 ? " is-atrasado" : "")}>
              {marco ? marco.titulo : formatarDiaMes(prazo)}
              <em>{dias < 0 ? `${Math.abs(dias)}d atrás` : dias === 0 ? "hoje" : `em ${dias}d`}</em>
            </span>
          )}
        </button>
      )}
    </li>
  );
}

export default function Quadro({ projeto }) {
  const [aberto, setAberto] = useState(null);
  const [arrastando, setArrastando] = useState(null);
  const [alvo, setAlvo] = useState(null);

  const colunas = colunasDo(projeto);
  const marcos = [...(projeto.marcos || [])].sort((a, b) => (a.data < b.data ? -1 : 1));
  const progresso = progressoDoQuadro(projeto);

  function soltar(colunaId) {
    if (arrastando) store.moverCartao(projeto.id, arrastando, colunaId);
    setArrastando(null);
    setAlvo(null);
  }

  return (
    <section className="projeto-card">
      <header className="card-topo">
        <div>
          <h3>Quadro</h3>
          <p className="card-contexto">
            {progresso.total
              ? `${progresso.feitos} de ${progresso.total} concluídas`
              : "Arraste os cartões entre as colunas"}
          </p>
        </div>
      </header>

      <div className="quadro">
        {colunas.map(coluna => {
          const cartoes = cartoesDaColuna(projeto, coluna.id);
          return (
            <div
              key={coluna.id}
              className={"quadro-coluna" + (alvo === coluna.id ? " is-alvo" : "")}
              onDragOver={e => { e.preventDefault(); setAlvo(coluna.id); }}
              onDragLeave={() => setAlvo(a => (a === coluna.id ? null : a))}
              onDrop={e => { e.preventDefault(); soltar(coluna.id); }}
            >
              <header className="coluna-topo">
                <h4>{coluna.nome}</h4>
                <span className="coluna-contagem">{cartoes.length}</span>
              </header>

              <ul className="coluna-lista">
                {cartoes.map(cartao => (
                  <Cartao
                    key={cartao.id}
                    projeto={projeto}
                    cartao={cartao}
                    marcos={marcos}
                    aberto={aberto === cartao.id}
                    onAbrir={setAberto}
                    onArrastar={setArrastando}
                  />
                ))}
              </ul>

              <button
                type="button"
                className="coluna-adicionar"
                onClick={() => setAberto(store.adicionarCartao(projeto.id, { colunaId: coluna.id }))}
              >
                <IconPlus size={13} />Adicionar
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
