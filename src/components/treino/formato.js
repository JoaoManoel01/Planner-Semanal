/**
 * Formatação específica de treino. O que é genérico mora em ui/numeros.js —
 * aqui ficam só as unidades do domínio: carga e peso corporal.
 */
export { formatarDelta, formatarPercentual, direcao } from "../ui/numeros.js";

/** Volume de treino cresce rápido; acima de mil, o dígito fino deixa de informar. */
export function formatarCarga(kg) {
  const v = Number(kg) || 0;
  if (v >= 10000) return (v / 1000).toFixed(1).replace(".", ",") + "k";
  if (v >= 1000) return Math.round(v).toLocaleString("pt-BR");
  return (Math.round(v * 10) / 10).toLocaleString("pt-BR");
}

export function formatarPeso(kg) {
  return (Math.round((Number(kg) || 0) * 10) / 10).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}
