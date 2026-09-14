import { useEffect, useRef, useState } from "react";
import {
  IconOrbit, IconChevronLeft, IconChevronRight, IconPlus, IconTag,
  IconSliders, IconMoreVertical, IconDownload, IconUpload, IconKeyboard, IconCalendar, IconCopy
} from "../ui/Icon.jsx";

function MenuFerramentas({ acoes }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = e => { if (!ref.current?.contains(e.target)) setAberto(false); };
    const esc = e => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        type="button"
        className={"btn btn-ghost btn-icon" + (aberto ? " is-active" : "")}
        aria-label="Mais ferramentas"
        aria-expanded={aberto}
        onClick={() => setAberto(a => !a)}
      >
        <IconMoreVertical />
      </button>

      {aberto && (
        <div className="menu" role="menu">
          {acoes.map(({ id, rotulo, icone: Icone, onClick, separador }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              className={"menu-item" + (separador ? " com-separador" : "")}
              onClick={() => { setAberto(false); onClick(); }}
            >
              <Icone />
              {rotulo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppHeader({
  range, status, onNavegar, onHoje, onNova, onNovoEvento,
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
      <div className="cabecalho-linha cabecalho-marca">
        <div className="marca">
          <span className="marca-glifo"><IconOrbit size={20} /></span>
          <span className="marca-nome">ORBIT</span>
          <span className="marca-sep" aria-hidden="true" />
          <span className="marca-modulo">Agenda semanal</span>
        </div>

        <div className="cabecalho-ferramentas">
          <button type="button" className="btn btn-ghost" onClick={onCategorias}>
            <IconTag />Categorias
          </button>
          <button type="button" className="btn btn-ghost" onClick={onPersonalizar}>
            <IconSliders />Personalizar
          </button>
          <MenuFerramentas acoes={ferramentas} />
        </div>
      </div>

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
