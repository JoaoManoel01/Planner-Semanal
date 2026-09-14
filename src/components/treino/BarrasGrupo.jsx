import { GRUPOS } from "../../domain/treinos.js";
import { formatarCarga } from "./formato.js";

/**
 * Distribuição por grupo muscular em barras — leitura ordenada do mesmo dado
 * que o mapa e o octógono mostram em forma espacial.
 */
export default function BarrasGrupo({ porGrupo, intensidades }) {
  const linhas = GRUPOS
    .map(g => ({ ...g, carga: porGrupo[g.id] || 0, intensidade: intensidades[g.id] || 0 }))
    .sort((a, b) => b.carga - a.carga);

  return (
    <ul className="barras-grupo">
      {linhas.map(g => (
        <li key={g.id} className={g.carga ? "" : "is-vazio"}>
          <span className="barra-nome">{g.nome}</span>
          <span className="barra-trilho">
            <i className="barra-preenchimento" style={{ width: Math.round(g.intensidade * 100) + "%" }} />
          </span>
          <span className="barra-valor">
            {g.carga ? <>{formatarCarga(g.carga)}<em>kg</em></> : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}
