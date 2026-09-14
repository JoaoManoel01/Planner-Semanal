/**
 * Domínio — seleção de dados por semana.
 * A UI nunca decide se um dado pertence à semana: pergunta aqui.
 */
import { toMin, isDateInWeek, getWeekStartISO, deslocarISO, hojeISO, diasEntre } from "./time.js";

/**
 * Normaliza os blocos armazenados (dia + hh:mm) em atividades com data real.
 * @returns {Array<{id,titulo,categoriaId,diaIndex,dataISO,ini,fim,iniMin,fimMin,duracao,nota,feito}>}
 */
export function getActivitiesForWeek(semanas, weekStartISO) {
  const chave = getWeekStartISO(weekStartISO);
  const semana = semanas?.[chave];
  if (!semana?.dias) return [];

  return semana.dias.flatMap((dia, diaIndex) =>
    (dia.blocos || []).map(b => {
      const iniMin = toMin(b.ini);
      const fimMin = toMin(b.fim);
      return {
        id: b.id,
        titulo: b.rot,
        categoriaId: b.cat,
        diaIndex,
        dataISO: deslocarISO(chave, diaIndex),
        ini: b.ini,
        fim: b.fim,
        iniMin,
        fimMin,
        duracao: Math.max(0, fimMin - iniMin),
        nota: b.nota || "",
        feito: !!b.feito,
        flexivel: !!b.flexivel
      };
    })
  );
}

/** Eventos temporais que pertencem à semana — função pura, sem efeitos. */
export function getEventsForWeek(eventos, weekStartISO) {
  if (!Array.isArray(eventos)) return [];
  return eventos
    .filter(e => e?.date && isDateInWeek(e.date, weekStartISO))
    .sort((a, b) => (a.date === b.date
      ? toMin(a.startTime || "00:00") - toMin(b.startTime || "00:00")
      : a.date < b.date ? -1 : 1));
}

/** Próximos eventos fora da semana visível (usado por insights de antecedência). */
export function getUpcomingEvents(eventos, weekStartISO, janelaDias = 21) {
  if (!Array.isArray(eventos)) return [];
  const fim = deslocarISO(getWeekStartISO(weekStartISO), 6);
  return eventos
    .filter(e => e?.date && e.date > fim && diasEntre(fim, e.date) <= janelaDias)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Situação temporal da semana em relação a hoje. */
export function getWeekStatus(weekStartISO, hoje = hojeISO()) {
  const atual = getWeekStartISO(weekStartISO);
  const dessa = getWeekStartISO(hoje);
  if (atual === dessa) return "atual";
  return atual < dessa ? "passada" : "futura";
}

/** Itens de contexto permanentes (sem data) — sempre relevantes. */
export function getContextItems(eventos) {
  return Array.isArray(eventos) ? eventos.filter(e => !e?.date) : [];
}
