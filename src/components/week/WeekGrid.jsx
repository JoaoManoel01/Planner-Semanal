import { Fragment, useLayoutEffect, useRef, useState } from "react";
import * as store from "../../agenda.js";
import { toHHMM, toMin, getCurrentTimePosition } from "../../domain/time.js";
import { IconPlus } from "../ui/Icon.jsx";
import { pedirConfirmacao, avisar } from "../ui/avisos.js";
import ActivityCard from "./ActivityCard.jsx";

const DENSIDADES = {
  compacto: { linha: 8, rail: 54 },
  normal: { linha: 10, rail: 62 },
  amplo: { linha: 13, rail: 70 }
};

/**
 * Camada 1 — a agenda. Núcleo visual da aplicação.
 * Recebe dados já normalizados; não calcula regra de negócio.
 */
export default function WeekGrid({
  range, dias, categorias, densidade, filtro, conflitos,
  selecionado, onSelecionar, onEditar, onAdicionar, agora
}) {
  const ref = useRef(null);
  const [indicador, setIndicador] = useState(null);
  const [arrastando, setArrastando] = useState(null);
  const [linhaAgora, setLinhaAgora] = useState(null);

  const { linha: alturaLinha, rail } = DENSIDADES[densidade] || DENSIDADES.normal;
  const idsEmConflito = new Set(conflitos.flatMap(c => [c.a.id, c.b.id]));

  const horas = [];
  for (let t = store.BASE; t < store.TOPO; t += 60) horas.push(t);

  const meias = [];
  for (let t = store.BASE + 30; t < store.TOPO; t += 60) meias.push(t);

  function corDe(catId) {
    return categorias.find(c => c.id === catId)?.cor || "var(--color-text-muted)";
  }

  /* ── geometria ─────────────────────────────────────── */

  function mapearTempo() {
    const riscas = ref.current?.querySelectorAll("[data-risca]");
    if (!riscas || riscas.length < 2) return null;
    const r0 = riscas[0].getBoundingClientRect().top;
    const r1 = riscas[1].getBoundingClientRect().top;
    return { r0, pxPorPasso: (r1 - r0) / (60 / store.PASSO) };
  }

  function colunaPeloX(x) {
    const cabs = ref.current?.querySelectorAll("[data-dia]");
    if (!cabs) return null;
    for (const cab of cabs) {
      const r = cab.getBoundingClientRect();
      if (x >= r.left && x <= r.right) return Number(cab.dataset.dia);
    }
    return null;
  }

  function retanguloColuna(indice) {
    const cabs = ref.current?.querySelectorAll("[data-dia]");
    const cab = cabs?.[indice];
    if (!cab) return null;
    const r = cab.getBoundingClientRect();
    const base = ref.current.getBoundingClientRect();
    return { left: r.left - base.left, width: r.width, topoGrade: base.top };
  }

  function inicioPeloY(y, duracao, passo, m) {
    const pxPorMin = m.pxPorPasso / store.PASSO;
    const minutosRelativos = (y - m.r0) / pxPorMin;
    const inicio = store.BASE + Math.round(minutosRelativos / passo) * passo;
    return Math.max(store.BASE, Math.min(inicio, store.TOPO - duracao));
  }

  /* ── indicador de horário atual ────────────────────── */

  useLayoutEffect(() => {
    const posicao = getCurrentTimePosition(range, store.BASE, store.TOPO, agora);
    if (!posicao) { setLinhaAgora(null); return; }

    const m = mapearTempo();
    const coluna = retanguloColuna(posicao.diaIndex);
    if (!m || !coluna) { setLinhaAgora(null); return; }

    setLinhaAgora({
      left: coluna.left,
      width: coluna.width,
      top: m.r0 - coluna.topoGrade + ((posicao.minutos - store.BASE) / store.PASSO) * m.pxPorPasso,
      hhmm: posicao.hhmm
    });
  }, [range, agora, densidade, dias]);

  /* ── drag and drop ─────────────────────────────────── */

  function aoIniciarArrasto(e, bloco) {
    e.dataTransfer.setData("text/plain", bloco.id);
    e.dataTransfer.effectAllowed = "move";
    setArrastando(bloco.id);
  }

  function limparArrasto() {
    setArrastando(null);
    setIndicador(null);
  }

  function posicaoDeSolta(e) {
    const id = arrastando || e.dataTransfer.getData("text/plain");
    if (!id) return null;
    const loc = store.localizarBloco(id);
    const m = mapearTempo();
    const diaIdx = colunaPeloX(e.clientX);
    if (!loc || !m || diaIdx == null) return null;

    const duracao = toMin(loc.bloco.fim) - toMin(loc.bloco.ini);
    const inicio = inicioPeloY(e.clientY, duracao, store.passoDeSnap(loc.bloco), m);
    return { id, loc, m, diaIdx, duracao, inicio };
  }

  function aoPassarSobre(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const p = posicaoDeSolta(e);
    if (!p) return;

    const coluna = retanguloColuna(p.diaIdx);
    if (!coluna) return;
    const conflito = store.blocosSobrepostos(p.diaIdx, p.inicio, p.inicio + p.duracao, p.id).length > 0;

    setIndicador({
      left: coluna.left,
      width: coluna.width,
      top: p.m.r0 - coluna.topoGrade + ((p.inicio - store.BASE) / store.PASSO) * p.m.pxPorPasso,
      height: (p.duracao / store.PASSO) * p.m.pxPorPasso,
      rotulo: `${range.dias[p.diaIdx].curto} · ${toHHMM(p.inicio)} — ${toHHMM(p.inicio + p.duracao)}`,
      conflito
    });
  }

  async function aoSoltar(e) {
    e.preventDefault();
    const p = posicaoDeSolta(e);
    limparArrasto();
    if (!p) return;

    const conflitantes = store.blocosSobrepostos(p.diaIdx, p.inicio, p.inicio + p.duracao, p.id);
    if (conflitantes.length) {
      const seguir = await pedirConfirmacao({
        titulo: "Esse horário já está ocupado",
        corpo: `"${conflitantes[0].rot}" (${conflitantes[0].ini}–${conflitantes[0].fim}) ocupa ${range.dias[p.diaIdx].nome.toLowerCase()} nesse intervalo.`,
        acao: "Mover assim mesmo",
        cancelar: "Deixar onde está"
      });
      if (!seguir) return;
    }

    store.moverBloco(p.id, p.diaIdx, p.inicio);
  }

  return (
    <main className="quadro" onClick={() => onSelecionar(null)}>
      <div
        ref={ref}
        className="grade"
        onDragOver={aoPassarSobre}
        onDragLeave={e => { if (!ref.current?.contains(e.relatedTarget)) setIndicador(null); }}
        onDrop={aoSoltar}
        style={{
          gridTemplateColumns: `${rail}px repeat(7, minmax(96px, 1fr))`,
          gridTemplateRows: `auto repeat(${store.LINHAS}, ${alturaLinha}px)`
        }}
      >
        <div className="grade-canto" />

        {range.dias.map(dia => (
          <div
            key={dia.iso}
            data-dia={dia.index}
            className={"coluna-cabeca" + (dia.fimDeSemana ? " fim-de-semana" : "") + (dia.hoje ? " hoje" : "")}
          >
            <span className="coluna-nome">{dia.nome}</span>
            <span className="coluna-data">{dia.diaMes}</span>
            {dia.hoje && <span className="coluna-marca" aria-hidden="true" />}
            <button
              type="button"
              className="coluna-add"
              aria-label={`Nova atividade em ${dia.nome}`}
              onClick={e => { e.stopPropagation(); onAdicionar(dia.index); }}
            >
              <IconPlus size={12} />
            </button>
          </div>
        ))}

        {range.dias.map(dia => (
          <div
            key={"fundo-" + dia.iso}
            className={"coluna-fundo" + (dia.fimDeSemana ? " fim-de-semana" : "") + (dia.hoje ? " hoje" : "")}
            style={{ gridColumn: dia.index + 2, gridRow: `2 / span ${store.LINHAS}` }}
          />
        ))}

        {horas.map(t => (
          <Fragment key={"h" + t}>
            <div className="hora" style={{ gridRow: store.linhaDe(toHHMM(t)) }}>
              {String(Math.floor(t / 60)).padStart(2, "0")}<span className="hora-sep">:</span>00
            </div>
            <div className="risca" data-risca style={{ gridRow: store.linhaDe(toHHMM(t)) }} />
          </Fragment>
        ))}

        {meias.map(t => (
          <div key={"m" + t} className="risca meia" style={{ gridRow: store.linhaDe(toHHMM(t)) }} />
        ))}

        {dias.map((dia, i) =>
          dia.blocos.map(bloco => (
            <ActivityCard
              key={bloco.id}
              bloco={bloco}
              cor={corDe(bloco.cat)}
              duracao={toMin(bloco.fim) - toMin(bloco.ini)}
              selecionado={selecionado === bloco.id}
              arrastando={arrastando === bloco.id}
              esmaecido={filtro.size > 0 && !filtro.has(bloco.cat)}
              conflito={idsEmConflito.has(bloco.id)}
              style={{
                gridColumn: i + 2,
                gridRow: `${store.linhaDe(bloco.ini)} / ${store.linhaDe(bloco.fim)}`
              }}
              onSelecionar={() => onSelecionar(bloco.id)}
              onEditar={() => onEditar(i, bloco.id)}
              onExcluir={() => {
                const removido = store.excluirBloco(bloco.id);
                if (removido) {
                  avisar('"' + removido.bloco.rot + '" excluída', {
                    desfazer: () => store.restaurarBloco(removido.diaIdx, removido.bloco)
                  });
                }
              }}
              onAlternarFeito={() => store.alternarFeito(bloco.id)}
              onDragStart={e => aoIniciarArrasto(e, bloco)}
              onDragEnd={limparArrasto}
            />
          ))
        )}

        {indicador && (
          <div
            className={"alvo-solta" + (indicador.conflito ? " conflito" : "")}
            style={{
              left: indicador.left,
              top: indicador.top,
              width: indicador.width,
              height: indicador.height
            }}
          >
            <span className="alvo-rotulo">{indicador.rotulo}</span>
          </div>
        )}

        {linhaAgora && (
          <div
            className="agora"
            style={{ left: linhaAgora.left, top: linhaAgora.top, width: linhaAgora.width }}
          >
            <span className="agora-ponto" />
            <span className="agora-hora">{linhaAgora.hhmm}</span>
          </div>
        )}
      </div>
    </main>
  );
}
