/**
 * Domínio — motor de insights.
 *
 *   Weekly data -> rules -> WeeklyInsight[] -> sort -> UI
 *
 * Cada regra devolve null quando não há sinal real.
 * Nenhum insight é fabricado apenas para preencher espaço.
 */
import { formatarHoras, toHHMM, diasEntre, formatarDiaMes, DIAS_SEMANA } from "./time.js";
import { findFreeWindows, detectSequences } from "./summary.js";

export const PRIORIDADE = {
  CRITICO: 100,
  IMPORTANTE: 80,
  ATENCAO: 60,
  INFORMACAO: 40,
  CONTEXTO: 20
};

const TIPO_EVENTO = {
  deadline: "Prazo",
  milestone: "Marco",
  reminder: "Lembrete",
  event: "Evento"
};

let contador = 0;
const novoId = prefixo => `insight-${prefixo}-${(contador += 1)}`;

function nomeCategoria(categorias, id) {
  return categorias.find(c => c.id === id)?.nome || id;
}

/* ── Regras ─────────────────────────────────────────────── */

/** R1 — sobreposição de atividades. */
function regraConflito({ conflitos, weekStartISO }) {
  if (!conflitos.length) return null;
  const primeiro = conflitos[0];
  const dia = DIAS_SEMANA[primeiro.diaIndex];
  const extras = conflitos.length - 1;
  return {
    id: novoId("conflito"),
    weekStart: weekStartISO,
    title: conflitos.length > 1 ? `${conflitos.length} sobreposições` : `Sobreposição em ${dia.toLowerCase()}`,
    body: `"${primeiro.a.titulo}" (${primeiro.a.ini}–${primeiro.a.fim}) e "${primeiro.b.titulo}" (${primeiro.b.ini}–${primeiro.b.fim}) ocupam o mesmo intervalo${extras > 0 ? `. Mais ${extras} conflito${extras > 1 ? "s" : ""} na semana` : ""}.`,
    type: "conflict",
    priority: PRIORIDADE.CRITICO
  };
}

/**
 * R2 — prazo dentro da semana.
 * Eventos comuns já aparecem em Contexto; só prazos e marcos viram insight.
 */
function regraPrazo({ eventos, weekStartISO, hoje }) {
  const prazos = eventos.filter(e => e.type === "deadline" || e.type === "milestone");
  if (!prazos.length) return null;
  const alvo = prazos.find(e => e.date >= hoje) || prazos[prazos.length - 1];
  const distancia = diasEntre(hoje, alvo.date);
  const quando =
    distancia < 0 ? "já passou nesta semana"
      : distancia === 0 ? "é hoje"
        : distancia === 1 ? "é amanhã"
          : `é em ${distancia} dias`;
  return {
    id: novoId("prazo"),
    weekStart: weekStartISO,
    title: `${alvo.title} ${quando}`,
    body: alvo.description
      ? `${formatarDiaMes(alvo.date)} · ${alvo.description}`
      : `${TIPO_EVENTO[alvo.type] || "Evento"} marcado para ${formatarDiaMes(alvo.date)}.`,
    type: "deadline",
    priority: distancia >= 0 && distancia <= 2 ? PRIORIDADE.CRITICO - 5 : PRIORIDADE.IMPORTANTE
  };
}

/** R3 — dia com carga muito acima da média da semana. */
function regraDiaAtipico({ summary, weekStartISO, eventos, range }) {
  const ativos = summary.porDia.filter(d => d.minutos > 0);
  if (ativos.length < 3) return null;
  const media = ativos.reduce((t, d) => t + d.minutos, 0) / ativos.length;
  const pico = summary.picoDia;
  if (!pico || pico.minutos < media * 1.35 || pico.minutos < 8 * 60) return null;

  const iso = range.dias[pico.index]?.iso;
  const evento = eventos.find(e => e.date === iso);
  const excedente = Math.round(((pico.minutos - media) / media) * 100);

  return {
    id: novoId("atipico"),
    weekStart: weekStartISO,
    title: `${pico.nome} é atípica`,
    body: evento
      ? `${formatarHoras(pico.minutos)} no dia, ${excedente}% acima da média da semana — ${evento.title} ocupa ${evento.startTime && evento.endTime ? `${evento.startTime}–${evento.endTime}` : "boa parte do dia"}.`
      : `${formatarHoras(pico.minutos)} em ${pico.blocos} blocos, ${excedente}% acima da média diária (${formatarHoras(media)}).`,
    type: "attention",
    priority: PRIORIDADE.ATENCAO + 10
  };
}

