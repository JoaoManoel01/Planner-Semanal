/**
 * Application layer — estado, ações e persistência.
 *
 * A UI fala apenas com este módulo (ações) e com src/domain (cálculos).
 * Nenhum componente lê ou escreve no armazenamento diretamente.
 */
import {
  toMin, toHHMM, formatarHoras,
  getWeekStartISO, deslocarISO, hojeISO, dataParaISO,
  getWeekRange, DIAS_SEMANA
} from "./domain/time.js";

const CHAVE = "orbit:agenda:v4";
const CHAVES_LEGADAS = ["agenda-semanal:v3", "agenda-semanal:v2"];

export const FAIXA = { ini: "08:00", fim: "24:00" };
export const PASSO = 10;
const SNAP_PADRAO = 30;
const SNAP_REUNIAO = PASSO;

export const BASE = toMin(FAIXA.ini);
export const TOPO = toMin(FAIXA.fim);
export const LINHAS = (TOPO - BASE) / PASSO;
export const linhaDe = hhmm => Math.round((toMin(hhmm) - BASE) / PASSO) + 2;

const PALETA = [
  "var(--category-stage)", "var(--category-classes)", "var(--category-english)",
  "var(--category-gym)", "var(--category-event)", "var(--category-flexible)",
  "var(--category-pibic)", "var(--category-time)"
];

const CATEGORIAS_PADRAO = [
  { id: "estagio", nome: "Estágio", cor: "var(--category-stage)" },
  { id: "aula", nome: "Aulas", cor: "var(--category-classes)" },
  { id: "ingles", nome: "Inglês", cor: "var(--category-english)" },
  { id: "academia", nome: "Academia", cor: "var(--category-gym)" },
  { id: "evento", nome: "Evento", cor: "var(--category-event)" },
  { id: "flex", nome: "Flexível", cor: "var(--category-flexible)" },
  { id: "pibic", nome: "PIBIC", cor: "var(--category-pibic)" },
  { id: "reuniao", nome: "Reunião", cor: "var(--category-time)" }
];

/* Cores herdadas em hex são remapeadas para os tokens do brandkit. */
const HEX_PARA_TOKEN = {
  "#37c98b": "var(--category-stage)",
  "#5b8def": "var(--category-classes)",
  "#d56bae": "var(--category-english)",
  "#a978f4": "var(--category-gym)",
  "#65c98a": "var(--category-event)",
  "#87939a": "var(--category-flexible)",
  "#28bfd0": "var(--category-pibic)",
  "#55c7e8": "var(--category-time)"
};

const gerarId = p => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ── Semente ───────────────────────────────────────────── */

const SEMENTE_BLOCOS = [
  [ // segunda
    ["estagio", "Estágio", "08:00", "12:00"],
    ["aula", "Aulas", "13:00", "16:00"],
    ["academia", "Academia", "19:30", "21:00"],
    ["ingles", "Inglês · curto", "21:20", "22:30"]
  ],
  [
    ["estagio", "Estágio", "08:40", "12:40"],
    ["flex", "Academia ou projetos", "13:00", "16:00"],
    ["ingles", "Inglês · longo", "19:00", "20:30"]
  ],
  [
    ["estagio", "Estágio", "08:00", "12:00"],
    ["aula", "Aulas", "13:00", "16:00"],
    ["academia", "Academia", "19:30", "21:00"],
    ["ingles", "Inglês · longo", "21:20", "22:50"]
  ],
  [
    ["evento", "CONIC", "08:00", "18:00", "sem estágio nem aula"],
    ["academia", "Academia", "20:30", "22:00"],
    ["ingles", "Inglês · curto", "22:15", "23:25"]
  ],
  [
    ["estagio", "Estágio", "08:40", "12:40"],
    ["aula", "Aulas", "15:30", "17:00"],
    ["academia", "Academia", "20:30", "22:00"],
    ["ingles", "Inglês · curto", "22:15", "23:25"]
  ],
  [["ingles", "Inglês · longo", "10:00", "11:30"]],
  [["ingles", "Anki · 10 min", "20:00", "20:20"]]
];

function diasVazios() {
  return DIAS_SEMANA.map((nome, i) => ({ nome, folga: i >= 5, blocos: [] }));
}

