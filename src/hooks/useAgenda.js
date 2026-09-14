import { useEffect, useState } from "react";
import * as store from "../agenda.js";

/**
 * Assina o store da aplicação.
 * O estado é mutado no lugar, então a versão é o que invalida memos.
 * @returns {[object, number]} [estado, versao]
 */
export function useAgenda() {
  const [versao, setVersao] = useState(0);
  useEffect(() => store.assinar(() => setVersao(v => v + 1)), []);
  return [store.getEstado(), versao];
}
