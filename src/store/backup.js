import * as agenda from "./agenda.js";
import * as treinos from "./treinos.js";
import * as projetos from "./projetos.js";

/**
 * Backup — formato único para exportação manual, backup automático e importação.
 *
 * Estava disperso no App: quem exportava montava o objeto de um jeito e quem
 * importava conferia de outro. Adicionar um módulo exigia lembrar dos dois
 * lugares, e esquecer um deles significava backup que perde dado em silêncio.
 */

export const VERSAO_BACKUP = 3;

const CHAVE_ULTIMO = "orbit:backup:ultimo";

export function montarBackup() {
  return {
    versaoBackup: VERSAO_BACKUP,
    geradoEm: new Date().toISOString(),
    agenda: agenda.getEstado(),
    treinos: treinos.getEstado(),
    projetos: projetos.getEstado()
  };
}

/**
 * Restaura o que o arquivo trouxer. Módulo ausente permanece intacto — um
 * backup da versão 2 não pode apagar os projetos de quem já está na 3.
 * @returns {string[]} módulos efetivamente restaurados
 */
export function restaurarBackup(texto) {
  const obj = JSON.parse(texto);

  if (!obj?.versaoBackup || !obj.agenda) {
    /* Formato antigo: o arquivo era o estado da agenda, sem envelope. */
    agenda.importarJSON(texto);
    return ["agenda"];
  }

  const restaurados = [];
  agenda.importarJSON(JSON.stringify(obj.agenda));
  restaurados.push("agenda");

  if (obj.treinos) {
    treinos.importarJSON(JSON.stringify(obj.treinos));
    restaurados.push("treinos");
  }
  if (obj.projetos) {
    projetos.importarJSON(JSON.stringify(obj.projetos));
    restaurados.push("projetos");
  }
  return restaurados;
}

export function nomeDoArquivo(prefixo = "orbit") {
  return `${prefixo}-${new Date().toISOString().slice(0, 10)}.json`;
}

/** Baixa o backup pelo navegador — caminho manual, disponível em qualquer ambiente. */
export function baixarBackup() {
  const blob = new Blob([JSON.stringify(montarBackup(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeDoArquivo();
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Backup automático, uma vez por dia, quando rodando no desktop.
 * No navegador não há acesso a disco: devolve null e o caminho manual segue valendo.
 */
export async function backupDiario() {
  if (!globalThis.window?.orbit?.desktop) return null;

  const hoje = new Date().toISOString().slice(0, 10);
  try {
    if (localStorage.getItem(CHAVE_ULTIMO) === hoje) return null;
  } catch { /* sem localStorage: tenta salvar mesmo assim */ }

  const resultado = await window.orbit.salvarBackup(JSON.stringify(montarBackup(), null, 2));

  if (resultado?.ok) {
    try { localStorage.setItem(CHAVE_ULTIMO, hoje); } catch { /* nada a fazer */ }
  }
  return resultado;
}
