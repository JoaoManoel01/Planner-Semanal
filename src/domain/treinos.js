/**
 * Domínio — treinos. Grupos musculares canônicos e cálculos puros.
 * Nenhuma função aqui toca no armazenamento.
 */
import { getWeekStartISO, deslocarISO, isoParaData } from "./time.js";

export const GRUPOS = [
  { id: "peito", nome: "Peito" },
  { id: "costas", nome: "Costas" },
  { id: "ombros", nome: "Ombros" },
  { id: "biceps", nome: "Bíceps" },
  { id: "triceps", nome: "Tríceps" },
  { id: "pernas", nome: "Pernas" },
  { id: "core", nome: "Core" },
  { id: "gluteos", nome: "Glúteos" }
];

export const GRUPOS_POR_ID = Object.fromEntries(GRUPOS.map(g => [g.id, g]));

export const AQUECIMENTO_PADRAO = 0.5;

/** Séries derivadas do plano: aquecimento + 60/80/100%. */
export function seriesDoExercicio(ex) {
  const carga = Number(ex.cargaTotal) || 0;
  const pctAquecimento = ex.aquecimentoPct != null ? Number(ex.aquecimentoPct) : AQUECIMENTO_PADRAO;
  const pct = v => Math.round(carga * v * 10) / 10;
  return [
    { tipo: "aquecimento", rotulo: "Aquecimento", pct: pctAquecimento, carga: pct(pctAquecimento) },
    { tipo: "trabalho", rotulo: "60%", pct: 0.6, carga: pct(0.6) },
    { tipo: "trabalho", rotulo: "80%", pct: 0.8, carga: pct(0.8) },
    { tipo: "trabalho", rotulo: "100%", pct: 1, carga }
  ];
}

/** Carga total do exercício quando não há repetições registradas. */
export function cargaDoExercicio(ex) {
  return seriesDoExercicio(ex).reduce((t, s) => t + s.carga, 0);
}

export function estimar1RM(pesoTopo, repsTopo) {
  const p = Number(pesoTopo) || 0;
  const r = Math.max(0, Number(repsTopo) || 0);
  if (!p) return 0;
  if (!r) return p;
  return Math.round(p * (1 + r / 30) * 10) / 10;
}

export function indiceExercicios(plano) {
  const indice = {};
  for (const lista of Object.values(plano || {})) {
    for (const ex of lista || []) indice[ex.id] = ex;
  }
  return indice;
}

/** Volume de um registro: peso × reps quando houve execução, senão a carga planejada. */
export function volumeDoRegistro(reg, ex) {
  if (!ex) return 0;
  return Number(reg.repsTopo)
    ? (Number(reg.pesoTopo) || 0) * Number(reg.repsTopo)
    : cargaDoExercicio(ex);
}

/** Carga (ou volume, quando há reps) por grupo muscular. */
export function cargaPorGrupo(registros, indice) {
  const porGrupo = {};
  for (const reg of registros || []) {
    const ex = indice[reg.exercicioId];
    if (!ex) continue;
    const valor = volumeDoRegistro(reg, ex);
    for (const g of ex.grupos || []) {
      porGrupo[g] = (porGrupo[g] || 0) + valor;
    }
  }
  return porGrupo;
}

export function normalizarIntensidades(porGrupo) {
  const valores = Object.values(porGrupo);
  const max = valores.length ? Math.max(...valores) : 0;
  const out = {};
  for (const [g, v] of Object.entries(porGrupo)) {
    out[g] = max ? v / max : 0;
  }
  return out;
}

export function dadosOctogono(porGrupo) {
  const intensidades = normalizarIntensidades(porGrupo);
  return GRUPOS.map(g => ({
    ...g,
    valor: Math.round((intensidades[g.id] || 0) * 100) / 100,
    carga: Math.round((porGrupo[g.id] || 0) * 10) / 10
  }));
}

export function sessionsDaSemana(sessoes, semanaISO) {
  const inicio = getWeekStartISO(semanaISO);
  const fim = deslocarISO(inicio, 6);
  return sessoes.filter(s => s.data >= inicio && s.data <= fim);
}

/** Histórico de cada exercício, ordenado por data. */
export function progressaoPorExercicio(plano, sessoes) {
  const indice = indiceExercicios(plano);
  const porExercicio = {};
  for (const ex of Object.values(indice)) porExercicio[ex.id] = [];

  const ordenadas = [...sessoes].sort((a, b) => (a.data < b.data ? -1 : 1));
  for (const sessao of ordenadas) {
    for (const reg of sessao.registros || []) {
      if (!porExercicio[reg.exercicioId]) continue;
      porExercicio[reg.exercicioId].push({
        data: sessao.data,
        pesoTopo: Number(reg.pesoTopo) || 0,
        repsTopo: Number(reg.repsTopo) || 0,
        rm: estimar1RM(reg.pesoTopo, reg.repsTopo)
      });
    }
  }
  return porExercicio;
}

