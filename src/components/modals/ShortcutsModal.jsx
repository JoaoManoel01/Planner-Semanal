import Modal from "../ui/Modal.jsx";

const ATALHOS = [
  { teclas: ["1", "2", "3"], acao: "Ir para Agenda, Treinos ou Projetos" },
  { teclas: ["?"], acao: "Abrir esta lista" },
  { teclas: ["N"], acao: "Nova atividade" },
  { teclas: ["E"], acao: "Novo evento temporal" },
  { teclas: ["T"], acao: "Voltar para a semana de hoje" },
  { teclas: ["←", "→"], acao: "Semana anterior / próxima" },
  { teclas: ["Enter"], acao: "Editar a atividade selecionada" },
  { teclas: ["Delete"], acao: "Excluir a atividade selecionada" },
  { teclas: ["Espaço"], acao: "Concluir a atividade selecionada" },
  { teclas: ["Esc"], acao: "Fechar diálogo ou limpar seleção" }
];

export default function ShortcutsModal({ onClose }) {
  return (
    <Modal
      titulo="Atalhos"
      descricao="Funcionam quando o foco não está em um campo de texto."
      onClose={onClose}
      rodape={<button type="button" className="btn btn-primary" onClick={onClose}>Entendi</button>}
    >
      <ul className="lista-atalhos">
        {ATALHOS.map(a => (
          <li key={a.acao}>
            <span className="atalho-acao">{a.acao}</span>
            <span className="atalho-teclas">
              {a.teclas.map(t => <kbd key={t}>{t}</kbd>)}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
