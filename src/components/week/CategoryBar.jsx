import { formatarHoras } from "../../domain/time.js";

/**
 * Barra de categorias — legenda e filtro visual da grade.
 * O filtro não apaga dados: apenas reduz o contraste do que não foi escolhido.
 */
export default function CategoryBar({ categorias, porCategoria, filtro, onAlternar, onLimpar }) {
  const minutos = new Map(porCategoria.map(c => [c.id, c.minutos]));
  const ativas = categorias.filter(c => minutos.has(c.id) || !filtro.size);

  return (
    <nav className="categorias" aria-label="Categorias">
      {ativas.map(c => {
        const usada = minutos.get(c.id) || 0;
        const selecionada = filtro.has(c.id);
        return (
          <button
            key={c.id}
            type="button"
            className={"cat-chip" + (selecionada ? " is-selecionada" : "") + (usada ? "" : " is-ociosa")}
            aria-pressed={selecionada}
            onClick={() => onAlternar(c.id)}
            style={{ "--cor": c.cor }}
          >
            <i className="ponto" />
            <span className="cat-nome">{c.nome}</span>
            {usada > 0 && <span className="cat-horas">{formatarHoras(usada)}</span>}
          </button>
        );
      })}

      {filtro.size > 0 && (
        <button type="button" className="cat-limpar" onClick={onLimpar}>
          limpar filtro
        </button>
      )}
    </nav>
  );
}