function diasDaSemente() {
  return DIAS_SEMANA.map((nome, i) => ({
    nome,
    folga: i >= 5,
    blocos: (SEMENTE_BLOCOS[i] || []).map(([cat, rot, ini, fim, nota]) => ({
      id: gerarId("bl"), cat, rot, ini, fim, nota: nota || "", feito: false, flexivel: cat === "flex"
    }))
  }));
}

function estadoInicial() {
  const semanaAtual = "2026-09-14";
  return {
    versao: 4,
    categorias: CATEGORIAS_PADRAO.map(c => ({ ...c })),
    semanas: { [semanaAtual]: { dias: diasDaSemente() } },
    /* TemporalEvent[] — date === null significa contexto fixo (sem data). */
    eventos: [
      {
        id: gerarId("ev"),
        title: "CONIC",
        date: deslocarISO(semanaAtual, 3),
        startTime: "08:00",
        endTime: "18:00",
        description: "Dia inteiro fora: sem estágio nem aula.",
        type: "event",
        priority: "high"
      },
      {
        id: gerarId("ev"),
        title: "Santander Fala Mundo",
        date: deslocarISO(semanaAtual, 4),
        description: "Resultado sai na sexta. Se vier, o bloco de produção migra para a Immerse.",
        type: "deadline",
        priority: "high"
      },
      {
        id: gerarId("ev"),
        title: "Rotina diária",
        date: null,
        description: "Em pé às 6:00. Saída às 7:00 (seg e qua) e às 7:30 (ter, qui e sex).",
        type: "reminder",
        priority: "low"
      }
    ],
    semanaAtual
  };
}

/* ── Migração ──────────────────────────────────────────── */

function normalizarCategorias(categorias) {
  const lista = (categorias || []).map(c => ({
    ...c,
    cor: HEX_PARA_TOKEN[String(c.cor).toLowerCase()] || c.cor
  }));
  for (const padrao of CATEGORIAS_PADRAO) {
    if (!lista.some(c => c.id === padrao.id)) lista.push({ ...padrao });
  }
  return lista;
}

/** "18/09" + semana de referência -> ISO dentro dessa semana, quando possível. */
function resolverDataLegada(ddmm, semanaRef) {
  if (!ddmm || !/^\d{2}\/\d{2}$/.test(ddmm)) return null;
  const [dd, mm] = ddmm.split("/").map(Number);
  const range = getWeekRange(semanaRef);
  const naSemana = range.dias.find(d => d.diaMes === ddmm);
  if (naSemana) return naSemana.iso;
  const ano = Number(String(semanaRef).slice(0, 4)) || new Date().getFullYear();
  return dataParaISO(new Date(ano, mm - 1, dd));
}

function migrarLegado(obj) {
  if (!obj) return null;

  const semanas = obj.semanas
    || (Array.isArray(obj.dias) ? { [getWeekStartISO(new Date())]: { dias: obj.dias } } : null);
  if (!semanas || !Array.isArray(obj.categorias)) return null;

  const semanaAtual = obj.semanaAtual && semanas[obj.semanaAtual]
    ? obj.semanaAtual
    : Object.keys(semanas)[0];

  /* lembretes/notas hardcoded viram eventos temporais com data real */
  const eventos = [];
  for (const l of obj.lembretes || []) {
    const date = resolverDataLegada(l.data, semanaAtual);
    eventos.push({
      id: gerarId("ev"),
      title: l.titulo,
      date,
      description: l.texto || "",
      type: date ? "deadline" : "reminder",
      priority: date ? "high" : "low"
    });
  }

  const limpas = {};
  for (const [chave, valor] of Object.entries(semanas)) {
    limpas[chave] = { dias: (valor.dias || diasVazios()).map(d => ({ ...d, blocos: d.blocos || [] })) };
  }

  return {
    versao: 4,
    categorias: normalizarCategorias(obj.categorias),
    semanas: limpas,
    eventos,
    semanaAtual
  };
}

