import { useEffect } from "react";

const EDITAVEIS = ["INPUT", "SELECT", "TEXTAREA"];

/** Atalhos globais de teclado — ignorados enquanto se digita. */
export function useAtalhos(mapa, ativo = true) {
  useEffect(() => {
    if (!ativo) return;
    function aoTeclar(e) {
      const alvo = e.target;
      if (EDITAVEIS.includes(alvo?.tagName) || alvo?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const acao = mapa[e.key] || mapa[e.key.toLowerCase()];
      if (!acao) return;
      e.preventDefault();
      acao(e);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [mapa, ativo]);
}
