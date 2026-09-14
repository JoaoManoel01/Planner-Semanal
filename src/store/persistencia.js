/**
 * Camada de persistência compartilhada pelos três stores.
 *
 * Existe por causa de dois modos de falha silenciosa que o localStorage tem, e
 * que custam dado quando ninguém está olhando:
 *
 * 1. Estado ilegível. Engolir o erro e devolver o estado vazio faz o app abrir
 *    limpo; a primeira alteração então sobrescreve a chave e o que talvez fosse
 *    recuperável some de vez. Aqui o conteúdo suspeito é movido para uma chave
 *    de quarentena ANTES de qualquer escrita nova.
 *
 * 2. Cota estourada. setItem lança, o app segue funcionando e nada é gravado —
 *    você trabalha achando que salvou. Aqui a falha é anunciada.
 *
 * A notificação sai por assinatura: store não conhece componente.
 */

const ouvintesDeFalha = new Set();

/** @param {(falha: {tipo: string, chave: string, detalhe?: string}) => void} fn */
export function aoFalhar(fn) {
  ouvintesDeFalha.add(fn);
  return () => ouvintesDeFalha.delete(fn);
}

function anunciar(falha) {
  ouvintesDeFalha.forEach(fn => {
    try { fn(falha); } catch { /* um ouvinte ruim não derruba os outros */ }
  });
}

function quarentena(chave, bruto) {
  if (!bruto) return null;
  const destino = `${chave}:corrompido:${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "")}`;
  try {
    localStorage.setItem(destino, bruto);
    return destino;
  } catch {
    return null;
  }
}

/**
 * Lê e valida o estado de uma chave.
 * @param {string} chave
 * @param {(obj: any) => any} interpretar  devolve o estado normalizado, ou null se não servir
 * @param {() => any} criarVazio
 */
export function lerEstado(chave, interpretar, criarVazio) {
  let bruto = null;
  try {
    bruto = localStorage.getItem(chave);
  } catch {
    anunciar({ tipo: "indisponivel", chave });
    return criarVazio();
  }

  if (bruto == null) return criarVazio();

  try {
    const interpretado = interpretar(JSON.parse(bruto));
    if (interpretado) return interpretado;
    throw new Error("formato não reconhecido");
  } catch (erro) {
    const destino = quarentena(chave, bruto);
    anunciar({ tipo: "corrompido", chave, detalhe: destino || erro.message });
    return criarVazio();
  }
}

/** Grava o estado. Diferente do anterior, uma falha aqui não passa despercebida. */
export function escreverEstado(chave, estado) {
  try {
    localStorage.setItem(chave, JSON.stringify(estado));
    return true;
  } catch (erro) {
    const cota = erro?.name === "QuotaExceededError" || erro?.code === 22;
    anunciar({ tipo: cota ? "cota" : "escrita", chave, detalhe: erro?.message });
    return false;
  }
}

/** Chaves de quarentena existentes — a tela de recuperação as oferece para download. */
export function listarQuarentenas() {
  const achadas = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave?.includes(":corrompido:")) achadas.push(chave);
    }
  } catch { /* sem acesso: devolve o que tiver */ }
  return achadas;
}
