import { useEffect, useState } from "react";

/**
 * Relógio compartilhado: um único timer alinhado ao minuto.
 * Só os componentes que dependem do tempo re-renderizam.
 */
const ouvintes = new Set();
let timer = null;

function agendar() {
  const agora = new Date();
  const atraso = 60000 - (agora.getSeconds() * 1000 + agora.getMilliseconds());
  timer = setTimeout(() => {
    const d = new Date();
    ouvintes.forEach(fn => fn(d));
    agendar();
  }, Math.max(1000, atraso));
}

export function useNow() {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    ouvintes.add(setAgora);
    if (!timer) agendar();
    return () => {
      ouvintes.delete(setAgora);
      if (!ouvintes.size) { clearTimeout(timer); timer = null; }
    };
  }, []);

  return agora;
}

export function minutosDoDia(data) {
  return data.getHours() * 60 + data.getMinutes();
}
