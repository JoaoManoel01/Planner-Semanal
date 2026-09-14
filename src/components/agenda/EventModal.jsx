import { useState } from "react";
import * as store from "../../store/agenda.js";
import { IconTrash } from "../ui/Icon.jsx";
import { avisar } from "../ui/avisos.js";
import Modal from "../ui/Modal.jsx";

const TIPOS = [
  { id: "event", nome: "Evento" },
  { id: "deadline", nome: "Prazo" },
  { id: "milestone", nome: "Marco" },
  { id: "reminder", nome: "Lembrete" }
];

const PRIORIDADES = [
  { id: "low", nome: "Baixa" },
  { id: "medium", nome: "Média" },
  { id: "high", nome: "Alta" }
];

/**
 * Evento temporal: pertence a uma data.
 * Sem data, torna-se contexto fixo — visível em qualquer semana.
 */
export default function EventModal({ evento, dataPadrao, onClose }) {
  const [title, setTitle] = useState(evento?.title || "");
  const [fixo, setFixo] = useState(evento ? !evento.date : false);
  const [date, setDate] = useState(evento?.date || dataPadrao);
  const [startTime, setStartTime] = useState(evento?.startTime || "");
  const [endTime, setEndTime] = useState(evento?.endTime || "");
  const [description, setDescription] = useState(evento?.description || "");
  const [type, setType] = useState(evento?.type || "event");
  const [priority, setPriority] = useState(evento?.priority || "medium");
  const [erro, setErro] = useState("");

  function enviar(e) {
    e.preventDefault();
    if (!title.trim()) return setErro("Dê um título ao evento.");
    if (!fixo && !date) return setErro("Escolha uma data ou marque como contexto fixo.");

    store.salvarEvento({
      id: evento?.id,
      title,
      date: fixo ? null : date,
      startTime: fixo ? "" : startTime,
      endTime: fixo ? "" : endTime,
      description,
      type,
      priority
    });
    avisar(evento ? `"${title.trim()}" atualizado` : `"${title.trim()}" adicionado ao contexto`);
    onClose();
  }

  const rodape = (
    <>
      {evento && (
        <button
          type="button"
          className="btn btn-danger empurra"
          onClick={() => { store.excluirEvento(evento.id); avisar(`"${evento.title}" removido`); onClose(); }}
        >
          <IconTrash />Excluir
        </button>
      )}
      <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button type="submit" form="form-evento" className="btn btn-primary">Salvar</button>
    </>
  );

  return (
    <Modal
      titulo={evento ? "Editar evento" : "Novo evento temporal"}
      descricao="Aparece somente na semana à qual a data pertence."
      onClose={onClose}
      rodape={rodape}
    >
      <form id="form-evento" className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label className="rotulo" htmlFor="ev-titulo">Título</label>
          <input
            id="ev-titulo"
            className="input"
            value={title}
            onChange={e => { setTitle(e.target.value); setErro(""); }}
            maxLength={48}
            autoComplete="off"
            required
          />
        </div>

        <div className="campo-duplo">
          <div className="campo">
            <label className="rotulo">Tipo</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              {TIPOS.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="campo">
            <label className="rotulo">Prioridade</label>
            <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
              {PRIORIDADES.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
        </div>

        <label className="interruptor">
          <input type="checkbox" checked={fixo} onChange={e => { setFixo(e.target.checked); setErro(""); }} />
          <span className="interruptor-trilho" aria-hidden="true"><span className="interruptor-botao" /></span>
          <span className="interruptor-texto">
            Contexto fixo
            <em>sem data — permanece visível em todas as semanas</em>
          </span>
        </label>

        {!fixo && (
          <div className="campo-duplo">
            <div className="campo">
              <label className="rotulo" htmlFor="ev-data">Data</label>
              <input
                id="ev-data"
                className="input"
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setErro(""); }}
              />
            </div>
            <div className="campo-duplo">
              <div className="campo">
                <label className="rotulo">Início</label>
                <input className="input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
              </div>
              <div className="campo">
                <label className="rotulo">Fim</label>
                <input className="input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="campo">
          <label className="rotulo" htmlFor="ev-desc">Descrição</label>
          <textarea
            id="ev-desc"
            className="input area"
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={220}
            placeholder="opcional"
          />
        </div>

        {erro && <p className="erro">{erro}</p>}
      </form>
    </Modal>
  );
}
