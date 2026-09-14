import { useEffect, useState } from "react";
import * as projetos from "../store/projetos.js";

/**
 * Assina o store de projetos.
 * @returns {[object, number]} [estado, versao]
 */
export function useProjetos() {
  const [versao, setVersao] = useState(0);
  useEffect(() => projetos.assinar(() => setVersao(v => v + 1)), []);
  return [projetos.getEstado(), versao];
}
