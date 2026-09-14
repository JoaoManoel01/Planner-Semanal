import { describe, it, expect } from "vitest";
import {
  seriesDoExercicio, cargaDoExercicio, estimar1RM,
  volumeDoRegistro, cargaPorGrupo, normalizarIntensidades,
  indiceExercicios, sessionsDaSemana, progressaoPorExercicio,
  mediaMovel, tendenciaDePeso, resumoDaSemanaDeTreino, diaDaSemana
} from "./treinos.js";

const ex = (id, nome, grupos, cargaTotal) => ({ id, nome, grupos, cargaTotal, repsAlvo: 8 });

describe("séries derivadas", () => {
  it("deriva aquecimento e os três percentuais", () => {
    const s = seriesDoExercicio({ cargaTotal: 100 });
    expect(s.map(x => x.carga)).toEqual([50, 60, 80, 100]);
    expect(s[0].tipo).toBe("aquecimento");
  });

  it("respeita aquecimento customizado", () => {
    const s = seriesDoExercicio({ cargaTotal: 100, aquecimentoPct: 0.3 });
    expect(s[0].carga).toBe(30);
  });

  it("não explode com carga ausente", () => {
    expect(cargaDoExercicio({})).toBe(0);
    expect(seriesDoExercicio({}).every(s => s.carga === 0)).toBe(true);
  });
});

describe("1RM estimado (Epley)", () => {
  it("com uma repetição, é o próprio peso", () => {
    expect(estimar1RM(100, 1)).toBe(103.3);
  });

  it("cresce com as repetições", () => {
    expect(estimar1RM(100, 10)).toBe(133.3);
    expect(estimar1RM(100, 5)).toBeLessThan(estimar1RM(100, 10));
  });

  it("sem reps devolve o peso, sem peso devolve zero", () => {
    expect(estimar1RM(80, 0)).toBe(80);
    expect(estimar1RM(0, 10)).toBe(0);
  });
});

describe("volume", () => {
  const supino = ex("e1", "Supino", ["peito", "triceps"], 60);

  it("usa peso × reps quando houve execução", () => {
    expect(volumeDoRegistro({ pesoTopo: 60, repsTopo: 8 }, supino)).toBe(480);
  });

  it("cai para a carga planejada quando não há reps", () => {
    /* 30 + 36 + 48 + 60 */
    expect(volumeDoRegistro({ pesoTopo: 60, repsTopo: 0 }, supino)).toBe(174);
  });

  it("ignora registro de exercício que não existe mais", () => {
    expect(volumeDoRegistro({ pesoTopo: 60, repsTopo: 8 }, undefined)).toBe(0);
  });

  it("credita o volume a todos os grupos do exercício", () => {
    const indice = indiceExercicios({ 0: [supino] });
    const porGrupo = cargaPorGrupo([{ exercicioId: "e1", pesoTopo: 60, repsTopo: 8 }], indice);
    expect(porGrupo).toEqual({ peito: 480, triceps: 480 });
  });
});

describe("intensidades normalizadas", () => {
  it("o maior vira 1 e os outros são proporcionais", () => {
    expect(normalizarIntensidades({ peito: 100, costas: 50 })).toEqual({ peito: 1, costas: 0.5 });
  });

  it("tudo zero não vira divisão por zero", () => {
    expect(normalizarIntensidades({ peito: 0 })).toEqual({ peito: 0 });
    expect(normalizarIntensidades({})).toEqual({});
  });
});

describe("recorte semanal", () => {
  const sessoes = [
    { data: "2026-09-13", registros: [] },
    { data: "2026-09-14", registros: [] },
    { data: "2026-09-20", registros: [] },
    { data: "2026-09-21", registros: [] }
  ];

  it("pega de segunda a domingo, inclusive", () => {
    const s = sessionsDaSemana(sessoes, "2026-09-16");
    expect(s.map(x => x.data)).toEqual(["2026-09-14", "2026-09-20"]);
  });
});

describe("dia da semana", () => {
  it("segunda é zero e domingo é seis", () => {
    expect(diaDaSemana("2026-09-14")).toBe(0);
    expect(diaDaSemana("2026-09-20")).toBe(6);
  });
});

