import { useState } from "react";
import { useProjetos } from "../../hooks/useProjetos.js";
import * as store from "../../store/projetos.js";
import ProjetosHeader from "./ProjetosHeader.jsx";
import IndiceProjetos from "./IndiceProjetos.jsx";
import ProjetoWorkspace from "./ProjetoWorkspace.jsx";

export default function ProjetosApp({ aba, onAba, onPersonalizar, onExportar, onImportar, onAtalhos }) {
  const [estado] = useProjetos();
  const [abertoId, setAbertoId] = useState(null);

  /* Um projeto excluído ou ausente cai de volta no índice sem tela em branco. */
  const projeto = abertoId ? store.getProjeto(abertoId) : null;

  function criar() {
    setAbertoId(store.criarProjeto());
  }

  return (
    <>
      <ProjetosHeader
        aba={aba}
        onAba={onAba}
        projeto={projeto}
        total={estado.projetos.length}
        onVoltar={() => setAbertoId(null)}
        onCriar={criar}
        onPersonalizar={onPersonalizar}
        onExportar={onExportar}
        onImportar={onImportar}
        onAtalhos={onAtalhos}
      />

      <div className="conteudo projetos" key={projeto?.id || "indice"}>
        {projeto ? (
          <ProjetoWorkspace projeto={projeto} />
        ) : (
          <IndiceProjetos projetos={estado.projetos} onAbrir={setAbertoId} onCriar={criar} />
        )}
      </div>
    </>
  );
}
