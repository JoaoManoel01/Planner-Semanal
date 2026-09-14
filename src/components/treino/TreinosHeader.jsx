import {
  IconChevronLeft, IconChevronRight, IconPlus, IconSliders,
  IconDownload, IconUpload, IconKeyboard
} from "../ui/Icon.jsx";
import BrandRow from "../layout/BrandRow.jsx";
import MenuFerramentas from "../layout/MenuFerramentas.jsx";

/**
 * Cabeçalho do módulo Treinos.
 * Mesma estrutura do cabeçalho da agenda: marca + módulo, depois período + ação.
 * A semana é o eixo do módulo inteiro — não de cada visão isolada.
 */
export default function TreinosHeader({
  aba, onAba, range, status, onNavegar, onHoje, onRegistrar,
  onPersonalizar, onExportar, onImportar, onAtalhos
}) {
  const ferramentas = [
    { id: "exportar", rotulo: "Exportar dados", icone: IconDownload, onClick: onExportar },
    { id: "importar", rotulo: "Importar dados", icone: IconUpload, onClick: onImportar },
    { id: "atalhos", rotulo: "Atalhos de teclado", icone: IconKeyboard, onClick: onAtalhos, separador: true }
  ];

  return (
    <header className="cabecalho">
      <BrandRow aba={aba} onAba={onAba}>
        <button type="button" className="btn btn-ghost" onClick={onPersonalizar}>
          <IconSliders />Personalizar
        </button>
        <MenuFerramentas acoes={ferramentas} />
      </BrandRow>

      <div className="cabecalho-linha cabecalho-tempo">
        <div className="navegacao">
          <div className="nav-grupo" role="group" aria-label="Navegação entre semanas">
            <button type="button" className="nav-btn" onClick={() => onNavegar(-1)} aria-label="Semana anterior">
              <IconChevronLeft />
            </button>
            <button
              type="button"
              className={"nav-btn nav-hoje" + (status === "atual" ? " is-atual" : "")}
              onClick={onHoje}
            >
              Hoje
            </button>
            <button type="button" className="nav-btn" onClick={() => onNavegar(1)} aria-label="Próxima semana">
              <IconChevronRight />
            </button>
          </div>

          <div className="periodo">
            <h1 className="periodo-titulo">{range.rotuloCurto}</h1>
            <p className="periodo-detalhe">
              {range.rotulo}
              <span className={"periodo-estado estado-" + status}>
                {status === "atual" ? "semana corrente" : status === "passada" ? "semana passada" : "semana futura"}
              </span>
            </p>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={onRegistrar}>
          <IconPlus />Registrar treino
        </button>
      </div>
    </header>
  );
}
