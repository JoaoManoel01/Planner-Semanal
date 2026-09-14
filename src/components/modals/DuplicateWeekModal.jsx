import * as store from "../../agenda.js";
import { getWeekRange } from "../../domain/time.js";
import { pedirConfirmacao, avisar } from "../ui/avisos.js";
import Modal from "./Modal.jsx";

/** Repete a estrutura de outra semana na semana atual (sem marcar como concluída). */
export default function DuplicateWeekModal({ semanaAtual, onClose }) {
  const disponiveis = store.semanasComDados();
  const destino = getWeekRange(semanaAtual);

  return (
    <Modal
      titulo="Repetir outra semana aqui"
      descricao={`As atividades serão copiadas para ${destino.rotuloCurto}, substituindo o conteúdo atual.`}
      onClose={onClose}
      rodape={<button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>}
    >
      {disponiveis.length ? (
        <ul className="lista-semanas">
          {disponiveis.map(chave => {
            const range = getWeekRange(chave);
            const blocos = store.getEstado().semanas[chave].dias.reduce((t, d) => t + d.blocos.length, 0);
            return (
              <li key={chave}>
                <button
                  type="button"
                  className="semana-opcao"
                  onClick={async () => {
                    const seguir = await pedirConfirmacao({
                      titulo: `Substituir ${destino.rotuloCurto}?`,
                      corpo: `As ${blocos} atividades de ${range.rotuloCurto} entram no lugar do que existe hoje nesta semana.`,
                      acao: "Substituir",
                      perigo: true
                    });
                    if (!seguir) return;
                    store.copiarSemana(chave);
                    avisar(`Estrutura de ${range.rotuloCurto} copiada para cá`);
                    onClose();
                  }}
                >
                  <span className="semana-rotulo">{range.rotuloCurto}</span>
                  <span className="semana-detalhe">{blocos} blocos</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="vazio">Nenhuma outra semana com atividades ainda.</p>
      )}
    </Modal>
  );
}