/** Carga consolidada por semana, para a linha do tempo. */
export function resumoSemanal(plano, sessoes) {
  const indice = indiceExercicios(plano);
  const semanas = new Map();
  for (const sessao of sessoes || []) {
    const semana = getWeekStartISO(sessao.data);
    let carga = 0;
    for (const reg of sessao.registros || []) {
      carga += volumeDoRegistro(reg, indice[reg.exercicioId]);
    }
    const atual = semanas.get(semana) || { semana, carga: 0, sessoes: 0 };
    atual.carga = Math.round((atual.carga + carga) * 10) / 10;
    atual.sessoes += 1;
    semanas.set(semana, atual);
  }
  return [...semanas.values()].sort((a, b) => (a.semana < b.semana ? -1 : 1));
}

/** Média móvel para suavizar o ruído da pesagem diária. */
export function mediaMovel(pesagens, janela = 7) {
  const ordenadas = [...(pesagens || [])].sort((a, b) => (a.data < b.data ? -1 : 1));
  return ordenadas.map((p, i) => {
    const inicio = Math.max(0, i - janela + 1);
    const fatia = ordenadas.slice(inicio, i + 1);
    const media = fatia.reduce((t, x) => t + Number(x.pesoKg), 0) / fatia.length;
    return {
      data: p.data,
      peso: Number(p.pesoKg) || 0,
      media: Math.round(media * 10) / 10
    };
  });
}

/** Índice dia-da-semana (0 = segunda) de uma data ISO. */
export function diaDaSemana(iso) {
  return (isoParaData(iso).getDay() + 6) % 7;
}

/**
 * Leitura quantitativa de uma semana de treino — espelha o resumo da agenda.
 * Tudo que a faixa de status mostra sai daqui, nada é calculado na UI.
 */
export function resumoDaSemanaDeTreino(estado, semanaISO) {
  const indice = indiceExercicios(estado.plano);
  const inicio = getWeekStartISO(semanaISO);
  const sessoes = sessionsDaSemana(estado.sessoes || [], inicio);

  const porDia = Array(7).fill(0);
  let volume = 0;
  for (const sessao of sessoes) {
    const dia = diaDaSemana(sessao.data);
    for (const reg of sessao.registros || []) {
      const valor = volumeDoRegistro(reg, indice[reg.exercicioId]);
      volume += valor;
      porDia[dia] += valor;
    }
  }

  const registros = sessoes.flatMap(s => s.registros || []);
  const porGrupo = cargaPorGrupo(registros, indice);

  const diasPlanejados = Object.entries(estado.plano || {})
    .filter(([, lista]) => (lista || []).length)
    .map(([dia]) => Number(dia));

  const anterior = resumoVolumeSimples(estado, deslocarISO(inicio, -7), indice);

  return {
    semanaISO: inicio,
    volume: Math.round(volume * 10) / 10,
    volumeAnterior: anterior,
    variacao: anterior ? (volume - anterior) / anterior : null,
    porDia,
    sessoes: sessoes.filter(s => (s.registros || []).length).length,
    diasPlanejados,
    gruposTocados: Object.values(porGrupo).filter(v => v > 0).length,
    porGrupo
  };
}

function resumoVolumeSimples(estado, semanaISO, indice) {
  let total = 0;
  for (const sessao of sessionsDaSemana(estado.sessoes || [], semanaISO)) {
    for (const reg of sessao.registros || []) {
      total += volumeDoRegistro(reg, indice[reg.exercicioId]);
    }
  }
  return Math.round(total * 10) / 10;
}

/** Peso mais recente e variação contra a pesagem de ~`dias` atrás. */
export function tendenciaDePeso(pesagens, dias = 7) {
  const ordenadas = [...(pesagens || [])].sort((a, b) => (a.data < b.data ? -1 : 1));
  if (!ordenadas.length) return null;

  const atual = ordenadas[ordenadas.length - 1];
  const alvo = deslocarISO(atual.data, -dias);
  const anteriores = ordenadas.filter(p => p.data <= alvo);
  const base = anteriores.length ? anteriores[anteriores.length - 1] : null;

  return {
    data: atual.data,
    peso: Number(atual.pesoKg) || 0,
    delta: base ? Math.round((atual.pesoKg - base.pesoKg) * 10) / 10 : null,
    desde: base?.data || null
  };
}
