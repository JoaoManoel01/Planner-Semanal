import { useState } from "react";
import { DIAS_SEMANA } from "../../domain/time.js";
import {
  cargaPorGrupo,
  indiceExercicios,
  normalizarIntensidades,
  diaDaSemana
} from "../../domain/treinos.js";
import * as store from "../../store/treinos.js";
import Segmentado from "../ui/Segmentado.jsx";
import MapaCorporal from "./MapaCorporal.jsx";
import BarrasGrupo from "./BarrasGrupo.jsx";
import { formatarCarga } from "./formato.js";

const MODOS = [
  { id: "dia", nome: "Dia" },
  { id: "semana", nome: "Semana" }
];

export default function Corpo({ estado, range, diaISO, resumo }) {
  const [modo, setModo] = useState("dia");
  const indice = indiceExercicios(estado.plano);

  const registrosDoDia = store.getSessao(diaISO)?.registros || [];
  const porGrupo = modo === "dia" ? cargaPorGrupo(registrosDoDia, indice) : resumo.porGrupo;
  const intensidades = normalizarIntensidades(porGrupo);

  const total = Object.values(porGrupo).reduce((t, v) => t + v, 0);
  const contexto = modo === "dia" ? DIAS_SEMANA[diaDaSemana(diaISO)] : range.rotuloCurto;

  return (
    <section className="treino-card corpo-view">
      <header className="card-topo">
        <div>
          <h3>Mapa de esforço</h3>
          <p className="card-contexto">
            {contexto}
            {total > 0 && <> · <b>{formatarCarga(total)}kg</b> distribuídos</>}
          </p>
        </div>
        <Segmentado itens={MODOS} valor={modo} onMudar={setModo} rotulo="Recorte do mapa" tom="discreto" />
      </header>

      {total > 0 ? (
        <div className="corpo-conteudo">
          <MapaCorporal intensidades={intensidades} />
          <BarrasGrupo porGrupo={porGrupo} intensidades={intensidades} />
        </div>
      ) : (
        <div className="estado-vazio">
          <p>
            {modo === "dia"
              ? `Nenhum registro em ${contexto.toLowerCase()}.`
              : "Nenhum registro nesta semana."}
          </p>
          <span className="dica">O mapa acende conforme você registra as séries.</span>
        </div>
      )}
    </section>
  );
}
