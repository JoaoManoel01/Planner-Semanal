/**
 * Store de projetos — mesmo padrão dos demais: singleton mutável + assinaturas.
 * Isolado de propósito: nada aqui é lido pela agenda, nada daqui escreve nela.
 */
const CHAVE = "orbit:projetos:v1";

const gerarId = p => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function estadoInicial() {
  return { versao: 1, projetos: [] };
}

function carregar() {
  try {
    const obj = JSON.parse(localStorage.getItem(CHAVE));
    if (obj && obj.versao === 1 && Array.isArray(obj.projetos)) return obj;
  } catch { /* estado corrompido: recomeça vazio */ }
  return estadoInicial();
}

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
    registros: []
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
