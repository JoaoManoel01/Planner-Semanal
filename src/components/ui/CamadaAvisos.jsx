import { useEffect, useRef, useState } from "react";
import { assinarAvisos, getAvisos, responderConfirmacao, descartarAviso } from "./avisos.js";
import { IconAlert, IconCheck, IconUndo, IconClose } from "./Icon.jsx";

function Confirmacao({ dados }) {
  const botao = useRef(null);

  useEffect(() => {
    botao.current?.focus();
    const tecla = e => {
      if (e.key === "Escape") { e.preventDefault(); responderConfirmacao(false); }
      if (e.key === "Enter") { e.preventDefault(); responderConfirmacao(true); }
    };
    document.addEventListener("keydown", tecla, true);
    return () => document.removeEventListener("keydown", tecla, true);
  }, [dados.id]);

  return (
    <div
      className="overlay overlay-confirmacao"
      onMouseDown={e => e.target === e.currentTarget && responderConfirmacao(false)}
    >
      <div className={"modal modal-confirmacao" + (dados.perigo ? " perigo" : "")} role="alertdialog" aria-modal="true">
        <div className="confirmacao-corpo">
          <span className="confirmacao-icone"><IconAlert size={18} /></span>
          <div>
            <h2 className="confirmacao-titulo">{dados.titulo}</h2>
            {dados.corpo && <p className="confirmacao-texto">{dados.corpo}</p>}
          </div>
        </div>
        <div className="confirmacao-acoes">
          <button type="button" className="btn btn-ghost" onClick={() => responderConfirmacao(false)}>
            {dados.cancelar}
          </button>
          <button
            type="button"
            ref={botao}
            className={"btn " + (dados.perigo ? "btn-danger btn-solido" : "btn-primary")}
            onClick={() => responderConfirmacao(true)}
          >
            {dados.acao}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Camada única de avisos: confirmações modais e notificações discretas. */
export default function CamadaAvisos() {
  const [estado, setEstado] = useState(getAvisos);

  useEffect(() => assinarAvisos(setEstado), []);

  return (
    <>
      {estado.confirmacao && <Confirmacao dados={estado.confirmacao} />}

      {estado.avisos.length > 0 && (
        <div className="avisos" role="status" aria-live="polite">
          {estado.avisos.map(aviso => (
            <div key={aviso.id} className={"aviso tipo-" + aviso.tipo}>
              <span className="aviso-icone">
                {aviso.tipo === "erro" ? <IconAlert size={14} /> : <IconCheck size={14} />}
              </span>
              <span className="aviso-texto">{aviso.texto}</span>
              {aviso.desfazer && (
                <button
                  type="button"
                  className="aviso-acao"
                  onClick={() => { aviso.desfazer(); descartarAviso(aviso.id); }}
                >
                  <IconUndo size={13} />Desfazer
                </button>
              )}
              <button
                type="button"
                className="aviso-fechar"
                aria-label="Dispensar aviso"
                onClick={() => descartarAviso(aviso.id)}
              >
                <IconClose size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