describe("progressão por exercício", () => {
  it("ordena por data e ignora exercício removido do plano", () => {
    const plano = { 0: [ex("e1", "Supino", ["peito"], 60)] };
    const sessoes = [
      { data: "2026-09-21", registros: [{ exercicioId: "e1", pesoTopo: 65, repsTopo: 8 }] },
      { data: "2026-09-14", registros: [{ exercicioId: "e1", pesoTopo: 60, repsTopo: 8 }] },
      { data: "2026-09-15", registros: [{ exercicioId: "fantasma", pesoTopo: 99, repsTopo: 1 }] }
    ];
    const p = progressaoPorExercicio(plano, sessoes);
    expect(p.e1.map(x => x.pesoTopo)).toEqual([60, 65]);
    expect(p.fantasma).toBeUndefined();
  });
});

describe("resumo da semana de treino", () => {
  const plano = {
    0: [ex("e1", "Supino", ["peito", "triceps"], 60)],
    2: [ex("e2", "Agachamento", ["pernas"], 90)]
  };

  const estado = {
    plano,
    sessoes: [
      { data: "2026-09-14", registros: [{ exercicioId: "e1", pesoTopo: 60, repsTopo: 8 }] },
      { data: "2026-09-16", registros: [{ exercicioId: "e2", pesoTopo: 90, repsTopo: 6 }] },
      { data: "2026-09-07", registros: [{ exercicioId: "e1", pesoTopo: 55, repsTopo: 8 }] }
    ],
    pesagens: []
  };

  const r = resumoDaSemanaDeTreino(estado, "2026-09-14");

  it("soma o volume da semana pedida, não de todas", () => {
    expect(r.volume).toBe(480 + 540);
  });

  it("distribui o volume pelos dias certos", () => {
    expect(r.porDia[0]).toBe(480);
    expect(r.porDia[2]).toBe(540);
    expect(r.porDia[1]).toBe(0);
  });

  it("compara com a semana anterior", () => {
    expect(r.volumeAnterior).toBe(440);
    expect(r.variacao).toBeCloseTo((1020 - 440) / 440, 5);
  });

  it("conta sessões e grupos estimulados", () => {
    expect(r.sessoes).toBe(2);
    expect(r.gruposTocados).toBe(3);
    expect(r.diasPlanejados).toEqual([0, 2]);
  });

  it("semana sem registro não quebra nem divide por zero", () => {
    const vazio = resumoDaSemanaDeTreino({ plano: {}, sessoes: [], pesagens: [] }, "2026-09-14");
    expect(vazio.volume).toBe(0);
    expect(vazio.variacao).toBeNull();
    expect(vazio.porDia).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("média móvel do peso", () => {
  it("suaviza sem inventar ponto", () => {
    const pontos = mediaMovel([
      { data: "2026-09-14", pesoKg: 80 },
      { data: "2026-09-15", pesoKg: 82 }
    ]);
    expect(pontos).toHaveLength(2);
    expect(pontos[0].media).toBe(80);
    expect(pontos[1].media).toBe(81);
  });

  it("ordena mesmo recebendo fora de ordem", () => {
    const pontos = mediaMovel([
      { data: "2026-09-15", pesoKg: 82 },
      { data: "2026-09-14", pesoKg: 80 }
    ]);
    expect(pontos.map(p => p.data)).toEqual(["2026-09-14", "2026-09-15"]);
  });
});

describe("tendência de peso", () => {
  it("compara com a pesagem de sete dias antes", () => {
    const t = tendenciaDePeso([
      { data: "2026-09-07", pesoKg: 80 },
      { data: "2026-09-14", pesoKg: 79 }
    ]);
    expect(t.peso).toBe(79);
    expect(t.delta).toBe(-1);
    expect(t.desde).toBe("2026-09-07");
  });

  it("sem histórico anterior, não inventa variação", () => {
    const t = tendenciaDePeso([{ data: "2026-09-14", pesoKg: 79 }]);
    expect(t.delta).toBeNull();
  });

  it("lista vazia devolve nulo", () => {
    expect(tendenciaDePeso([])).toBeNull();
    expect(tendenciaDePeso(undefined)).toBeNull();
  });
});
