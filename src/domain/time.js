/**
 * Domínio — utilitários temporais centralizados.
 * Nenhum outro módulo deve comparar datas por conta própria.
 */

export const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];
export const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "08:30" -> 510 */
export function toMin(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

/** 510 -> "08:30" */
export function toHHMM(min) {
  const m = Math.round(min);
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(((m % 60) + 60) % 60).padStart(2, "0");
}

/** 100 -> "1h40" */
export function formatarHoras(min) {
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!total) return "0h";
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function isoParaData(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dataParaISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function hojeISO() {
  return dataParaISO(new Date());
}

/** Segunda-feira da semana que contém `data` (Date ou ISO). */
export function getWeekStart(data) {
  const d = data instanceof Date ? new Date(data) : isoParaData(data);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function getWeekStartISO(data) {
  return dataParaISO(getWeekStart(data));
}

/** Domingo da semana. */
export function getWeekEnd(weekStart) {
  const d = getWeekStart(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

export function deslocarISO(iso, dias) {
  const d = isoParaData(iso);
  d.setDate(d.getDate() + dias);
  return dataParaISO(d);
}

export function isDateInWeek(dateISO, weekStartISO) {
  if (!dateISO) return false;
  const inicio = getWeekStartISO(weekStartISO);
  const fim = deslocarISO(inicio, 6);
  return dateISO >= inicio && dateISO <= fim;
}

export function isSameWeek(a, b) {
  return getWeekStartISO(a) === getWeekStartISO(b);
}

export function diasEntre(aISO, bISO) {
  return Math.round((isoParaData(bISO) - isoParaData(aISO)) / 86400000);
}

/** "2026-09-17" -> "17/09" */
export function formatarDiaMes(iso) {
  const [, m, d] = String(iso).split("-");
  return `${d}/${m}`;
}

/**
 * Intervalo completo da semana, já normalizado para a UI.
 * Única fonte de verdade sobre "que dias existem nesta semana".
 */
export function getWeekRange(weekStartISO, hoje = hojeISO()) {
  const inicioISO = getWeekStartISO(weekStartISO);
  const inicio = isoParaData(inicioISO);
  const fim = getWeekEnd(inicio);
  const fimISO = dataParaISO(fim);

  const dias = DIAS_SEMANA.map((nome, i) => {
    const iso = deslocarISO(inicioISO, i);
    return {
      index: i,
      nome,
      curto: DIAS_CURTOS[i],
      iso,
      diaMes: formatarDiaMes(iso),
      fimDeSemana: i >= 5,
      hoje: iso === hoje
    };
  });

  const mesmoMes = inicio.getMonth() === fim.getMonth();
  const rotulo = mesmoMes
    ? `${inicio.getDate()} a ${fim.getDate()} de ${MESES[fim.getMonth()]} de ${fim.getFullYear()}`
    : `${inicio.getDate()} de ${MESES[inicio.getMonth()]} a ${fim.getDate()} de ${MESES[fim.getMonth()]} de ${fim.getFullYear()}`;

  const rotuloCurto = mesmoMes
    ? `${inicio.getDate()} — ${fim.getDate()} ${MESES_CURTOS[fim.getMonth()]}`
    : `${inicio.getDate()} ${MESES_CURTOS[inicio.getMonth()]} — ${fim.getDate()} ${MESES_CURTOS[fim.getMonth()]}`;

  return { inicioISO, fimISO, dias, rotulo, rotuloCurto, contemHoje: dias.some(d => d.hoje) };
}

/**
 * Posição do instante atual dentro da faixa visível da grade.
 * Retorna null quando "agora" não pertence à semana/faixa exibida.
 */
export function getCurrentTimePosition(range, faixaIni, faixaFim, agora = new Date()) {
  const iso = dataParaISO(agora);
  const dia = range.dias.find(d => d.iso === iso);
  if (!dia) return null;
  const minutos = agora.getHours() * 60 + agora.getMinutes();
  if (minutos < faixaIni || minutos >= faixaFim) return null;
  return {
    diaIndex: dia.index,
    minutos,
    hhmm: toHHMM(minutos),
    ratio: (minutos - faixaIni) / (faixaFim - faixaIni)
  };
}
