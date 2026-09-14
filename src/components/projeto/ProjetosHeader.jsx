import * as store from "../../store/projetos.js";
import {
  IconChevronLeft, IconPlus, IconSliders,
  IconDownload, IconUpload, IconKeyboard, IconTrash
} from "../ui/Icon.jsx";
import BrandRow from "../layout/BrandRow.jsx";
import MenuFerramentas from "../layout/MenuFerramentas.jsx";

/**
 * Cabeçalho do módulo Trabalhos.
 * No índice mostra o conjunto; dentro de um projeto, o projeto toma a linha de
 * contexto — o segundo nível substitui o primeiro em vez de empilhar navegação.
 */
export default function ProjetosHeader({
  aba, onAba, projeto, total, onVoltar, onCriar,
  onPersonalizar, onExportar, onImportar, onAtalhos
}) {
  const ferramentas = [
    ...(projeto
      ? [{
          id: "excluir",
          rotulo: "Excluir este projeto",
          icone: IconTrash,
          onClick: () => { store.removerProjeto(projeto.id); onVoltar(); }
        }]
      : []),
    { id: "exportar", rotulo: "Exportar dados", icone: IconDownload, onClick: onExportar, separador: !!projeto },
    { id: "importar", rotulo: "Importar dados", icone: IconUpload, onClick: onImportar },
    { id: "atalhos", rotulo: "Atalhos de teclado", icone: IconKeyboard, onClick: onAtalhos, separador: true }
  ];

  return (
    <header className="cabecalho">
      <BrandRow aba={aba} onAba={onAba}>
        <button type="button" className="btn btn-ghost" onClick={onPersonalizar}>
          <IconSliders />Personalizar
        </button>
        <MenuFerramentas acoes={ferramentas} />
      </BrandRow>

      <div className="cabecalho-linha cabecalho-tempo">
        <div className="navegacao">
          {projeto && (
            <div className="nav-grupo">
              <button type="button" className="nav-btn" onClick={onVoltar} aria-label="Voltar aos projetos">
                <IconChevronLeft />
              </button>
            </div>
          )}

          <div className="periodo">
            {projeto ? (
              <>
                <input
                  className="periodo-titulo titulo-editavel"
                  value={projeto.nome}
                  aria-label="Nome do projeto"
                  onChange={e => store.atualizarProjeto(projeto.id, { nome: e.target.value })}
                />
                <input
                  className="periodo-detalhe detalhe-editavel"
                  value={projeto.descricao}
                  placeholder="Descreva o projeto em uma linha"
                  aria-label="Descrição do projeto"
                  onChange={e => store.atualizarProjeto(projeto.id, { descricao: e.target.value })}
                />
              </>
            ) : (
              <>
                <h1 className="periodo-titulo">Projetos</h1>
                <p className="periodo-detalhe">
                  {total
                    ? `${total} ${total === 1 ? "projeto" : "projetos"} · cada um com seus próprios prazos`
                    : "Espaços independentes da sua semana"}
                </p>
              </>
            )}
          </div>
        </div>

        {!projeto && (
          <button type="button" className="btn btn-primary" onClick={onCriar}>
            <IconPlus />Novo projeto
          </button>
        )}
      </div>
    </header>
  );
}