/** R4 — encadeamento recorrente entre duas categorias. */
function regraPadrao({ summary, categorias, weekStartISO }) {
  const sequencias = detectSequences(summary.porDia);
  if (!sequencias.length) return null;
  const seq = sequencias[0];
  const antes = nomeCategoria(categorias, seq.anteriorId);
  const depois = nomeCategoria(categorias, seq.seguinteId);
  const intervaloMedio = Math.round(seq.intervalos.reduce((t, v) => t + v, 0) / seq.intervalos.length);

  return {
    id: novoId("padrao"),
    weekStart: weekStartISO,
    title: `${depois} depois de ${antes}`,
    body: `Acontece em ${seq.ocorrencias} dias (${seq.dias.join(", ")}), com ${intervaloMedio} min de intervalo em média. O início de ${depois} depende do fim de ${antes}.`,
    type: "pattern",
    priority: PRIORIDADE.ATENCAO
  };
}

/** R5 — maior janela livre da semana. */
function regraJanelaLivre({ summary, weekStartISO, faixaIni, faixaFim }) {
  const janelas = findFreeWindows(summary.porDia, faixaIni, faixaFim, 210);
  if (!janelas.length) return null;
  const maior = janelas[0];
  if (maior.dia.fimDeSemana && janelas.length > 2) return null;

  return {
    id: novoId("janela"),
    weekStart: weekStartISO,
    title: `Janela livre em ${maior.dia.nome.toLowerCase()}`,
    body: `${formatarHoras(maior.duracao)} sem nada marcado entre ${toHHMM(maior.ini)} e ${toHHMM(maior.fim)} — o maior bloco contínuo da semana.`,
    type: "planning",
    priority: PRIORIDADE.INFORMACAO + 5
  };
}

/** R6 — evento relevante logo após a semana visualizada. */
function regraProximaSemana({ eventosProximos, weekStartISO, range }) {
  if (!eventosProximos.length) return null;
  const alvo = eventosProximos[0];
  const distancia = diasEntre(range.fimISO, alvo.date);
  return {
    id: novoId("horizonte"),
    weekStart: weekStartISO,
    title: `Antes de fechar a semana: ${alvo.title}`,
    body: `${TIPO_EVENTO[alvo.type] || "Evento"} em ${formatarDiaMes(alvo.date)}, ${distancia} dia${distancia > 1 ? "s" : ""} depois do domingo.${alvo.description ? ` ${alvo.description}` : ""}`,
    type: "planning",
    priority: distancia <= 3 ? PRIORIDADE.ATENCAO - 5 : PRIORIDADE.CONTEXTO + 10
  };
}

/** R7 — semana sem carga alguma. */
function regraSemanaVazia({ summary, weekStartISO, status }) {
  if (summary.blocos > 0) return null;
  return {
    id: novoId("vazia"),
    weekStart: weekStartISO,
    title: status === "passada" ? "Semana sem registro" : "Semana ainda não montada",
    body: status === "passada"
      ? "Nenhuma atividade foi registrada neste intervalo."
      : "Nenhuma atividade nesta semana. Comece por + Nova atividade.",
    type: "planning",
    priority: PRIORIDADE.INFORMACAO
  };
}

/** R8 — o que ainda resta hoje (apenas na semana corrente). */
function regraRestanteHoje({ summary, weekStartISO, status, agoraMin }) {
  if (status !== "atual" || agoraMin == null) return null;
  const hojeDia = summary.porDia.find(d => d.hoje);
  if (!hojeDia || !hojeDia.blocos) return null;
  const restantes = hojeDia.atividades.filter(a => a.fimMin > agoraMin && !a.feito);
  if (!restantes.length) return null;
  const proxima = [...restantes].sort((a, b) => a.iniMin - b.iniMin)[0];
  const minutos = restantes.reduce((t, a) => t + a.duracao, 0);
  const emCurso = proxima.iniMin <= agoraMin;

  return {
    id: novoId("hoje"),
    weekStart: weekStartISO,
    title: emCurso ? `Em curso: ${proxima.titulo}` : `A seguir: ${proxima.titulo}`,
    body: emCurso
      ? `Até ${proxima.fim}. Restam ${formatarHoras(minutos)} em ${restantes.length} bloco${restantes.length > 1 ? "s" : ""} hoje.`
      : `Começa às ${proxima.ini}, em ${formatarHoras(proxima.iniMin - agoraMin)}. Restam ${formatarHoras(minutos)} hoje.`,
    type: "reminder",
    priority: PRIORIDADE.IMPORTANTE + 5
  };
}

const REGRAS = [
  regraConflito,
  regraPrazo,
  regraRestanteHoje,
  regraDiaAtipico,
  regraPadrao,
  regraJanelaLivre,
  regraProximaSemana,
  regraSemanaVazia
];

/** Ordena por relevância — nunca por ordem de criação. */
export function sortWeeklyInsights(insights) {
  return [...insights].sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
}

/**
 * @param {object} ctx dados já calculados da semana
 * @param {number} limite máximo de cards (menos é melhor que genérico)
 */
export function generateWeeklyInsights(ctx, limite = 3) {
  const gerados = REGRAS.map(regra => {
    try {
      return regra(ctx);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return sortWeeklyInsights(gerados).slice(0, limite);
}
