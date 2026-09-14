import { useRef, useState } from "react";
import * as store from "../../store/agenda.js";
import { toMin, formatarHoras, DIAS_CURTOS } from "../../domain/time.js";
import { IconTrash } from "../ui/Icon.jsx";
import { pedirConfirmacao, avisar } from "../ui/avisos.js";
import Modal from "./Modal.jsx";

export default function ActivityModal({ estado, range, modal, onClose }) {
  const edicao = modal.blocoId ? store.localizarBloco(modal.blocoId) : null;
  const bloco = edicao?.bloco;

  /* Um único controle responde "que dia é isso": um conjunto de dias.
     Ao editar, escolher outro dia move a atividade; ao criar, cada dia
     escolhido vira uma atividade. */
  const [dias, setDias] = useState(() => new Set([edicao ? edicao.diaIdx : modal.diaIdx ?? 0]));
  const [titulo, setTitulo] = useState(bloco?.rot || "");
  const [cat, setCat] = useState(bloco?.cat || estado.categorias[0]?.id || "");
  const [ini, setIni] = useState(bloco?.ini || "09:00");
  const [fim, setFim] = useState(bloco?.fim || "10:00");
  const [nota, setNota] = useState(bloco?.nota || "");
  const [flexivel, setFlexivel] = useState(!!bloco?.flexivel);
  const [tocado, setTocado] = useState(false);
  const tocadoRef = useRef(false);
  const [erro, setErro] = useState("");

  const duracao = Math.max(0, toMin(fim) - toMin(ini));
  const alvos = [...dias].sort((a, b) => a - b);

  /**
   * O dia que vem aberto é uma sugestão, não uma escolha: o primeiro clique
   * substitui, para que "cliquei em domingo" signifique domingo e nada mais.
   * A partir daí, clicar soma dias — é assim que se repete a atividade.
   */
  function alternarDia(indice) {
    setErro("");
    const primeiroToque = !tocadoRef.current;
    tocadoRef.current = true;      // ref: vale já no próximo clique, sem esperar render
    setTocado(true);

    setDias(atual => {
      if (modal.blocoId || primeiroToque) return new Set([indice]);
      const proximo = new Set(atual);
      if (proximo.has(indice)) {
        if (proximo.size > 1) proximo.delete(indice);
      } else {
        proximo.add(indice);
      }
      return proximo;
    });
  }

  async function enviar(e) {
    e.preventDefault();
    const nome = titulo.trim();
    if (!nome) return setErro("Dê um nome à atividade.");
    if (toMin(fim) <= toMin(ini)) return setErro("O fim precisa ser depois do início.");
    if (!alvos.length) return setErro("Escolha pelo menos um dia.");

    const conflitantes = alvos.flatMap(d =>
      store.blocosSobrepostos(d, toMin(ini), toMin(fim), modal.blocoId || "")
    );

    if (conflitantes.length) {
      const seguir = await pedirConfirmacao({
        titulo: "Esse horário já está ocupado",
        corpo: `"${conflitantes[0].rot}" (${conflitantes[0].ini}–${conflitantes[0].fim}) ocupa o mesmo intervalo. Salvar assim mesmo cria uma sobreposição.`,
        acao: "Salvar assim mesmo",
        cancelar: "Voltar e ajustar"
      });
      if (!seguir) return;
    }

    store.salvarBloco({
      id: modal.blocoId || "",
      diaIdx: alvos[0],
      cat, rot: nome, ini, fim, nota: nota.trim(), flexivel
    });

    for (const outro of alvos.slice(1)) {
      store.salvarBloco({ id: "", diaIdx: outro, cat, rot: nome, ini, fim, nota: nota.trim(), flexivel });
    }

    avisar(modal.blocoId
      ? `"${nome}" atualizada`
      : `"${nome}" criada${alvos.length > 1 ? ` em ${alvos.length} dias` : ` em ${range.dias[alvos[0]].nome.toLowerCase()}`}`);
    onClose();
  }

  function excluir() {
    const removido = store.excluirBloco(modal.blocoId);
    if (removido) {
      avisar(`"${removido.bloco.rot}" excluída`, {
        desfazer: () => store.restaurarBloco(removido.diaIdx, removido.bloco)
      });
    }
    onClose();
  }

  const rodape = (
    <>
      {modal.blocoId && (
        <button
          type="button"
          className="btn btn-danger empurra"
          onClick={excluir}
        >
          <IconTrash />Excluir
        </button>
      )}
      <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button type="submit" form="form-atividade" className="btn btn-primary">Salvar</button>
    </>
  );

  return (
    <Modal
      titulo={modal.blocoId ? "Editar atividade" : "Nova atividade"}
      descricao={alvos.length === 1
        ? `${range.dias[alvos[0]]?.nome} · ${range.dias[alvos[0]]?.diaMes}${duracao ? ` · ${formatarHoras(duracao)}` : ""}`
        : `${alvos.length} dias${duracao ? ` · ${formatarHoras(duracao)} em cada` : ""}`}
      onClose={onClose}
      rodape={rodape}
    >
      <form id="form-atividade" className="formulario" onSubmit={enviar}>
        <div className="campo">
          <label className="rotulo" htmlFor="atv-titulo">Título</label>
          <input
            id="atv-titulo"
            className="input"
            value={titulo}
            onChange={e => { setTitulo(e.target.value); setErro(""); }}
            maxLength={48}
            autoComplete="off"
            required
          />
        </div>

        <div className="campo">
          <label className="rotulo">Categoria</label>
          <div className="seletor-categorias">
            {estado.categorias.map(c => (
              <button
                key={c.id}
                type="button"
                className={"cat-opcao" + (cat === c.id ? " is-selecionada" : "")}
                style={{ "--cor": c.cor }}
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
              >
                <i className="ponto" />{c.nome}
              </button>
            ))}
          </div>
        </div>

        <div className="campo">
          <label className="rotulo">
            {modal.blocoId ? "Dia" : "Dias"}
            {!modal.blocoId && <span className="rotulo-dica">{tocado ? "clique em outro dia para repetir" : "clique no dia da atividade"}</span>}
          </label>
          <div className="seletor-dias" role="group" aria-label="Dias da atividade">
            {range.dias.map(d => (
              <button
                key={d.iso}
                type="button"
                className={"dia-opcao" + (dias.has(d.index) ? " is-selecionado" : "") + (d.hoje ? " hoje" : "")}
                aria-pressed={dias.has(d.index)}
                onClick={() => alternarDia(d.index)}
              >
                <strong>{DIAS_CURTOS[d.index]}</strong>
                <em>{d.diaMes.slice(0, 2)}</em>
              </button>
            ))}
          </div>
        </div>

        <div className="campo-duplo">
          <div className="campo">
            <label className="rotulo" htmlFor="atv-ini">Início</label>
            <input id="atv-ini" className="input" type="time" value={ini} onChange={e => { setIni(e.target.value); setErro(""); }} required />
          </div>
          <div className="campo">
            <label className="rotulo" htmlFor="atv-fim">Fim</label>
            <input id="atv-fim" className="input" type="time" value={fim} onChange={e => { setFim(e.target.value); setErro(""); }} required />
          </div>
        </div>

        <div className="campo">
          <label className="rotulo" htmlFor="atv-nota">Descrição</label>
          <input
            id="atv-nota"
            className="input"
            value={nota}
            onChange={e => setNota(e.target.value)}
            maxLength={90}
            placeholder="opcional"
          />
        </div>

        <label className="interruptor">
          <input type="checkbox" checked={flexivel} onChange={e => setFlexivel(e.target.checked)} />
          <span className="interruptor-trilho" aria-hidden="true"><span className="interruptor-botao" /></span>
          <span className="interruptor-texto">
            Flexível
            <em>o horário pode deslizar dentro do dia</em>
          </span>
        </label>

        {erro && <p className="erro">{erro}</p>}
      </form>
    </Modal>
  );
}
