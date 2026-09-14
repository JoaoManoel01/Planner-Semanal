import { IconOrbit } from "../ui/Icon.jsx";
import Segmentado from "../ui/Segmentado.jsx";

const MODULOS = [
  { id: "agenda", nome: "Agenda" },
  { id: "treinos", nome: "Treinos" },
  { id: "projetos", nome: "Projetos" }
];

/**
 * Primeira linha do cabeçalho — idêntica em todos os módulos.
 * A troca de módulo vive aqui, no lugar onde antes havia só um rótulo fixo.
 */
export default function BrandRow({ aba, onAba, children }) {
  return (
    <div className="cabecalho-linha cabecalho-marca">
      <div className="marca">
        <span className="marca-glifo"><IconOrbit size={20} /></span>
        <span className="marca-nome">ORBIT</span>
        <span className="marca-sep" aria-hidden="true" />
        <Segmentado
          itens={MODULOS}
          valor={aba}
          onMudar={onAba}
          rotulo="Módulos do ORBIT"
          tom="discreto"
        />
      </div>

      <div className="cabecalho-ferramentas">{children}</div>
    </div>
  );
}
