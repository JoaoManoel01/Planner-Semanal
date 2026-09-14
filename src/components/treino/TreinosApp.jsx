import { useState } from "react";
import { useTreinos } from "../../hooks/useTreinos.js";
import { getWeekRange, getWeekStartISO, deslocarISO, hojeISO } from "../../domain/time.js";
import { getWeekStatus } from "../../domain/week.js";
import { resumoDaSemanaDeTreino, tendenciaDePeso, diaDaSemana } from "../../domain/treinos.js";
import Segmentado from "../ui/Segmentado.jsx";
import TreinosHeader from "./TreinosHeader.jsx";
import StatusTreino from "./StatusTreino.jsx";
import PlanoTreino from "./PlanoTreino.jsx";
import SessaoDia from "./SessaoDia.jsx";
import Corpo from "./Corpo.jsx";
import Progressao from "./Progressao.jsx";
import PesoCorporal from "./PesoCorporal.jsx";

const VISOES = [
  { id: "plano", nome: "Plano" },
  { id: "sessao", nome: "Sessão" },
  { id: "corpo", nome: "Corpo" },
  { id: "progressao", nome: "Progressão" },
  { id: "peso", nome: "Peso" }
];

export default function TreinosApp({ aba, onAba, onPersonalizar, onExportar, onImportar, onAtalhos }) {
  const [estado] = useTreinos();
  const [visao, setVisao] = useState("plano");
  const [semanaISO, setSemanaISO] = useState(() => getWeekStartISO(hojeISO()));
  const [diaISO, setDiaISO] = useState(hojeISO);

  const range = getWeekRange(semanaISO);
  const status = getWeekStatus(semanaISO);
  const resumo = resumoDaSemanaDeTreino(estado, semanaISO);
  const peso = tendenciaDePeso(estado.pesagens);

  /* A semana é o eixo: ao mudar de semana, o dia selecionado acompanha o mesmo dia útil. */
  function navegar(delta) {
    const proxima = deslocarISO(semanaISO, delta * 7);
    setSemanaISO(proxima);
    setDiaISO(deslocarISO(proxima, diaDaSemana(diaISO)));
  }

  function irParaHoje() {
    setSemanaISO(getWeekStartISO(hojeISO()));
    setDiaISO(hojeISO());
  }

  function abrirDia(iso) {
    setDiaISO(iso);
    setVisao("sessao");
  }

  function registrarTreino() {
    abrirDia(range.contemHoje ? hojeISO() : range.inicioISO);
  }

  const props = { estado, range, semanaISO, diaISO, resumo, onDia: abrirDia, onVisao: setVisao };

  return (
    <>
      <TreinosHeader
        aba={aba}
        onAba={onAba}
        range={range}
        status={status}
        onNavegar={navegar}
        onHoje={irParaHoje}
        onRegistrar={registrarTreino}
        onPersonalizar={onPersonalizar}
        onExportar={onExportar}
        onImportar={onImportar}
        onAtalhos={onAtalhos}
      />

      <div className="conteudo treinos" key={semanaISO}>
        <StatusTreino resumo={resumo} peso={peso} dias={range.dias} onDia={abrirDia} />

        <Segmentado
          itens={VISOES}
          valor={visao}
          onMudar={setVisao}
          rotulo="Seções do módulo de treinos"
        />

        {visao === "plano" && <PlanoTreino {...props} />}
        {visao === "sessao" && <SessaoDia {...props} />}
        {visao === "corpo" && <Corpo {...props} />}
        {visao === "progressao" && <Progressao {...props} />}
        {visao === "peso" && <PesoCorporal {...props} />}
      </div>
    </>
  );
}
