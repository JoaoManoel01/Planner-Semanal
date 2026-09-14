import { useCallback, useEffect, useRef, useState } from "react";
import OrbitField from "./OrbitField.jsx";
import Reticle from "./Reticle.jsx";
import ActivationSlider from "./ActivationSlider.jsx";
import "../../styles/splash.css";

function GlifoCanto() {
  return (
    <svg className="canto-glifo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="2" y1="12" x2="8" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SplashScreen({ onEntered }) {
  const [progresso, setProgresso] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const temporizador = useRef(null);
  const palco = useRef(null);

  const concluir = useCallback(() => {
    if (temporizador.current) return;
    setSaindo(true);
    temporizador.current = setTimeout(onEntered, 680);
  }, [onEntered]);

  useEffect(() => {
    palco.current?.querySelector(".ativador")?.focus();
    return () => clearTimeout(temporizador.current);
  }, []);

  return (
    <div className={"splash" + (saindo ? " saindo" : "")} ref={palco} style={{ "--p": progresso }}>
      <div className="splash-fundo" aria-hidden="true" />
      <OrbitField progress={progresso} saindo={saindo} />
      <span className="splash-eixo-vertical" aria-hidden="true" />

      <div className="splash-cantos" aria-hidden="true">
        <span className="canto canto-se">
          <GlifoCanto />
          <em>ORBIT</em>
        </span>
        <span className="canto canto-sd">sua semana <i>/</i> seu controle</span>
        <span className="canto canto-ie"><b /> <span className="canto-versao">v1.0.0</span> <i>/</i> app local</span>
        <span className="canto canto-id">planejar <i>/</i> organizar <i>/</i> evoluir <b /></span>
      </div>

      <div className="splash-nucleo">
        <Reticle progress={progresso} saindo={saindo} />
        <h1 className="splash-marca">ORBIT</h1>
        <p className="splash-linha">Domínio sobre a sua semana.</p>

        <ActivationSlider
          progress={progresso}
          onProgress={setProgresso}
          onComplete={concluir}
        />
      </div>

      {saindo && <div className="splash-clarao" aria-hidden="true" />}
    </div>
  );
}
