import { useState } from "react";
import * as store from "../../store/projetos.js";
import { resumoDoProjeto, ESTADOS } from "../../domain/projetos.js";
import { formatarHoras, formatarDiaMes, hojeISO } from "../../domain/time.js";
import { formatarPercentual, direcao } from "../ui/numeros.js";
import Segmentado from "../ui/Segmentado.jsx";
import { IconPlus, IconTrash, IconCheck } from "../ui/Icon.jsx";
import CurvaInvestimento from "./CurvaInvestimento.jsx";
import Quadro from "./Quadro.jsx";
import Notas from "./Notas.jsx";

/* ── Faixa de status ─────────────────────────────────────────────── */

function StatusProjeto({ resumo }) {
  const variacao = formatarPercentual(resumo.variacao);

  return (
    <section className="status status-projeto" aria-label="Situação do projeto">
      <div className="status-principal">
        <span className="status-rotulo">Tempo investido</span>
        <div className="status-numero">
          <strong>{formatarHoras(resumo.totalMin)}</strong>
          <span>em {resumo.registros} {resumo.registros === 1 ? "registro" : "registros"}</span>
        </div>
      </div>

      <div className="status-metricas">
        <div className="status-metrica">
          <span className="metrica-rotulo">Esta semana</span>
          <span className="metrica-valor">
            {formatarHoras(resumo.semanaMin)}
            {variacao && variacao !== "estável" && (
              <i className={"metrica-delta dir-" + direcao(resumo.variacao)}>{variacao}</i>
            )}
          </span>
        </div>

        <div className="status-metrica">
          <span className="metrica-rotulo">Ritmo</span>
          <span className="metrica-valor">{formatarHoras(resumo.ritmoMin)} <em>/ semana</em></span>
        </div>

        <div className="status-metrica">
          <span className="metrica-rotulo">Próximo marco</span>
          <span className="metrica-valor">
            {resumo.proximo ? (
              <span className={resumo.proximo.atrasado ? "valor-atrasado" : ""}>
                {resumo.proximo.atrasado
                  ? `${Math.abs(resumo.proximo.dias)}d atrás`
                  : resumo.proximo.dias === 0 ? "hoje" : `${resumo.proximo.dias}d`}
              </span>
            ) : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── Marcos ──────────────────────────────────────────────────────── */

function Marcos({ projeto, resumo }) {
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState(hojeISO);

  const ordenados = [...(projeto.marcos || [])].sort((a, b) => (a.data < b.data ? -1 : 1));

  function adicionar(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    store.adicionarMarco(projeto.id, { titulo, data });
    setTitulo("");
  }

  return (
    <section className="projeto-card">
      <header className="card-topo">
        <div>
          <h3>Marcos</h3>
          <p className="card-contexto">
            {resumo.marcosTotal
              ? `${resumo.marcosFeitos} de ${resumo.marcosTotal} concluídos`
              : "Datas fixas do projeto — entregas, bancas, submissões"}
          </p>
        </div>
      </header>

      <form className="linha-form" onSubmit={adicionar}>
        <label className="campo">
          <span>Marco</span>
          <input
            className="input"
            value={titulo}
            placeholder="ex.: entrega do relatório parcial"
            onChange={e => setTitulo(e.target.value)}
          />
        </label>
        <label className="campo campo-data">
          <span>Data</span>
          <input className="input" type="date" value={data} onChange={e => setData(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-ghost"><IconPlus />Adicionar</button>
      </form>

      {ordenados.length ? (
        <ul className="marcos-lista">
          {ordenados.map(marco => {
            const dias = resumo.proximo?.id === marco.id ? resumo.proximo.dias : null;
            return (
              <li key={marco.id} className={"marco-item" + (marco.concluido ? " is-feito" : "")}>
                <button
                  type="button"
                  className={"marco-caixa" + (marco.concluido ? " is-marcada" : "")}
                  aria-label={marco.concluido ? "Reabrir marco" : "Concluir marco"}
                  onClick={() => store.alternarMarco(projeto.id, marco.id)}
                >
                  {marco.concluido && <IconCheck size={12} />}
                </button>

                <span className="marco-titulo">{marco.titulo}</span>
                <span className="marco-data">{formatarDiaMes(marco.data)}</span>
                {dias != null && !marco.concluido && (
                  <span className={"marco-prazo" + (dias < 0 ? " is-atrasado" : "")}>
                    {dias < 0 ? `${Math.abs(dias)}d atrás` : dias === 0 ? "hoje" : `em ${dias}d`}
                  </span>
                )}

                <button
                  type="button"
                  className="acao-mini perigo"
                  aria-label={`Remover marco ${marco.titulo}`}
                  onClick={() => store.removerMarco(projeto.id, marco.id)}
                >
                  <IconTrash size={12} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="vazio">Nenhum marco definido.</p>
      )}
    </section>
  );
}

/* ── Registros de trabalho ───────────────────────────────────────── */

function Registros({ projeto }) {
  const [data, setData] = useState(hojeISO);
  const [horas, setHoras] = useState("");
  const [nota, setNota] = useState("");

  const recentes = [...(projeto.registros || [])]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .slice(0, 12);

  function registrar(e) {
    e.preventDefault();
    const minutos = Math.round((Number(horas) || 0) * 60);
    if (minutos <= 0) return;
    store.registrarTrabalho(projeto.id, { data, minutos, nota });
    setHoras("");
    setNota("");
  }

  return (
    <section className="projeto-card">
      <header className="card-topo">
        <div>
          <h3>Registros</h3>
          <p className="card-contexto">O que você fez e quanto tempo levou — é isso que alimenta a curva</p>
        </div>
      </header>

      <form className="linha-form" onSubmit={registrar}>
        <label className="campo campo-data">
          <span>Data</span>
          <input className="input" type="date" value={data} onChange={e => setData(e.target.value)} />
        </label>

        <label className="campo campo-tempo">
          <span>Tempo</span>
          <div className="campo-unidade">
            <input
              className="input"
              type="number"
              min="0"
              step="0.25"
              value={horas}
              placeholder="1,5"
              onChange={e => setHoras(e.target.value)}
            />
            <i>h</i>
          </div>
        </label>

        <label className="campo">
          <span>O que avançou</span>
          <input
            className="input"
            value={nota}
            placeholder="ex.: revisão da metodologia"
            onChange={e => setNota(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary"><IconPlus />Registrar</button>
      </form>

      {recentes.length ? (
        <ul className="registros-lista">
          {recentes.map(reg => (
            <li key={reg.id} className="registro-item">
              <span className="registro-data">{formatarDiaMes(reg.data)}</span>
              <span className="registro-tempo">{formatarHoras(reg.minutos)}</span>
              <span className="registro-nota">{reg.nota || <em>sem anotação</em>}</span>
              <button
                type="button"
                className="acao-mini perigo"
                aria-label="Remover registro"
                onClick={() => store.removerRegistro(projeto.id, reg.id)}
              >
                <IconTrash size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="vazio">Nenhum registro ainda.</p>
      )}
    </section>
  );
}

/* ── Workspace ───────────────────────────────────────────────────── */

const VISOES = [
  { id: "geral", nome: "Visão geral" },
  { id: "quadro", nome: "Quadro" },
  { id: "notas", nome: "Notas" }
];

export default function ProjetoWorkspace({ projeto }) {
  const [visao, setVisao] = useState("geral");
  const resumo = resumoDoProjeto(projeto);

  return (
    <>
      <StatusProjeto resumo={resumo} />

      <Segmentado itens={VISOES} valor={visao} onMudar={setVisao} rotulo="Seções do projeto" />

      {visao === "quadro" && <Quadro projeto={projeto} />}
      {visao === "notas" && <Notas projeto={projeto} />}
      {visao === "geral" && <VisaoGeral projeto={projeto} resumo={resumo} />}
    </>
  );
}

function VisaoGeral({ projeto, resumo }) {
  return (
    <>

      <section className="projeto-card">
        <header className="card-topo">
          <div>
            <h3>Curva de investimento</h3>
            <p className="card-contexto">
              {resumo.diasParado != null && resumo.diasParado > 7
                ? `Último registro há ${resumo.diasParado} dias`
                : "Ritmo semanal e total acumulado"}
            </p>
          </div>

          <Segmentado
            itens={ESTADOS}
            valor={projeto.estado}
            onMudar={estado => store.atualizarProjeto(projeto.id, { estado })}
            rotulo="Estado do projeto"
            tom="discreto"
          />
        </header>

        {resumo.serie.length ? (
          <CurvaInvestimento serie={resumo.serie} />
        ) : (
          <div className="estado-vazio">
            <p>Registre a primeira sessão de trabalho para a curva começar.</p>
            <span className="dica">
              As barras mostram o ritmo de cada semana; a linha, o total acumulado.
            </span>
          </div>
        )}
      </section>

      <Marcos projeto={projeto} resumo={resumo} />
      <Registros projeto={projeto} />
    </>
  );
}
