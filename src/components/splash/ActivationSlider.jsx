import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DISCO = 44;
const LIMIAR = 0.85;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" className="disco-seta" aria-hidden="true" focusable="false">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * Ativador por arrasto — a alça é o disco da marca.
 * Arraste até o fim, ou pressione Enter / Espaço / seta direita.
 */
export default function ActivationSlider({ progress, onProgress, onComplete }) {
  const trilhoRef = useRef(null);
  const raf = useRef(null);
  const [largura, setLargura] = useState(0);
  const [arrastando, setArrastando] = useState(false);

  useLayoutEffect(() => {
    const medir = () => setLargura(trilhoRef.current?.offsetWidth || 0);
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const completo = progress >= 1;
  const curso = Math.max(0, largura - DISCO - 8);
  const discoEsquerda = 4 + progress * curso;

  function medirPonteiro(clientX) {
    const r = trilhoRef.current.getBoundingClientRect();
    const c = Math.max(0, r.width - DISCO - 8);
    if (!c) return 0;
    return Math.max(0, Math.min(1, (clientX - r.left - 4 - DISCO / 2) / c));
  }

  function aoPressionar(e) {
    if (completo) return;
    e.preventDefault();
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ponteiro sintético */ }
    cancelAnimationFrame(raf.current);
    setArrastando(true);
    onProgress(medirPonteiro(e.clientX));
  }

  function aoMover(e) {
    if (!arrastando) return;
    onProgress(medirPonteiro(e.clientX));
  }

  function aoSoltar(e) {
    if (!arrastando) return;
    e.stopPropagation();
    setArrastando(false);
    const p = medirPonteiro(e.clientX);
    if (p >= LIMIAR) {
      onProgress(1);
      onComplete();
    } else {
      recuar(p);
    }
  }

  function recuar(de) {
    cancelAnimationFrame(raf.current);
    const inicio = performance.now();
    const passo = agora => {
      const t = Math.min(1, (agora - inicio) / 280);
      const suave = 1 - Math.pow(1 - t, 3);
      onProgress(de * (1 - suave));
      if (t < 1) raf.current = requestAnimationFrame(passo);
    };
    raf.current = requestAnimationFrame(passo);
  }

  function aoTeclar(e) {
    if (completo) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      onProgress(1);
      onComplete();
    }
  }

  return (
    <div
      className={"ativador" + (arrastando ? " arrastando" : "") + (completo ? " completo" : "")}
      ref={trilhoRef}
      role="slider"
      aria-label="Arraste para ativar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onPointerDown={aoPressionar}
      onPointerMove={aoMover}
      onPointerUp={aoSoltar}
      onPointerCancel={aoSoltar}
      onKeyDown={aoTeclar}
      onClick={e => e.stopPropagation()}
      style={{ "--p": progress }}
    >
      <span className="ativador-preenchimento" style={{ width: discoEsquerda + DISCO / 2 }} />

      <span className="ativador-rotulo" style={{ opacity: Math.max(0, 1 - progress * 2.2) }}>
        Arraste para ativar
      </span>
      <span className="ativador-rotulo ativador-pronto" style={{ opacity: completo ? 1 : 0 }}>
        Ativo
      </span>

      <span className="ativador-disco" style={{ left: discoEsquerda }}>
        <Seta />
      </span>
    </div>
  );
}
