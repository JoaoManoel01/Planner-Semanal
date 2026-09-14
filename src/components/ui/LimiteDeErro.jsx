import { Component } from "react";

/**
 * Limite de erro da aplicação.
 *
 * Sem ele, qualquer exceção de render desmonta a árvore inteira e sobra tela
 * branca. Com os dados no navegador, a leitura natural de uma tela branca é
 * "perdi tudo" — e a reação natural é reinstalar, que aí sim perde.
 *
 * A exportação daqui lê o localStorage direto, sem passar pelos stores: se o
 * que quebrou foi um store, o caminho de resgate não pode depender dele.
 */

const CHAVES = ["orbit:agenda:v4", "orbit:treinos:v1", "orbit:projetos:v1"];

function coletarTudo() {
  const bruto = {};
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave?.startsWith("orbit:")) {
      bruto[chave] = localStorage.getItem(chave);
    }
  }
  return bruto;
}

function baixarResgate() {
  const bruto = coletarTudo();
  const conteudo = {
    resgate: true,
    geradoEm: new Date().toISOString(),
    /* Texto cru, exatamente como está gravado: se algo estiver malformado,
       reinterpretar aqui destruiria a evidência. */
    chaves: bruto
  };
  const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orbit-resgate-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default class LimiteDeErro extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error("ORBIT quebrou ao renderizar:", erro, info?.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    const presentes = CHAVES.filter(c => localStorage.getItem(c));

    return (
      <div className="tela-erro">
        <div className="erro-cartao">
          <h1>Algo quebrou na interface</h1>
          <p className="erro-calma">
            <strong>Seus dados não foram afetados.</strong> Eles continuam gravados neste
            computador — o que falhou foi o desenho da tela, não o armazenamento.
          </p>

          {presentes.length > 0 && (
            <p className="erro-detalhe">
              Encontrado: {presentes.map(c => c.split(":")[1]).join(", ")}.
            </p>
          )}

          <div className="erro-acoes">
            <button type="button" className="btn btn-primary" onClick={baixarResgate}>
              Baixar cópia dos dados
            </button>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>

          <p className="erro-dica">
            Baixe a cópia antes de qualquer outra coisa. Com ela em mãos, reinstalar
            o aplicativo deixa de ter risco.
          </p>

          <details className="erro-tecnico">
            <summary>Detalhe técnico</summary>
            <pre>{String(this.state.erro?.stack || this.state.erro)}</pre>
          </details>
        </div>
      </div>
    );
  }
}
