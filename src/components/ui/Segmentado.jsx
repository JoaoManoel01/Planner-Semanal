/**
 * Controle segmentado — uma só linguagem para troca de módulo e de visão.
 * O indicador desliza entre as opções; nada pisca, nada salta.
 */
export default function Segmentado({ itens, valor, onMudar, rotulo, tom = "padrao" }) {
  const indice = Math.max(0, itens.findIndex(i => i.id === valor));

  return (
    <div
      className={"segmentado tom-" + tom}
      role="tablist"
      aria-label={rotulo}
      style={{ "--seg-n": itens.length, "--seg-i": indice }}
    >
      <i className="segmentado-indicador" aria-hidden="true" />
      {itens.map(item => {
        const ativo = item.id === valor;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={ativo}
            tabIndex={ativo ? 0 : -1}
            className={"seg-item" + (ativo ? " is-ativa" : "")}
            onClick={() => onMudar(item.id)}
          >
            {item.icone && <item.icone />}
            {item.nome}
          </button>
        );
      })}
    </div>
  );
}
