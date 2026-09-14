import { useEffect, useState } from "react";
import * as treinos from "../store/treinos.js";

/**
 * Assina o store de treinos.
 * @returns {[object, number]} [estado, versao]
 */
export function useTreinos() {
  const [versao, setVersao] = useState(0);
  useEffect(() => treinos.assinar(() => setVersao(v => v + 1)), []);
  return [treinos.getEstado(), versao];
}
