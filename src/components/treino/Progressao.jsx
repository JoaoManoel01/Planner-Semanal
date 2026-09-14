import { getWeekRange, formatarDiaMes } from "../../domain/time.js";
import {
  progressaoPorExercicio,
  resumoSemanal,
  dadosOctogono,
  normalizarIntensidades,
  indiceExercicios
} from "../../domain/treinos.js";
import Octogono from "./Octogono.jsx";
import GraficoLinha from "../ui/GraficoLinha.jsx";
import BarrasGrupo from "./BarrasGrupo.jsx";
import { formatarCarga, formatarDelta, direcao } from "./formato.js";

function CartaoExercicio({ nome, pontos }) {
  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  const delta = formatarDelta(ultimo.pesoTopo - primeiro.pesoTopo);

  const series = [{ valores: pontos.map(p => p.pesoTopo), classe: "peso" }];
  if (pontos.some(p => p.repsTopo)) {
    series.push({ valores: pontos.map(p => p.rm), classe: "rm" });
  }

  return (
    <article className="progressao-item">
      <header className="progressao-topo">
        <h4>{nome}</h4>
        {delta && delta !== "estável" && (
          <span className={"selo-delta dir-" + direcao(ultimo.pesoTopo - primeiro.pesoTopo)}>{delta}kg</span>
        )}
      </header>

      <div className="progressao-numero">
        <strong>{formatarCarga(ultimo.pesoTopo)}</strong>
        <span>kg</span>
        {ultimo.repsTopo ? <span className="progressao-reps">× {ultimo.repsTopo}</span> : null}
      </div>

      <GraficoLinha
        series={series}
        altura={132}
        rotulos={pontos.map(p => formatarDiaMes(p.data))}
        formatar={formatarCarga}
        unidade="kg"
      />

      <footer className="progressao-rodape">
        <span>{pontos.length} registros</span>
        {ultimo.rm !== ultimo.pesoTopo && <span>1RM ≈ {formatarCarga(ultimo.rm)}kg</span>}
      </footer>
    </article>
  );
}

export default function Progressao({ estado, semanaISO, resumo }) {
  const indice = indiceExercicios(estado.plano);
  const progressao = progressaoPorExercicio(estado.plano, estado.sessoes);
  const comProgresso = Object.entries(progressao).filter(([, pts]) => pts.length >= 2);

  const octogono = dadosOctogono(resumo.porGrupo);
  const intensidades = normalizarIntensidades(resumo.porGrupo);
  const semanas = resumoSemanal(estado.plano, estado.sessoes);
  const pico = Math.max(...semanas.map(s => s.carga), 1);

  return (
    <div className="progressao">
      <section className="treino-card">
        <header className="card-topo">
          <div>
            <h3>Distribuição da semana</h3>
            <p className="card-contexto">
              {resumo.gruposTocados
                ? `${resumo.gruposTocados} de 8 grupos estimulados`
                : "Nenhum grupo estimulado ainda"}
            </p>
          </div>
        </header>

        <div className="octogono-wrap">
          <Octogono dados={octogono} />
          <BarrasGrupo porGrupo={resumo.porGrupo} intensidades={intensidades} />
        </div>
      </section>

      <section className="treino-card">
        <header className="card-topo">
          <div>
            <h3>Progressão por exercício</h3>
            <p className="card-contexto">Histórico completo, independente da semana exibida</p>
          </div>
        </header>

        {comProgresso.length ? (
          <div className="progressao-lista">
            {comProgresso.map(([id, pts]) => (
              <CartaoExercicio key={id} nome={indice[id]?.nome || "Exercício"} pontos={pts} />
            ))}
          </div>
        ) : (
          <div className="estado-vazio">
            <p>Registre pelo menos dois treinos do mesmo exercício para ver a curva.</p>
            <span className="dica">A progressão compara o peso de topo entre as sessões.</span>
          </div>
        )}
      </section>

      <section className="treino-card">
        <header className="card-topo">
          <div>
            <h3>Volume por semana</h3>
            <p className="card-contexto">Carga acumulada de cada semana registrada</p>
          </div>
        </header>

        {semanas.length ? (
          <ol className="timeline">
            {semanas.map(s => (
              <li key={s.semana} className={"timeline-item" + (s.semana === semanaISO ? " is-atual" : "")}>
                <i className="timeline-barra" style={{ width: Math.round((s.carga / pico) * 100) + "%" }} />
                <span className="timeline-semana">{getWeekRange(s.semana).rotuloCurto}</span>
                <span className="timeline-sessoes">{s.sessoes} {s.sessoes > 1 ? "sessões" : "sessão"}</span>
                <span className="timeline-carga">{formatarCarga(s.carga)}<em>kg</em></span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="estado-vazio">
            <p>Sem treinos registrados ainda.</p>
          </div>
        )}
      </section>
    </div>
  );
}
