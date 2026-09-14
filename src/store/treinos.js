/**
 * Store de treinos — estado, ações e persistência local.
 * Mesmo padrão do store da agenda: singleton mutável + assinaturas.
 */
import { GRUPOS, AQUECIMENTO_PADRAO } from "../domain/treinos.js";
import { lerEstado, escreverEstado } from "./persistencia.js";

const CHAVE = "orbit:treinos:v1";

const gerarId = p => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function estadoInicial() {
  return { versao: 1, plano: {}, sessoes: [], pesagens: [] };
}

function carregar() {
  return lerEstado(
    CHAVE,
    obj => (obj?.versao === 1 && obj.plano && Array.isArray(obj.sessoes) && Array.isArray(obj.pesagens) ? obj : null),
    estadoInicial
  );
}

let ESTADO = carregar();
const ouvintes = new Set();

function salvar() {
  escreverEstado(CHAVE, ESTADO);
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

export function getPlanoDia(dia) {
  return ESTADO.plano[dia] || [];
}

export function adicionarExercicio(dia, dados = {}) {
  const lista = ESTADO.plano[dia] || (ESTADO.plano[dia] = []);
  lista.push({
    id: gerarId("ex"),
    nome: dados.nome || "Exercício",
    grupos: Array.isArray(dados.grupos) && dados.grupos.length ? dados.grupos : [GRUPOS[0].id],
    cargaTotal: Number(dados.cargaTotal) || 0,
    repsAlvo: dados.repsAlvo ? Number(dados.repsAlvo) : 0,
    aquecimentoPct: dados.aquecimentoPct != null ? Number(dados.aquecimentoPct) : AQUECIMENTO_PADRAO
  });
  confirmar();
}

export function atualizarExercicio(id, patch) {
  for (const lista of Object.values(ESTADO.plano)) {
    const ex = lista.find(e => e.id === id);
    if (ex) { Object.assign(ex, patch); confirmar(); return; }
  }
}

export function removerExercicio(id) {
  for (const [dia, lista] of Object.entries(ESTADO.plano)) {
    const i = lista.findIndex(e => e.id === id);
    if (i >= 0) { lista.splice(i, 1); confirmar(); return; }
  }
}

export function localizarExercicio(id) {
  for (const lista of Object.values(ESTADO.plano)) {
    const ex = lista.find(e => e.id === id);
    if (ex) return ex;
  }
  return null;
}

export function getSessao(data) {
  return ESTADO.sessoes.find(s => s.data === data);
}

export function salvarRegistro(data, { exercicioId, pesoTopo, repsTopo, chegouFalha, notas }) {
  let sessao = getSessao(data);
  if (!sessao) {
    sessao = { data, registros: [] };
    ESTADO.sessoes.push(sessao);
  }
  const dados = {
    exercicioId,
    pesoTopo: Number(pesoTopo) || 0,
    repsTopo: Number(repsTopo) || 0,
    chegouFalha: !!chegouFalha,
    notas: (notas || "").trim()
  };
  const existente = sessao.registros.find(r => r.exercicioId === exercicioId);
  if (existente) Object.assign(existente, dados);
  else sessao.registros.push(dados);
  confirmar();
}

export function getPesagem(data) {
  return ESTADO.pesagens.find(p => p.data === data);
}

export function salvarPesagem(data, pesoKg, notas = "") {
  const existente = getPesagem(data);
  if (existente) {
    existente.pesoKg = Number(pesoKg) || 0;
    existente.notas = (notas || "").trim();
  } else {
    ESTADO.pesagens.push({ data, pesoKg: Number(pesoKg) || 0, notas: (notas || "").trim() });
  }
  confirmar();
}

export function removerPesagem(data) {
  const i = ESTADO.pesagens.findIndex(p => p.data === data);
  if (i >= 0) { ESTADO.pesagens.splice(i, 1); confirmar(); }
}

export function exportarJSON() {
  return JSON.stringify(ESTADO, null, 2);
}

export function importarJSON(texto) {
  const obj = JSON.parse(texto);
  if (!obj || obj.versao !== 1 || !obj.plano || !Array.isArray(obj.sessoes) || !Array.isArray(obj.pesagens)) {
    throw new Error("formato inválido");
  }
  ESTADO = obj;
  confirmar();
}
