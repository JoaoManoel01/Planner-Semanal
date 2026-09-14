import { useState } from "react";
import * as store from "../../store/treinos.js";
import { hojeISO, formatarDiaMes } from "../../domain/time.js";
import { mediaMovel, tendenciaDePeso } from "../../domain/treinos.js";
import { IconPlus, IconTrash } from "../ui/Icon.jsx";
import GraficoLinha from "../ui/GraficoLinha.jsx";
import { formatarPeso, formatarDelta, direcao } from "./formato.js";

export default function PesoCorporal({ estado }) {
  const [data, setData] = useState(hojeISO);
  const [peso, setPeso] = useState("");

  const existente = store.getPesagem(data);
  const pontos = mediaMovel(estado.pesagens);
  const tendencia = tendenciaDePeso(estado.pesagens);
  const delta = tendencia ? formatarDelta(tendencia.delta) : null;

  const ultimas = [...(estado.pesagens || [])]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .slice(0, 14);

  function salvar(e) {
    e.preventDefault();
    const v = Number(peso);
    if (v > 0) {
      store.salvarPesagem(data, v);
      setPeso("");
    }
  }

  return (
    <div className="peso">
      <section className="treino-card">
        <header className="card-topo">
          <div>
            <h3>Peso corporal</h3>
            <p className="card-contexto">
              {tendencia
                ? <>Última pesagem em {formatarDiaMes(tendencia.data)}</>
                : "Nenhuma pesagem registrada"}
            </p>
          </div>

          {tendencia && (
            <div className="peso-atual">
              <strong>{formatarPeso(tendencia.peso)}</strong>
              <span>kg</span>
              {delta && delta !== "estável" && (
                <i className={"selo-delta dir-" + direcao(tendencia.delta)}>{delta}kg · 7d</i>
              )}
            </div>
          )}
        </header>

        <form className="peso-form" onSubmit={salvar}>
          <label className="ex-campo">
            <span>Data</span>
            <input className="input" type="date" value={data} onChange={e => setData(e.target.value)} />
          </label>

          <label className="ex-campo">
            <span>Peso em jejum</span>
            <div className="campo-unidade">
              <input
                className="input"
                type="number"
                step="0.1"
                min="0"
                value={peso}
                placeholder={existente ? formatarPeso(existente.pesoKg) : "78,4"}
                onChange={e => setPeso(e.target.value)}
              />
              <i>kg</i>
            </div>
          </label>

          <button type="submit" className="btn btn-primary">
            <IconPlus />{existente ? "Atualizar" : "Registrar"}
          </button>
        </form>

        {pontos.length > 1 ? (
          <div className="peso-curva">
            <div className="grafico-legenda">
              <span className="legenda-item"><i className="amostra peso" />pesagem</span>
              <span className="legenda-item"><i className="amostra rm" />média de 7 dias</span>
            </div>
            <GraficoLinha
              series={[
                { valores: pontos.map(p => p.peso), classe: "peso" },
                { valores: pontos.map(p => p.media), classe: "rm" }
              ]}
              altura={190}
              rotulos={pontos.map(p => formatarDiaMes(p.data))}
              formatar={formatarPeso}
              unidade="kg"
            />
          </div>
        ) : (
          <div className="estado-vazio">
            <p>{pontos.length ? "Mais uma pesagem e a curva aparece." : "Registre a primeira pesagem."}</p>
            <span className="dica">A média de 7 dias filtra a variação diária de água e sal.</span>
          </div>
        )}
      </section>

      {ultimas.length > 0 && (
        <section className="treino-card">
          <header className="card-topo">
            <div><h3>Últimas pesagens</h3></div>
          </header>

          <ul className="peso-ultimas">
            {ultimas.map(p => (
              <li key={p.data} className={"peso-chip" + (p.data === data ? " is-ativa" : "")}>
                <span className="peso-chip-data">{formatarDiaMes(p.data)}</span>
                <b>{formatarPeso(p.pesoKg)}<em>kg</em></b>
                <button
                  type="button"
                  className="acao-mini perigo"
                  aria-label={`Remover pesagem de ${formatarDiaMes(p.data)}`}
                  onClick={() => store.removerPesagem(p.data)}
                >
                  <IconTrash size={12} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
