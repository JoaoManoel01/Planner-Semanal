/**
 * Formatação numérica compartilhada entre módulos.
 * Sem regra de domínio: só apresentação.
 */
export function formatarNumero(v) {
  const n = Number(v) || 0;
  return (Math.round(n * 10) / 10).toLocaleString("pt-BR");
}

/** "+1,2" / "−0,4" / "estável" — o sinal já comunica a direção. */
export function formatarDelta(valor) {
  if (valor == null) return null;
  const v = Math.round(valor * 10) / 10;
  if (v === 0) return "estável";
  const sinal = v > 0 ? "+" : "−";
  return sinal + Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatarPercentual(fracao) {
  if (fracao == null || !isFinite(fracao)) return null;
  const pct = Math.round(fracao * 100);
  if (pct === 0) return "estável";
  return (pct > 0 ? "+" : "−") + Math.abs(pct) + "%";
}

export function direcao(valor) {
  if (valor == null || valor === 0) return "neutra";
  return valor > 0 ? "subindo" : "descendo";
}
