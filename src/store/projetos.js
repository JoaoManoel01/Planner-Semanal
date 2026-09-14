/**
 * Store de projetos — mesmo padrão dos demais: singleton mutável + assinaturas.
 * Isolado de propósito: nada aqui é lido pela agenda, nada daqui escreve nela.
 */
import { lerEstado, escreverEstado } from "./persistencia.js";
import { COLUNAS_PADRAO } from "../domain/projetos.js";

const CHAVE = "orbit:projetos:v1";

const gerarId = p => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function estadoInicial() {
  return { versao: 1, projetos: [] };
}

function carregar() {
  return lerEstado(
    CHAVE,
    obj => (obj?.versao === 1 && Array.isArray(obj.projetos) ? obj : null),
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

export function getProjeto(id) {
  return ESTADO.projetos.find(p => p.id === id) || null;
}

export function criarProjeto(dados = {}) {
  const projeto = {
    id: gerarId("prj"),
    nome: (dados.nome || "Novo projeto").trim(),
    descricao: (dados.descricao || "").trim(),
    categoriaId: dados.categoriaId || null,
    estado: dados.estado || "ativo",
    criadoEm: new Date().toISOString(),
    marcos: [],
    registros: [],
    notas: [],
    quadro: { colunas: COLUNAS_PADRAO.map(c => ({ ...c })), cartoes: [] }
  };
  ESTADO.projetos.push(projeto);
  confirmar();
  return projeto.id;
}

export function atualizarProjeto(id, patch) {
  const projeto = getProjeto(id);
  if (!projeto) return;
  Object.assign(projeto, patch);
  confirmar();
}

export function removerProjeto(id) {
  const i = ESTADO.projetos.findIndex(p => p.id === id);
  if (i >= 0) { ESTADO.projetos.splice(i, 1); confirmar(); }
}

/* ── Marcos ──────────────────────────────────────────────────────── */

export function adicionarMarco(projetoId, { titulo, data }) {
  const projeto = getProjeto(projetoId);
  if (!projeto || !data) return;
  projeto.marcos.push({
    id: gerarId("mrc"),
    titulo: (titulo || "Marco").trim(),
    data,
    concluido: false
  });
  confirmar();
}

export function alternarMarco(projetoId, marcoId) {
  const marco = getProjeto(projetoId)?.marcos.find(m => m.id === marcoId);
  if (!marco) return;
  marco.concluido = !marco.concluido;
  confirmar();
}

export function removerMarco(projetoId, marcoId) {
  const projeto = getProjeto(projetoId);
  const i = projeto?.marcos.findIndex(m => m.id === marcoId) ?? -1;
  if (i >= 0) { projeto.marcos.splice(i, 1); confirmar(); }
}

/* ── Registros de trabalho ───────────────────────────────────────── */

export function registrarTrabalho(projetoId, { data, minutos, nota }) {
  const projeto = getProjeto(projetoId);
  const min = Number(minutos) || 0;
  if (!projeto || !data || min <= 0) return;

  projeto.registros.push({
    id: gerarId("reg"),
    data,
    minutos: min,
    nota: (nota || "").trim()
  });
  confirmar();
}

export function atualizarRegistro(projetoId, registroId, patch) {
  const registro = getProjeto(projetoId)?.registros.find(r => r.id === registroId);
  if (!registro) return;
  Object.assign(registro, patch);
  confirmar();
}

export function removerRegistro(projetoId, registroId) {
  const projeto = getProjeto(projetoId);
  const i = projeto?.registros.findIndex(r => r.id === registroId) ?? -1;
  if (i >= 0) { projeto.registros.splice(i, 1); confirmar(); }
}

/* ── Backup ──────────────────────────────────────────────────────── */

export function exportarJSON() {
  return JSON.stringify(ESTADO, null, 2);
}

export function importarJSON(texto) {
  const obj = JSON.parse(texto);
  if (!obj || obj.versao !== 1 || !Array.isArray(obj.projetos)) {
    throw new Error("formato inválido");
  }
  ESTADO = obj;
  confirmar();
}

/* ── Quadro ──────────────────────────────────────────────────────── */

function garantirQuadro(projeto) {
  if (!projeto.quadro) projeto.quadro = { colunas: COLUNAS_PADRAO.map(c => ({ ...c })), cartoes: [] };
  if (!Array.isArray(projeto.quadro.cartoes)) projeto.quadro.cartoes = [];
  if (!projeto.quadro.colunas?.length) projeto.quadro.colunas = COLUNAS_PADRAO.map(c => ({ ...c }));
  return projeto.quadro;
}

export function adicionarCartao(projetoId, { titulo, colunaId, marcoId, prazo } = {}) {
  const projeto = getProjeto(projetoId);
  if (!projeto) return null;

  const quadro = garantirQuadro(projeto);
  const coluna = colunaId || quadro.colunas[0].id;
  const ordem = quadro.cartoes.filter(c => c.colunaId === coluna).length;

  const cartao = {
    id: gerarId("crt"),
    colunaId: coluna,
    titulo: (titulo || "Nova tarefa").trim(),
    detalhe: "",
    prazo: prazo || null,
    marcoId: marcoId || null,
    ordem
  };
  quadro.cartoes.push(cartao);
  confirmar();
  return cartao.id;
}

export function atualizarCartao(projetoId, cartaoId, patch) {
  const cartao = getProjeto(projetoId)?.quadro?.cartoes.find(c => c.id === cartaoId);
  if (!cartao) return;
  Object.assign(cartao, patch);
  confirmar();
}

/** Move para outra coluna, ou reordena dentro dela. `destino` pode ser o fim. */
export function moverCartao(projetoId, cartaoId, colunaId, destino = Infinity) {
  const projeto = getProjeto(projetoId);
  const quadro = projeto && garantirQuadro(projeto);
  const cartao = quadro?.cartoes.find(c => c.id === cartaoId);
  if (!cartao) return;

  const origem = cartao.colunaId;
  cartao.colunaId = colunaId;

  /* Reindexa as duas colunas afetadas para que `ordem` nunca tenha buraco. */
  const reindexar = coluna => {
    quadro.cartoes
      .filter(c => c.colunaId === coluna && c.id !== cartaoId)
      .sort((a, b) => a.ordem - b.ordem)
      .forEach((c, i) => { c.ordem = i >= destino && coluna === colunaId ? i + 1 : i; });
  };

  reindexar(colunaId);
  if (origem !== colunaId) reindexar(origem);
  cartao.ordem = Math.min(destino, quadro.cartoes.filter(c => c.colunaId === colunaId).length - 1);

  confirmar();
}

export function removerCartao(projetoId, cartaoId) {
  const quadro = getProjeto(projetoId)?.quadro;
  const i = quadro?.cartoes.findIndex(c => c.id === cartaoId) ?? -1;
  if (i >= 0) { quadro.cartoes.splice(i, 1); confirmar(); }
}

/* ── Notas ───────────────────────────────────────────────────────── */

export function adicionarNota(projetoId, { titulo } = {}) {
  const projeto = getProjeto(projetoId);
  if (!projeto) return null;
  if (!Array.isArray(projeto.notas)) projeto.notas = [];

  const nota = {
    id: gerarId("nta"),
    titulo: (titulo || "Nova nota").trim(),
    corpo: "",
    atualizadoEm: new Date().toISOString()
  };
  projeto.notas.unshift(nota);
  confirmar();
  return nota.id;
}

export function atualizarNota(projetoId, notaId, patch) {
  const nota = getProjeto(projetoId)?.notas?.find(n => n.id === notaId);
  if (!nota) return;
  Object.assign(nota, patch, { atualizadoEm: new Date().toISOString() });
  confirmar();
}

export function removerNota(projetoId, notaId) {
  const projeto = getProjeto(projetoId);
  const i = projeto?.notas?.findIndex(n => n.id === notaId) ?? -1;
  if (i >= 0) { projeto.notas.splice(i, 1); confirmar(); }
}
