import Modal from "../ui/Modal.jsx";

const TEMAS = [
  { id: "escuro", nome: "Escuro" },
  { id: "claro", nome: "Claro" }
];

const ACENTOS = [
  { id: "cyan", nome: "Cyan", token: "var(--color-brand-cyan)" },
  { id: "petrol", nome: "Petról", token: "var(--color-brand-petrol-light)" },
  { id: "gelo", nome: "Gelo", token: "var(--color-text-primary)" },
  { id: "purpura", nome: "Púrpura", token: "var(--color-brand-purpura)" }
];

const DENSIDADES = [
  { id: "compacto", nome: "Compacta", detalhe: "mais horas na tela" },
  { id: "normal", nome: "Normal", detalhe: "equilíbrio padrão" },
  { id: "amplo", nome: "Ampla", detalhe: "blocos mais legíveis" }
];

export default function PreferencesModal({ prefs, setPrefs, onClose }) {
  const definir = patch => setPrefs(p => ({ ...p, ...patch }));

  return (
    <Modal
      titulo="Personalizar"
      descricao="Ajustes de aparência da agenda. A identidade do sistema permanece."
      onClose={onClose}
      rodape={<button type="button" className="btn btn-primary" onClick={onClose}>Concluir</button>}
    >
      <div className="formulario">
        <div className="campo">
          <label className="rotulo">Tema</label>
          <div className="opcoes">
            {TEMAS.map(t => (
              <button
                key={t.id}
                type="button"
                className={"opcao" + (prefs.tema === t.id ? " is-selecionada" : "")}
                aria-pressed={prefs.tema === t.id}
                onClick={() => definir({ tema: t.id })}
              >
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label className="rotulo">Acento</label>
          <div className="opcoes">
            {ACENTOS.map(a => (
              <button
                key={a.id}
                type="button"
                className={"opcao opcao-cor" + (prefs.acento === a.id ? " is-selecionada" : "")}
                style={{ "--cor": a.token }}
                aria-pressed={prefs.acento === a.id}
                onClick={() => definir({ acento: a.id })}
              >
                <i className="ponto" />{a.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label className="rotulo">Densidade da grade</label>
          <div className="opcoes opcoes-coluna">
            {DENSIDADES.map(d => (
              <button
                key={d.id}
                type="button"
                className={"opcao opcao-larga" + (prefs.densidade === d.id ? " is-selecionada" : "")}
                aria-pressed={prefs.densidade === d.id}
                onClick={() => definir({ densidade: d.id })}
              >
                <span>{d.nome}</span>
                <em>{d.detalhe}</em>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
