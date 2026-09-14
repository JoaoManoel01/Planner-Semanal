import { useState } from "react";
import * as store from "../../store/treinos.js";
import { DIAS_SEMANA, DIAS_CURTOS } from "../../domain/time.js";
import { seriesDoExercicio, diaDaSemana, estimar1RM } from "../../domain/treinos.js";
import { IconCheck } from "../ui/Icon.jsx";
import { formatarCarga } from "./formato.js";

/** Seleção do dia dentro da semana já escolhida no cabeçalho. */
function FaixaDeDias({ range, diaISO, plano, resumo, onDia }) {
  return (
    <div className="dias-faixa" role="tablist" aria-label="Dias da semana">
      {range.dias.map(dia => {
        const planejado = (plano[dia.index] || []).length > 0;
        const registrado = resumo.porDia[dia.index] > 0;
        const ativo = dia.iso === diaISO;

        return (
          <button
            key={dia.iso}
            type="button"
            role="tab"
            aria-selected={ativo}
            className={
              "dia-item" +
              (ativo ? " is-ativa" : "") +
              (dia.hoje ? " is-hoje" : "") +
              (planejado ? " tem-plano" : "")
            }
            onClick={() => onDia(dia.iso)}
          >
            <span className="dia-curto">{DIAS_CURTOS[dia.index]}</span>
            <span className="dia-numero">{dia.diaMes.slice(0, 2)}</span>
            <span className={"dia-marca" + (registrado ? " is-feito" : "")} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function LinhaSessao({ ex, data, registro }) {
  const [peso, setPeso] = useState(registro?.pesoTopo ?? "");
  const [reps, setReps] = useState(registro?.repsTopo ?? "");
  const [falha, setFalha] = useState(!!registro?.chegouFalha);

  const series = seriesDoExercicio(ex);
  const registrado = !!registro;
  const rm = estimar1RM(peso || ex.cargaTotal, reps);

  function comitar(extra = {}) {
    const valores = { pesoTopo: peso, repsTopo: reps, chegouFalha: falha, ...extra };
    if (!Number(valores.pesoTopo) && !Number(valores.repsTopo)) return;
    store.salvarRegistro(data, { exercicioId: ex.id, ...valores });
  }

  return (
    <li className={"sessao-linha" + (registrado ? " is-registrada" : "")}>
      <div className="sessao-ex">
        <div className="sessao-ex-topo">
          <h4>{ex.nome}</h4>
          {registrado && (
            <span className="selo-registrado"><IconCheck size={12} />registrado</span>
          )}
        </div>

        <div className="serie-pills">
          {series.map(s => (
            <span key={s.rotulo} className={"serie-pill" + (s.tipo === "aquecimento" ? " aquecimento" : "")}>
              <i>{s.rotulo}</i>
              {formatarCarga(s.carga)}<em>kg</em>
            </span>
          ))}
        </div>
      </div>

      <div className="sessao-campos">
        <label className="ex-campo">
          <span>Peso executado</span>
          <div className="campo-unidade">
            <input
              className="input"
              type="number"
              min="0"
              step="0.5"
              value={peso}
              placeholder={String(ex.cargaTotal || "")}
              onChange={e => setPeso(e.target.value)}
              onBlur={() => comitar()}
            />
            <i>kg</i>
          </div>
        </label>

        <label className="ex-campo">
          <span>Reps</span>
          <div className="campo-unidade">
            <input
              className="input"
              type="number"
              min="0"
              value={reps}
              placeholder={ex.repsAlvo ? String(ex.repsAlvo) : "—"}
              onChange={e => setReps(e.target.value)}
              onBlur={() => comitar()}
            />
            <i>reps</i>
          </div>
        </label>

        <label className={"sessao-falha" + (falha ? " is-ativa" : "")}>
          <input
            type="checkbox"
            checked={falha}
            onChange={e => { setFalha(e.target.checked); comitar({ chegouFalha: e.target.checked }); }}
          />
          Até a falha
        </label>

        {Number(peso) > 0 && Number(reps) > 0 && (
          <span className="sessao-rm">1RM ≈ <b>{formatarCarga(rm)}<em>kg</em></b></span>
        )}
      </div>
    </li>
  );
}

export default function SessaoDia({ estado, range, diaISO, resumo, onDia, onVisao }) {
  const dia = diaDaSemana(diaISO);
  const exercicios = estado.plano[dia] || [];
  const sessao = store.getSessao(diaISO);
  const volume = resumo.porDia[dia] || 0;

  return (
    <div className="sessao-dia">
      <FaixaDeDias
        range={range}
        diaISO={diaISO}
        plano={estado.plano}
        resumo={resumo}
        onDia={onDia}
      />

      <div className="sessao-cabeca">
        <h3>{DIAS_SEMANA[dia]}</h3>
        {volume > 0 && (
          <span className="sessao-volume">{formatarCarga(volume)}<em>kg registrados</em></span>
        )}
      </div>

      {exercicios.length ? (
        <ul className="sessao-lista">
          {exercicios.map(ex => (
            <LinhaSessao
              key={`${diaISO}-${ex.id}`}
              ex={ex}
              data={diaISO}
              registro={sessao?.registros.find(r => r.exercicioId === ex.id)}
            />
          ))}
        </ul>
      ) : (
        <div className="estado-vazio">
          <p>Nenhum exercício planejado para {DIAS_SEMANA[dia].toLowerCase()}.</p>
          <button type="button" className="btn btn-ghost btn-mini" onClick={() => onVisao("plano")}>
            Montar o plano deste dia
          </button>
        </div>
      )}
    </div>
  );
}
