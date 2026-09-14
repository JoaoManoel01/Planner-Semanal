import * as store from "../../store/agenda.js";
import { IconPlus, IconTrash } from "../ui/Icon.jsx";
import Modal from "../ui/Modal.jsx";

/** Paleta oficial — categorias não inventam cores fora do brandkit. */
const PALETA = [
  { token: "var(--category-stage)", nome: "Verde" },
  { token: "var(--category-classes)", nome: "Azul" },
  { token: "var(--category-english)", nome: "Rosa" },
  { token: "var(--category-gym)", nome: "Violeta" },
  { token: "var(--category-event)", nome: "Menta" },
  { token: "var(--category-flexible)", nome: "Grafite" },
  { token: "var(--category-pibic)", nome: "Turquesa" },
  { token: "var(--category-time)", nome: "Céu" }
];

export default function CategoriesModal({ estado, onClose }) {
  return (
    <Modal
      titulo="Categorias"
      descricao="A cor identifica o compromisso na grade, no resumo e na legenda."
      largura={520}
      onClose={onClose}
      rodape={
        <>
          <button type="button" className="btn btn-ghost empurra" onClick={() => store.adicionarCategoria()}>
            <IconPlus />Nova categoria
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Concluir</button>
        </>
      }
    >
      <ul className="lista-categorias">
        {estado.categorias.map(c => {
          const emUso = store.categoriaEmUso(c.id);
          return (
            <li key={c.id} className="categoria-linha">
              <input
                className="input categoria-nome"
                value={c.nome}
                maxLength={28}
                aria-label="Nome da categoria"
                onChange={e => store.atualizarCategoria(c.id, { nome: e.target.value })}
              />

              <div className="paleta" role="group" aria-label={`Cor de ${c.nome}`}>
                {PALETA.map(p => (
                  <button
                    key={p.token}
                    type="button"
                    className={"paleta-opcao" + (c.cor === p.token ? " is-selecionada" : "")}
                    style={{ "--cor": p.token }}
                    aria-label={p.nome}
                    aria-pressed={c.cor === p.token}
                    onClick={() => store.atualizarCategoria(c.id, { cor: p.token })}
                  />
                ))}
              </div>

              <button
                type="button"
                className="acao-mini perigo"
                disabled={emUso || estado.categorias.length <= 1}
                title={emUso ? "Em uso por atividades" : "Remover categoria"}
                aria-label={`Remover ${c.nome}`}
                onClick={() => store.removerCategoria(c.id)}
              >
                <IconTrash size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
