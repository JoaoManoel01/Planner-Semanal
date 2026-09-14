/**
 * Domínio — projetos. Eixo vertical do ORBIT: uma atividade em profundidade,
 * atravessando semanas. Nenhuma função aqui conhece a agenda ou o armazenamento.
 */
import { getWeekStartISO, deslocarISO, hojeISO, diasEntre } from "./time.js";

export const ESTADOS = [
  { id: "ativo", nome: "Ativo" },
  { id: "pausado", nome: "Pausado" },
  { id: "concluido", nome: "Concluído" }
];

export const ESTADOS_POR_ID = Object.fromEntries(ESTADOS.map(e => [e.id, e]));

export function minutosTotais(registros) {
  return (registros || []).reduce((t, r) => t + (Number(r.minutos) || 0), 0);
}

export function registrosDaSemana(registros, semanaISO) {
  const inicio = getWeekStartISO(semanaISO);
  const fim = deslocarISO(inicio, 6);
  return (registros || []).filter(r => r.data >= inicio && r.data <= fim);
}

/**
 * Série semanal do investimento, sem buracos.
 * As semanas vazias importam: são elas que mostram o projeto parando.
 */
export function investimentoPorSemana(registros, hoje = hojeISO()) {
  const lista = registros || [];
  if (!lista.length) return [];

  const porSemana = new Map();
  for (const r of lista) {
    const semana = getWeekStartISO(r.data);
    porSemana.set(semana, (porSemana.get(semana) || 0) + (Number(r.minutos) || 0));
  }

  const datas = [...porSemana.keys()].sort();
  const fim = getWeekStartISO(hoje);
  const serie = [];
  let acumulado = 0;

  for (let semana = datas[0]; semana <= fim; semana = deslocarISO(semana, 7)) {
    const minutos = porSemana.get(semana) || 0;
    acumulado += minutos;
    serie.push({ semana, minutos, acumulado });
  }
  return serie;
}

/** Marco mais próximo ainda em aberto — o que o projeto está cobrando agora. */
export function proximoMarco(marcos, hoje = hojeISO()) {
  const abertos = (marcos || [])
    .filter(m => !m.concluido)
    .sort((a, b) => (a.data < b.data ? -1 : 1));
  if (!abertos.length) return null;

  const marco = abertos[0];
  const dias = diasEntre(hoje, marco.data);
  return { ...marco, dias, atrasado: dias < 0 };
}

/** Média de minutos por semana nas últimas `janela` semanas com o projeto ativo. */
export function ritmoSemanal(registros, janela = 6, hoje = hojeISO()) {
  const serie = investimentoPorSemana(registros, hoje);
  if (!serie.length) return 0;
  const recentes = serie.slice(-janela);
  return Math.round(recentes.reduce((t, s) => t + s.minutos, 0) / recentes.length);
}

/** Leitura completa de um projeto — tudo que a UI mostra sai daqui. */
export function resumoDoProjeto(projeto, hoje = hojeISO()) {
  const registros = projeto.registros || [];
  const marcos = projeto.marcos || [];

  const semanaAtual = getWeekStartISO(hoje);
  const semanaMin = minutosTotais(registrosDaSemana(registros, semanaAtual));
  const anteriorMin = minutosTotais(registrosDaSemana(registros, deslocarISO(semanaAtual, -7)));

  const ordenados = [...registros].sort((a, b) => (a.data < b.data ? 1 : -1));
  const ultimo = ordenados[0] || null;

  return {
    totalMin: minutosTotais(registros),
    semanaMin,
    anteriorMin,
    variacao: anteriorMin ? (semanaMin - anteriorMin) / anteriorMin : null,
    ritmoMin: ritmoSemanal(registros, 6, hoje),
    registros: registros.length,
    ultimo,
    diasParado: ultimo ? diasEntre(ultimo.data, hoje) : null,
    proximo: proximoMarco(marcos, hoje),
    marcosFeitos: marcos.filter(m => m.concluido).length,
    marcosTotal: marcos.length,
    serie: investimentoPorSemana(registros, hoje)
  };
}

/** Ordena o índice: ativos primeiro, depois por urgência do próximo marco. */
export function ordenarProjetos(projetos, hoje = hojeISO()) {
  const peso = { ativo: 0, pausado: 1, concluido: 2 };
  return [...(projetos || [])].sort((a, b) => {
    const estado = (peso[a.estado] ?? 0) - (peso[b.estado] ?? 0);
    if (estado !== 0) return estado;

    const pa = proximoMarco(a.marcos, hoje);
    const pb = proximoMarco(b.marcos, hoje);
    if (pa && pb) return pa.data < pb.data ? -1 : 1;
    if (pa) return -1;
    if (pb) return 1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}
