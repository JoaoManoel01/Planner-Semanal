import { useEffect, useRef, useState } from "react";
import { IconMoreVertical } from "../ui/Icon.jsx";

/** Ações secundárias do cabeçalho — compartilhado pelos módulos. */
export default function MenuFerramentas({ acoes }) {
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