function carregar() {
  try {
    const atual = JSON.parse(localStorage.getItem(CHAVE));
    if (atual?.semanas && atual?.semanaAtual) {
      atual.categorias = normalizarCategorias(atual.categorias);
      atual.eventos = Array.isArray(atual.eventos) ? atual.eventos : [];
      if (!atual.semanas[atual.semanaAtual]) {
        atual.semanas[atual.semanaAtual] = { dias: diasVazios() };
      }
      return atual;
    }
  } catch { /* estado corrompido: cai para o legado */ }

  for (const chave of CHAVES_LEGADAS) {
    try {
      const migrado = migrarLegado(JSON.parse(localStorage.getItem(chave)));
      if (migrado) return migrado;
    } catch { /* ignora formato inválido */ }
  }

  return estadoInicial();
}

/* ── Store ─────────────────────────────────────────────── */

let ESTADO = carregar();
const ouvintes = new Set();

function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(ESTADO)); } catch { /* cota cheia */ }
}

function confirmar() {
  salvar();
  ouvintes.forEach(fn => fn());
}

export function assinar(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export function getEstado() {
  return ESTADO;
}

function semanaAtiva() {
  if (!ESTADO.semanas[ESTADO.semanaAtual]) {
    ESTADO.semanas[ESTADO.semanaAtual] = { dias: diasVazios() };
  }
  return ESTADO.semanas[ESTADO.semanaAtual];
}

export function getDias() {
  return semanaAtiva().dias;
}

export function categoria(id) {
  return ESTADO.categorias.find(c => c.id === id);
}

export function todosBlocos() {
  return getDias().flatMap(d => d.blocos);
}

export function localizarBloco(id) {
  const dias = getDias();
  for (let i = 0; i < dias.length; i++) {
    const bloco = dias[i].blocos.find(b => b.id === id);
    if (bloco) return { diaIdx: i, bloco };
  }
  return null;
}

function removerBloco(id) {
  const dias = getDias();
  for (let d = 0; d < dias.length; d++) {
    const i = dias[d].blocos.findIndex(b => b.id === id);
    if (i >= 0) return { diaIdx: d, bloco: dias[d].blocos.splice(i, 1)[0] };
  }
  return null;
}

export function blocosSobrepostos(diaIdx, inicio, fim, ignorarId) {
  return getDias()[diaIdx].blocos.filter(
    b => b.id !== ignorarId && toMin(b.ini) < fim && toMin(b.fim) > inicio
  );
}

export function passoDeSnap(bloco) {
  const alvo = `${categoria(bloco.cat)?.nome || ""} ${bloco.cat || ""}`.toLowerCase();
  return alvo.includes("reuni") ? SNAP_REUNIAO : SNAP_PADRAO;
}

function normalizarHorario(ini, fim) {
  const iniM = Math.max(BASE, Math.min(toMin(ini), TOPO - PASSO));
  const fimM = Math.max(iniM + PASSO, Math.min(toMin(fim), TOPO));
  return [toHHMM(iniM), toHHMM(fimM)];
}

/* ── Ações: atividades ─────────────────────────────────── */

export function salvarBloco({ id, diaIdx, cat, rot, ini, fim, nota, flexivel }) {
  const [iniN, fimN] = normalizarHorario(ini, fim);
  const dados = { cat, rot, ini: iniN, fim: fimN, nota: nota || "", flexivel: !!flexivel };

  if (id) {
    const loc = localizarBloco(id);
    if (!loc) return;
    Object.assign(loc.bloco, dados);
    if (loc.diaIdx !== diaIdx) {
      removerBloco(id);
      getDias()[diaIdx].blocos.push(loc.bloco);
    }
  } else {
    getDias()[diaIdx].blocos.push({ ...dados, id: gerarId("bl"), feito: false });
  }
  confirmar();
}

/** @returns {{diaIdx:number, bloco:object}|null} o que saiu, para permitir desfazer */
export function excluirBloco(id) {
  const removido = removerBloco(id);
  if (removido) confirmar();
  return removido;
}

export function restaurarBloco(diaIdx, bloco) {
  if (!bloco || !getDias()[diaIdx]) return;
  getDias()[diaIdx].blocos.push(bloco);
  confirmar();
}

export function alternarFeito(id) {
  const loc = localizarBloco(id);
  if (!loc) return;
  loc.bloco.feito = !loc.bloco.feito;
  confirmar();
}

export function moverBloco(id, diaIdx, inicio) {
  const loc = localizarBloco(id);
  if (!loc) return;
  const duracao = toMin(loc.bloco.fim) - toMin(loc.bloco.ini);
  const inicioN = Math.max(BASE, Math.min(inicio, TOPO - duracao));
  removerBloco(id);
  loc.bloco.ini = toHHMM(inicioN);
  loc.bloco.fim = toHHMM(inicioN + duracao);
  getDias()[diaIdx].blocos.push(loc.bloco);
  confirmar();
}

export function duplicarBloco(id) {
  const loc = localizarBloco(id);
  if (!loc) return;
  getDias()[loc.diaIdx].blocos.push({ ...loc.bloco, id: gerarId("bl"), feito: false });
  confirmar();
}

/* ── Ações: eventos temporais ──────────────────────────── */

export function salvarEvento({ id, title, date, startTime, endTime, description, type, priority }) {
  const dados = {
    title: title.trim(),
    date: date || null,
    startTime: startTime || "",
    endTime: endTime || "",
    description: (description || "").trim(),
    type: type || "event",
    priority: priority || "medium"
  };
  const existente = ESTADO.eventos.find(e => e.id === id);
  if (existente) Object.assign(existente, dados);
  else ESTADO.eventos.push({ id: gerarId("ev"), ...dados });
  confirmar();
}

export function excluirEvento(id) {
  const i = ESTADO.eventos.findIndex(e => e.id === id);
  if (i >= 0) { ESTADO.eventos.splice(i, 1); confirmar(); }
}

/* ── Ações: navegação ──────────────────────────────────── */

export function navegarParaKey(novaKey) {
  const chave = getWeekStartISO(novaKey);
  if (chave === ESTADO.semanaAtual) return;
  if (!ESTADO.semanas[chave]) ESTADO.semanas[chave] = { dias: diasVazios() };
  ESTADO.semanaAtual = chave;
  confirmar();
}

export function navegarSemana(offset) {
  navegarParaKey(deslocarISO(ESTADO.semanaAtual, offset * 7));
}

export function irParaHoje() {
  navegarParaKey(getWeekStartISO(hojeISO()));
}

/** Copia a estrutura de atividades de uma semana para a semana atual. */
export function copiarSemana(origemKey) {
  const origem = ESTADO.semanas[origemKey];
  if (!origem) return;
  semanaAtiva().dias = origem.dias.map(d => ({
    ...d,
    blocos: d.blocos.map(b => ({ ...b, id: gerarId("bl"), feito: false }))
  }));
  confirmar();
}

export function semanasComDados() {
  return Object.entries(ESTADO.semanas)
    .filter(([chave, s]) => chave !== ESTADO.semanaAtual && s.dias.some(d => d.blocos.length))
    .map(([chave]) => chave)
    .sort();
}

/* ── Ações: categorias ─────────────────────────────────── */

export function adicionarCategoria() {
  ESTADO.categorias.push({
    id: gerarId("cat"),
    nome: "Nova categoria",
    cor: PALETA[ESTADO.categorias.length % PALETA.length]
  });
  confirmar();
}

export function atualizarCategoria(id, patch) {
  const c = categoria(id);
  if (!c) return;
  Object.assign(c, patch);
  confirmar();
}

export function removerCategoria(id) {
  const emUso = Object.values(ESTADO.semanas)
    .some(s => s.dias.some(d => d.blocos.some(b => b.cat === id)));
  if (emUso || ESTADO.categorias.length <= 1) return;
  ESTADO.categorias = ESTADO.categorias.filter(c => c.id !== id);
  confirmar();
}

export function categoriaEmUso(id) {
  return Object.values(ESTADO.semanas)
    .some(s => s.dias.some(d => d.blocos.some(b => b.cat === id)));
}

/* ── Dados ─────────────────────────────────────────────── */

export function exportarJSON() {
  return JSON.stringify(ESTADO, null, 2);
}

export function importarJSON(texto) {
  const obj = JSON.parse(texto);
  const estado = obj?.versao === 4 && obj.semanas ? obj : migrarLegado(obj);
  if (!estado?.semanas) throw new Error("formato inválido");

  ESTADO = {
    ...estado,
    categorias: normalizarCategorias(estado.categorias),
    eventos: Array.isArray(estado.eventos) ? estado.eventos : []
  };
  confirmar();
}

export { toMin, toHHMM, formatarHoras };
