import {
  IconChevronLeft, IconChevronRight, IconPlus, IconTag,
  IconSliders, IconDownload, IconUpload, IconKeyboard, IconCalendar, IconCopy
} from "../ui/Icon.jsx";
import BrandRow from "../layout/BrandRow.jsx";
import MenuFerramentas from "../layout/MenuFerramentas.jsx";

export default function AgendaHeader({
  aba, onAba, range, status, onNavegar, onHoje, onNova, onNovoEvento,
  onCategorias, onPersonalizar, onExportar, onImportar, onDuplicar, onAtalhos
}) {
  const ferramentas = [
    { id: "evento", rotulo: "Novo evento temporal", icone: IconCalendar, onClick: onNovoEvento },
    { id: "duplicar", rotulo: "Repetir outra semana aqui", icone: IconCopy, onClick: onDuplicar },
    { id: "exportar", rotulo: "Exportar dados", icone: IconDownload, onClick: onExportar, separador: true },
    { id: "importar", rotulo: "Importar dados", icone: IconUpload, onClick: onImportar },
    { id: "atalhos", rotulo: "Atalhos de teclado", icone: IconKeyboard, onClick: onAtalhos, separador: true }
  ];

  return (
    <header className="cabecalho">
      <BrandRow aba={aba} onAba={onAba}>
        <button type="button" className="btn btn-ghost" onClick={onCategorias}>
          <IconTag />Categorias
        </button>
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

        <button type="button" className="btn btn-primary" onClick={onNova}>
          <IconPlus />Nova atividade
        </button>
      </div>
    </header>
  );
}
