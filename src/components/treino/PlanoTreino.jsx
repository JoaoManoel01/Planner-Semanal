import { useState } from "react";
import * as store from "../../store/treinos.js";
import { DIAS_SEMANA } from "../../domain/time.js";
import { GRUPOS, GRUPOS_POR_ID, cargaDoExercicio } from "../../domain/treinos.js";
import { IconPlus, IconTrash, IconCheck } from "../ui/Icon.jsx";
import { formatarCarga } from "./formato.js";

function alternarGrupo(ex, grupoId) {
  const grupos = ex.grupos || [];
  const tem = grupos.includes(grupoId);
  const proximo = tem ? grupos.filter(g => g !== grupoId) : [...grupos, grupoId];
  store.atualizarExercicio(ex.id, { grupos: proximo.length ? proximo : [grupoId] });
}

/** Linha fechada: o exercício lido como dado, não como formulário. */
function ExercicioResumo({ ex, onAbrir }) {
  const grupos = (ex.grupos || []).map(g => GRUPOS_POR_ID[g]?.nome).filter(Boolean);

  return (
    <button type="button" className="ex-resumo" onClick={onAbrir}>
      <span className="ex-resumo-nome">{ex.nome}</span>
      <span className="ex-resumo-numeros">
        {ex.cargaTotal ? <b>{formatarCarga(ex.cargaTotal)}<em>kg</em></b> : <b className="vago">—</b>}
        {ex.repsAlvo ? <span className="ex-reps">× {ex.repsAlvo}</span> : null}
      </span>
      <span className="ex-resumo-grupos">{grupos.join(" · ") || "sem grupo"}</span>
    </button>
  );
}

/** Linha aberta: edição completa, visível só por intenção. */
function ExercicioEditor({ ex, onFechar }) {
  return (
    <div className="ex-editor">
      <input
        className="input ex-nome"
        value={ex.nome}
        aria-label="Nome do exercício"
        autoFocus
        onChange={e => store.atualizarExercicio(ex.id, { nome: e.target.value })}
        onKeyDown={e => e.key === "Enter" && onFechar()}
      />

      <div className="ex-dupla">
        <label className="ex-campo">
          <span>Carga 100%</span>
          <div className="campo-unidade">
            <input
              className="input"
              type="number"
              min="0"
              step="0.5"
              value={ex.cargaTotal || ""}
              placeholder="0"
              onChange={e => store.atualizarExercicio(ex.id, { cargaTotal: Number(e.target.value) })}
            />
            <i>kg</i>
          </div>
        </label>

        <label className="ex-campo">
          <span>Reps alvo</span>
          <div className="campo-unidade">
            <input
              className="input"
              type="number"
              min="0"
              value={ex.repsAlvo || ""}
              placeholder="—"
              onChange={e => store.atualizarExercicio(ex.id, { repsAlvo: Number(e.target.value) })}
            />
            <i>reps</i>
          </div>
        </label>
      </div>

      <div className="ex-campo">
        <span>Grupos musculares</span>
        <div className="ex-grupos">
          {GRUPOS.map(g => {
            const ativo = (ex.grupos || []).includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                className={"grupo-chip" + (ativo ? " is-ativo" : "")}
                aria-pressed={ativo}
                onClick={() => alternarGrupo(ex, g.id)}
              >
                {g.nome}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ex-editor-acoes">
        <button
          type="button"
          className="btn btn-ghost btn-mini perigo"
          onClick={() => store.removerExercicio(ex.id)}
        >
          <IconTrash />Remover
        </button>
        <button type="button" className="btn btn-ghost btn-mini" onClick={onFechar}>
          <IconCheck />Pronto
        </button>
      </div>
    </div>
  );
}

export default function PlanoTreino({ estado, range, resumo, onDia }) {
  const [editando, setEditando] = useState(null);

  function adicionar(dia) {
    store.adicionarExercicio(dia);
    const lista = store.getPlanoDia(dia);
    setEditando(lista[lista.length - 1]?.id || null);
  }

  return (
    <div className="plano-treino">
      <div className="plano-grade">
        {range.dias.map(dia => {
          const exercicios = estado.plano[dia.index] || [];
          const prevista = exercicios.reduce((t, ex) => t + cargaDoExercicio(ex), 0);
          const feito = resumo.porDia[dia.index] > 0;

          return (
            <section
              key={dia.iso}
              className={
                "plano-dia" +
                (dia.hoje ? " is-hoje" : "") +
                (exercicios.length ? "" : " is-descanso")
              }
            >
              <header className="plano-dia-topo">
                <div className="plano-dia-identidade">
                  <h3>{DIAS_SEMANA[dia.index]}</h3>
                  <span className="plano-dia-data">{dia.diaMes}</span>
                  {dia.hoje && <span className="selo-hoje">hoje</span>}
                  {feito && <span className="selo-feito" title="Sessão registrada"><IconCheck size={12} /></span>}
                </div>

                <button
                  type="button"
                  className="acao-mini"
                  aria-label={`Adicionar exercício em ${DIAS_SEMANA[dia.index]}`}
                  onClick={() => adicionar(dia.index)}
                >
                  <IconPlus size={14} />
                </button>
              </header>

              {exercicios.length ? (
                <>
                  <ul className="plano-lista">
                    {exercicios.map(ex => (
                      <li key={ex.id} className={"exercicio-linha" + (editando === ex.id ? " is-aberta" : "")}>
                        {editando === ex.id ? (
                          <ExercicioEditor ex={ex} onFechar={() => setEditando(null)} />
                        ) : (
                          <ExercicioResumo ex={ex} onAbrir={() => setEditando(ex.id)} />
                        )}
                      </li>
                    ))}
                  </ul>

                  <footer className="plano-dia-rodape">
                    <span>{exercicios.length} exercício{exercicios.length > 1 ? "s" : ""}</span>
                    <span className="plano-dia-carga">{formatarCarga(prevista)}<em>kg previstos</em></span>
                    <button type="button" className="plano-dia-abrir" onClick={() => onDia(dia.iso)}>
                      Registrar
                    </button>
                  </footer>
                </>
              ) : (
                <button type="button" className="plano-vazio" onClick={() => adicionar(dia.index)}>
                  <IconPlus size={14} />
                  Dia de descanso — adicionar exercício
                </button>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
