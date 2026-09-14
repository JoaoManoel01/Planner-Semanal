/**
 * Domínio — analytics da semana. Funções puras, testáveis isoladamente.
 */

/** Carga por dia da semana. */
export function calculateDailyLoad(atividades, range) {
  return range.dias.map(dia => {
    const doDia = atividades.filter(a => a.diaIndex === dia.index);
    const minutos = doDia.reduce((t, a) => t + a.duracao, 0);
    return {
      index: dia.index,
      nome: dia.nome,
      curto: dia.curto,
      iso: dia.iso,
      hoje: dia.hoje,
      fimDeSemana: dia.fimDeSemana,
      minutos,
      blocos: doDia.length,
      feitos: doDia.filter(a => a.feito).length,
      atividades: doDia
    };
  });
}

/** Resumo consolidado: total, por categoria, por dia, conclusão. */
export function calculateWeeklySummary(atividades, categorias, range) {
  const porDia = calculateDailyLoad(atividades, range);
  const totalMin = atividades.reduce((t, a) => t + a.duracao, 0);

  const acumulado = new Map();
  for (const a of atividades) {
    acumulado.set(a.categoriaId, (acumulado.get(a.categoriaId) || 0) + a.duracao);
  }

  const porCategoria = [...acumulado.entries()]
    .map(([id, minutos]) => {
      const cat = categorias.find(c => c.id === id);
      return {
        id,
        nome: cat?.nome || id,
        cor: cat?.cor || "var(--color-text-muted)",
        minutos,
        fatia: totalMin ? minutos / totalMin : 0
      };
    })
    .sort((a, b) => b.minutos - a.minutos);

  const feitos = atividades.filter(a => a.feito).length;
  const picoDia = porDia.reduce((max, d) => (d.minutos > (max?.minutos || 0) ? d : max), null);

  return {
    totalMin,
    porCategoria,
    porDia,
    blocos: atividades.length,
    feitos,
    conclusao: atividades.length ? feitos / atividades.length : 0,
    mediaDiaria: porDia.length ? totalMin / porDia.filter(d => d.minutos > 0).length || 0 : 0,
    dominante: porCategoria[0] || null,
    picoDia: picoDia?.minutos ? picoDia : null
  };
}

/** Sobreposições reais dentro do mesmo dia. */
export function detectConflicts(atividades) {
  const conflitos = [];
  const porDia = new Map();
  for (const a of atividades) {
    if (!porDia.has(a.diaIndex)) porDia.set(a.diaIndex, []);
    porDia.get(a.diaIndex).push(a);
  }
  for (const lista of porDia.values()) {
    const ordenada = [...lista].sort((x, y) => x.iniMin - y.iniMin);
    for (let i = 0; i < ordenada.length; i++) {
      for (let j = i + 1; j < ordenada.length; j++) {
        if (ordenada[j].iniMin >= ordenada[i].fimMin) break;
        conflitos.push({ a: ordenada[i], b: ordenada[j], diaIndex: ordenada[i].diaIndex });
      }
    }
  }
  return conflitos;
}

/** Maior janela livre de cada dia, dentro da faixa útil informada. */
export function findFreeWindows(porDia, faixaIni, faixaFim, minimoMin = 180) {
  const janelas = [];
  for (const dia of porDia) {
    if (!dia.blocos) continue;
    const ordenada = [...dia.atividades].sort((a, b) => a.iniMin - b.iniMin);
    let cursor = faixaIni;
    let maior = null;
    for (const a of ordenada) {
      if (a.iniMin - cursor >= minimoMin) {
        const janela = { dia, ini: cursor, fim: a.iniMin, duracao: a.iniMin - cursor };
        if (!maior || janela.duracao > maior.duracao) maior = janela;
      }
      cursor = Math.max(cursor, a.fimMin);
    }
    if (faixaFim - cursor >= minimoMin) {
      const janela = { dia, ini: cursor, fim: faixaFim, duracao: faixaFim - cursor };
      if (!maior || janela.duracao > maior.duracao) maior = janela;
    }
    if (maior) janelas.push(maior);
  }
  return janelas.sort((a, b) => b.duracao - a.duracao);
}

/** Pares de atividades que se repetem em sequência (A sempre depois de B). */
export function detectSequences(porDia, minimoOcorrencias = 3, intervaloMax = 120) {
  const pares = new Map();
  for (const dia of porDia) {
    const ordenada = [...dia.atividades].sort((a, b) => a.iniMin - b.iniMin);
    for (let i = 0; i < ordenada.length - 1; i++) {
      const anterior = ordenada[i];
      const seguinte = ordenada[i + 1];
      if (anterior.categoriaId === seguinte.categoriaId) continue;
      const intervalo = seguinte.iniMin - anterior.fimMin;
      if (intervalo < 0 || intervalo > intervaloMax) continue;
      const chave = `${anterior.categoriaId}>${seguinte.categoriaId}`;
      const atual = pares.get(chave) || {
        anteriorId: anterior.categoriaId,
        seguinteId: seguinte.categoriaId,
        ocorrencias: 0,
        dias: [],
        intervalos: []
      };
      atual.ocorrencias++;
      atual.dias.push(dia.curto);
      atual.intervalos.push(intervalo);
      pares.set(chave, atual);
    }
  }
  return [...pares.values()]
    .filter(p => p.ocorrencias >= minimoOcorrencias)
    .sort((a, b) => b.ocorrencias - a.ocorrencias);
}
