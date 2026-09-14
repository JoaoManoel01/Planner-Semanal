import { useEffect, useRef } from "react";
import { IconClose } from "../ui/Icon.jsx";

/**
 * Superfície de diálogo compartilhada — mesmos tokens do resto do sistema.
 *
 * O foco é dado UMA vez, na montagem: o pai re-renderiza a cada tique do
 * relógio e a cada gravação, e refocar nessas horas roubaria o campo
 * debaixo dos dedos de quem está digitando.
 */
export default function Modal({ titulo, descricao, largura, onClose, children, rodape }) {
  const caixa = useRef(null);
  const fechar = useRef(onClose);
  fechar.current = onClose;

  useEffect(() => {
    const esc = e => { if (e.key === "Escape") fechar.current(); };
    document.addEventListener("keydown", esc);

    const corpo = caixa.current?.querySelector(".modal-corpo");
    const primeiro = corpo?.querySelector("input, select, textarea, button, [tabindex]");
    (primeiro || caixa.current)?.focus();

    return () => document.removeEventListener("keydown", esc);
  }, []);

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        ref={caixa}
        tabIndex={-1}
        style={largura ? { maxWidth: largura } : undefined}
      >
        <header className="modal-cabeca">
          <div>
            <h2 className="modal-titulo">{titulo}</h2>
            {descricao && <p className="modal-descricao">{descricao}</p>}
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Fechar" onClick={onClose}>
            <IconClose />
          </button>
        </header>

        <div className="modal-corpo">{children}</div>

        {rodape && <footer className="modal-rodape">{rodape}</footer>}
      </div>
    </div>
  );
}
