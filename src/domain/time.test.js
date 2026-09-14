import { describe, it, expect } from "vitest";
import {
  toMin, toHHMM, formatarHoras,
  getWeekStartISO, getWeekEnd, deslocarISO, diasEntre,
  isDateInWeek, isSameWeek, getWeekRange, formatarDiaMes
} from "./time.js";

/**
 * Aritmética de data é onde o bug é invisível: a tela continua desenhando,
 * só que com o número errado. Os casos aqui são as bordas — virada de mês,
 * virada de ano, ano bissexto e horário de verão.
 */

describe("conversão de horário", () => {
  it("converte ida e volta", () => {
    expect(toMin("08:00")).toBe(480);
    expect(toMin("23:59")).toBe(1439);
    expect(toHHMM(480)).toBe("08:00");
    expect(toHHMM(1439)).toBe("23:59");
  });

  it("formata duração sem zero à toa", () => {
    expect(formatarHoras(0)).toBe("0h");
    expect(formatarHoras(45)).toBe("45min");
    expect(formatarHoras(60)).toBe("1h");
    expect(formatarHoras(90)).toBe("1h30");
    expect(formatarHoras(605)).toBe("10h05");
  });
});

describe("início da semana", () => {
  it("segunda é o primeiro dia", () => {
    /* 2026-09-14 é uma segunda */
    expect(getWeekStartISO("2026-09-14")).toBe("2026-09-14");
    expect(getWeekStartISO("2026-09-17")).toBe("2026-09-14");
    expect(getWeekStartISO("2026-09-20")).toBe("2026-09-14");
  });

  it("domingo pertence à semana que começou na segunda anterior", () => {
    /* O erro clássico: domingo cair na semana seguinte. */
    expect(getWeekStartISO("2026-09-20")).toBe("2026-09-14");
    expect(getWeekStartISO("2026-09-21")).toBe("2026-09-21");
  });

  it("atravessa a virada de mês", () => {
    expect(getWeekStartISO("2026-10-01")).toBe("2026-09-28");
  });

  it("atravessa a virada de ano", () => {
    expect(getWeekStartISO("2027-01-01")).toBe("2026-12-28");
  });
});

describe("deslocamento de datas", () => {
  it("soma e subtrai dias atravessando o mês", () => {
    expect(deslocarISO("2026-09-30", 1)).toBe("2026-10-01");
    expect(deslocarISO("2026-10-01", -1)).toBe("2026-09-30");
  });

  it("respeita ano bissexto", () => {
    expect(deslocarISO("2028-02-28", 1)).toBe("2028-02-29");
    expect(deslocarISO("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("sobrevive ao horário de verão", () => {
    /* Datas ISO montadas com horário local: se a implementação usasse
       aritmética de milissegundos, um dia de 23h quebraria aqui. */
    expect(deslocarISO("2026-10-17", 1)).toBe("2026-10-18");
    expect(deslocarISO("2026-02-20", 1)).toBe("2026-02-21");
  });

  it("conta a distância entre datas", () => {
    expect(diasEntre("2026-09-14", "2026-09-20")).toBe(6);
    expect(diasEntre("2026-09-20", "2026-09-14")).toBe(-6);
    expect(diasEntre("2026-09-14", "2026-09-14")).toBe(0);
    expect(diasEntre("2026-12-28", "2027-01-04")).toBe(7);
  });
});

describe("pertencimento à semana", () => {
  it("inclui os dois extremos", () => {
    expect(isDateInWeek("2026-09-14", "2026-09-14")).toBe(true);
    expect(isDateInWeek("2026-09-20", "2026-09-14")).toBe(true);
    expect(isDateInWeek("2026-09-13", "2026-09-14")).toBe(false);
    expect(isDateInWeek("2026-09-21", "2026-09-14")).toBe(false);
  });

  it("compara semanas", () => {
    expect(isSameWeek("2026-09-14", "2026-09-20")).toBe(true);
    expect(isSameWeek("2026-09-20", "2026-09-21")).toBe(false);
  });
});

describe("intervalo da semana", () => {
  it("entrega sete dias em ordem, de segunda a domingo", () => {
    const r = getWeekRange("2026-09-16", "2026-09-17");
    expect(r.dias).toHaveLength(7);
    expect(r.inicioISO).toBe("2026-09-14");
    expect(r.fimISO).toBe("2026-09-20");
    expect(r.dias[0].iso).toBe("2026-09-14");
    expect(r.dias[6].iso).toBe("2026-09-20");
    expect(r.dias.map(d => d.curto)).toEqual(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]);
  });

  it("marca hoje e o fim de semana", () => {
    const r = getWeekRange("2026-09-14", "2026-09-17");
    expect(r.contemHoje).toBe(true);
    expect(r.dias.filter(d => d.hoje).map(d => d.iso)).toEqual(["2026-09-17"]);
    expect(r.dias.filter(d => d.fimDeSemana).map(d => d.curto)).toEqual(["Sáb", "Dom"]);
  });

  it("não marca hoje quando a data está fora", () => {
    const r = getWeekRange("2026-09-14", "2026-10-01");
    expect(r.contemHoje).toBe(false);
    expect(r.dias.some(d => d.hoje)).toBe(false);
  });

  it("rotula semana que cruza dois meses", () => {
    const r = getWeekRange("2026-09-30", "2026-09-30");
    expect(r.inicioISO).toBe("2026-09-28");
    expect(r.fimISO).toBe("2026-10-04");
    expect(r.rotuloCurto).toContain("set");
    expect(r.rotuloCurto).toContain("out");
  });
});

describe("formatação de data", () => {
  it("mostra dia e mês com dois dígitos", () => {
    expect(formatarDiaMes("2026-09-07")).toBe("07/09");
    expect(formatarDiaMes("2026-12-31")).toBe("31/12");
  });
});
