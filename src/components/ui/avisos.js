/**
 * Avisos da aplicação — confirmações e notificações.
 * Substitui window.confirm/alert por superfícies com os tokens do sistema.
 *
 * Store mínimo em módulo: qualquer camada pede uma confirmação e recebe
 * uma Promise, sem precisar carregar props por toda a árvore.
 */

let sequencia = 0;
let estado = { confirmacao: null, avisos: [] };
const ouvintes = new Set();

function emitir() {
  estado = { ...estado };
  ouvintes.forEach(fn => fn(estado));
}

export function assinarAvisos(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

export function getAvisos() {
  return estado;
}

/**
 * @param {{titulo:string, corpo?:string, acao?:string, cancelar?:string, perigo?:boolean}} opcoes
 * @returns {Promise<boolean>}
 */
export function pedirConfirmacao(opcoes) {
  return new Promise(resolver => {
    if (estado.confirmacao) estado.confirmacao.resolver(false);
    estado.confirmacao = {
      id: ++sequencia,
      acao: "Confirmar",
      cancelar: "Cancelar",
      perigo: false,
      ...opcoes,
      resolver
    };
    emitir();
  });
}

export function responderConfirmacao(valor) {
  const atual = estado.confirmacao;
  if (!atual) return;
  estado.confirmacao = null;
  emitir();
  atual.resolver(valor);
}

/**
 * Notificação discreta. `desfazer` vira um botão dentro do aviso.
 * @param {string} texto
 * @param {{tipo?: "info"|"erro", desfazer?: () => void, duracao?: number}} opcoes
 */
export function avisar(texto, opcoes = {}) {
  const id = ++sequencia;
  const duracao = opcoes.duracao ?? (opcoes.desfazer ? 6000 : 2800);
  estado.avisos = [...estado.avisos, { id, texto, tipo: opcoes.tipo || "info", desfazer: opcoes.desfazer }];
  emitir();
  setTimeout(() => descartarAviso(id), duracao);
  return id;
}

export function descartarAviso(id) {
  if (!estado.avisos.some(a => a.id === id)) return;
  estado.avisos = estado.avisos.filter(a => a.id !== id);
  emitir();
}
