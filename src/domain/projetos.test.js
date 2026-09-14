import { describe, it, expect } from "vitest";
import {
  minutosTotais, registrosDaSemana, investimentoPorSemana,
  proximoMarco, ritmoSemanal, resumoDoProjeto, ordenarProjetos
} from "./projetos.js";

const HOJE = "2026-09-16";

describe("soma de tempo", () => {
  it("ignora valores inválidos em vez de virar NaN", () => {
    expect(minutosTotais([{ minutos: 60 }, { minutos: "30" }, { minutos: null }, {}])).toBe(90);
    expect(minutosTotais([])).toBe(0);
    expect(minutosTotais(undefined)).toBe(0);
  });
});

describe("recorte semanal", () => {
  const registros = [
    { data: "2026-09-13", minutos: 60 },
    { data: "2026-09-14", minutos: 60 },
    { data: "2026-09-20", minutos: 60 },
    { data: "2026-09-21", minutos: 60 }
  ];

  it("pega a semana inteira, de segunda a domingo", () => {
    expect(registrosDaSemana(registros, HOJE).map(r => r.data))
      .toEqual(["2026-09-14", "2026-09-20"]);
  });
});

describe("investimento por semana", () => {
  it("preenche as semanas vazias no meio do caminho", () => {
    /* É o ponto do gráfico: sem as semanas zeradas, o abandono some do desenho. */
    const serie = investimentoPorSemana([
      { data: "2026-08-24", minutos: 120 },
      { data: "2026-09-14", minutos: 60 }
    ], HOJE);

    expect(serie.map(s => s.semana)).toEqual([
      "2026-08-24", "2026-08-31", "2026-09-07", "2026-09-14"
    ]);
    expect(serie.map(s => s.minutos)).toEqual([120, 0, 0, 60]);
  });

  it("acumula corretamente", () => {
    const serie = investimentoPorSemana([
      { data: "2026-09-07", minutos: 60 },
      { data: "2026-09-14", minutos: 30 }
    ], HOJE);
    expect(serie.map(s => s.acumulado)).toEqual([60, 90]);
  });

  it("soma vários registros da mesma semana", () => {
    const serie = investimentoPorSemana([
      { data: "2026-09-14", minutos: 60 },
      { data: "2026-09-16", minutos: 30 }
    ], HOJE);
    expect(serie).toHaveLength(1);
    expect(serie[0].minutos).toBe(90);
  });

  it("estende a série até a semana de hoje, mesmo parado", () => {
    const serie = investimentoPorSemana([{ data: "2026-08-31", minutos: 60 }], HOJE);
    expect(serie[serie.length - 1].semana).toBe("2026-09-14");
    expect(serie[serie.length - 1].minutos).toBe(0);
  });

  it("sem registro, série vazia", () => {
    expect(investimentoPorSemana([], HOJE)).toEqual([]);
  });
});

describe("próximo marco", () => {
  const marcos = [
    { id: "m1", titulo: "Atrasado", data: "2026-09-10", concluido: false },
    { id: "m2", titulo: "Concluído e próximo", data: "2026-09-17", concluido: true },
    { id: "m3", titulo: "Em aberto", data: "2026-09-28", concluido: false }
  ];

  it("prefere o mais antigo em aberto, mesmo atrasado", () => {
    const p = proximoMarco(marcos, HOJE);
    expect(p.id).toBe("m1");
    expect(p.atrasado).toBe(true);
    expect(p.dias).toBe(-6);
  });

  it("pula os concluídos", () => {
    const p = proximoMarco(marcos.filter(m => m.id !== "m1"), HOJE);
    expect(p.id).toBe("m3");
    expect(p.atrasado).toBe(false);
    expect(p.dias).toBe(12);
  });

  it("sem marco em aberto, devolve nulo", () => {
    expect(proximoMarco([{ id: "x", data: "2026-09-20", concluido: true }], HOJE)).toBeNull();
    expect(proximoMarco([], HOJE)).toBeNull();
  });
});

describe("ritmo semanal", () => {
  it("é a média das últimas semanas, contando as zeradas", () => {
    const registros = [
      { data: "2026-08-31", minutos: 120 },
      { data: "2026-09-14", minutos: 60 }
    ];
    /* série: 120, 0, 60 -> média 60 */
    expect(ritmoSemanal(registros, 6, HOJE)).toBe(60);
  });

  it("sem registro é zero", () => {
    expect(ritmoSemanal([], 6, HOJE)).toBe(0);
  });
});

describe("resumo do projeto", () => {
  const projeto = {
    id: "p1",
    nome: "PIBIC",
    estado: "ativo",
    marcos: [{ id: "m1", titulo: "Relatório", data: "2026-09-28", concluido: false }],
    registros: [
      { data: "2026-09-07", minutos: 120 },
      { data: "2026-09-14", minutos: 60 },
      { data: "2026-09-15", minutos: 30 }
    ]
  };

  const r = resumoDoProjeto(projeto, HOJE);

  it("soma tudo e separa a semana corrente", () => {
    expect(r.totalMin).toBe(210);
    expect(r.semanaMin).toBe(90);
    expect(r.anteriorMin).toBe(120);
  });

  it("calcula a variação contra a semana anterior", () => {
    expect(r.variacao).toBeCloseTo((90 - 120) / 120, 5);
  });

  it("aponta o último registro e há quantos dias", () => {
    expect(r.ultimo.data).toBe("2026-09-15");
    expect(r.diasParado).toBe(1);
  });

  it("projeto sem registro não quebra", () => {
    const vazio = resumoDoProjeto({ marcos: [], registros: [] }, HOJE);
    expect(vazio.totalMin).toBe(0);
    expect(vazio.variacao).toBeNull();
    expect(vazio.diasParado).toBeNull();
    expect(vazio.proximo).toBeNull();
    expect(vazio.serie).toEqual([]);
  });
});

describe("ordem do índice", () => {
  it("ativos primeiro, depois por urgência do prazo", () => {
    const projetos = [
      { nome: "Concluído", estado: "concluido", marcos: [], registros: [] },
      { nome: "Ativo sem prazo", estado: "ativo", marcos: [], registros: [] },
      { nome: "Pausado", estado: "pausado", marcos: [], registros: [] },
      {
        nome: "Ativo urgente",
        estado: "ativo",
        marcos: [{ id: "m", data: "2026-09-18", concluido: false }],
        registros: []
      }
    ];

    expect(ordenarProjetos(projetos, HOJE).map(p => p.nome))
      .toEqual(["Ativo urgente", "Ativo sem prazo", "Pausado", "Concluído"]);
  });
});
