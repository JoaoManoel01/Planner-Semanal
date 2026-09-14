import { describe, it, expect, beforeEach, vi } from "vitest";
import { lerEstado, escreverEstado, aoFalhar, listarQuarentenas } from "./persistencia.js";

/**
 * O comportamento crítico aqui é um só: estado ilegível NUNCA pode ser
 * sobrescrito em silêncio. É o caminho que apaga dado sem ninguém perceber.
 */

function memoriaFalsa() {
  const dados = new Map();
  return {
    get length() { return dados.size; },
    key: i => [...dados.keys()][i] ?? null,
    getItem: c => (dados.has(c) ? dados.get(c) : null),
    setItem: (c, v) => dados.set(c, String(v)),
    removeItem: c => dados.delete(c),
    clear: () => dados.clear(),
    _dados: dados
  };
}

const vazio = () => ({ versao: 1, itens: [] });
const interpretar = obj => (obj?.versao === 1 && Array.isArray(obj.itens) ? obj : null);

beforeEach(() => {
  globalThis.localStorage = memoriaFalsa();
});

describe("leitura", () => {
  it("devolve o estado gravado quando é válido", () => {
    localStorage.setItem("k", JSON.stringify({ versao: 1, itens: [1, 2] }));
    expect(lerEstado("k", interpretar, vazio).itens).toEqual([1, 2]);
  });

  it("chave inexistente devolve o estado vazio, sem quarentena", () => {
    expect(lerEstado("k", interpretar, vazio)).toEqual(vazio());
    expect(listarQuarentenas()).toEqual([]);
  });

  it("JSON quebrado é posto em quarentena antes de devolver vazio", () => {
    localStorage.setItem("k", "{isso não é json");
    const estado = lerEstado("k", interpretar, vazio);

    expect(estado).toEqual(vazio());
    const quarentenas = listarQuarentenas();
    expect(quarentenas).toHaveLength(1);
    expect(localStorage.getItem(quarentenas[0])).toBe("{isso não é json");
  });

  it("formato válido em JSON mas inesperado também vai para quarentena", () => {
    localStorage.setItem("k", JSON.stringify({ versao: 99 }));
    lerEstado("k", interpretar, vazio);
    expect(listarQuarentenas()).toHaveLength(1);
  });

  it("o conteúdo original continua recuperável depois da falha", () => {
    const original = JSON.stringify({ versao: 1, itens: "quase certo" });
    localStorage.setItem("k", original);

    lerEstado("k", interpretar, vazio);
    /* Simula o app gravando por cima logo em seguida. */
    escreverEstado("k", vazio());

    const copia = listarQuarentenas().map(c => localStorage.getItem(c));
    expect(copia).toContain(original);
  });

  it("avisa quem estiver escutando", () => {
    const espiao = vi.fn();
    const parar = aoFalhar(espiao);

    localStorage.setItem("k", "quebrado");
    lerEstado("k", interpretar, vazio);

    expect(espiao).toHaveBeenCalledTimes(1);
    expect(espiao.mock.calls[0][0]).toMatchObject({ tipo: "corrompido", chave: "k" });
    parar();
  });
});

describe("escrita", () => {
  it("grava e confirma", () => {
    expect(escreverEstado("k", { versao: 1, itens: [] })).toBe(true);
    expect(JSON.parse(localStorage.getItem("k")).versao).toBe(1);
  });

  it("cota estourada devolve falso e anuncia, em vez de engolir", () => {
    const espiao = vi.fn();
    const parar = aoFalhar(espiao);

    localStorage.setItem = () => {
      const erro = new Error("cheio");
      erro.name = "QuotaExceededError";
      throw erro;
    };

    expect(escreverEstado("k", { versao: 1 })).toBe(false);
    expect(espiao.mock.calls[0][0]).toMatchObject({ tipo: "cota" });
    parar();
  });
});

describe("assinatura", () => {
  it("cancelar impede novas notificações", () => {
    const espiao = vi.fn();
    aoFalhar(espiao)();

    localStorage.setItem("k", "quebrado");
    lerEstado("k", interpretar, vazio);

    expect(espiao).not.toHaveBeenCalled();
  });

  it("um ouvinte que lança não impede os outros", () => {
    const bom = vi.fn();
    const pararRuim = aoFalhar(() => { throw new Error("ops"); });
    const pararBom = aoFalhar(bom);

    localStorage.setItem("k", "quebrado");
    expect(() => lerEstado("k", interpretar, vazio)).not.toThrow();
    expect(bom).toHaveBeenCalled();

    pararRuim();
    pararBom();
  });
});
