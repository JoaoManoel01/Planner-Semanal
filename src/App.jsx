import { useEffect, useMemo, useRef, useState } from "react";
import * as store from "./store/agenda.js";
import { aoFalhar } from "./store/persistencia.js";
import { baixarBackup, restaurarBackup, backupDiario } from "./store/backup.js";
import { useAgenda } from "./hooks/useAgenda.js";
import { useNow, minutosDoDia } from "./hooks/useNow.js";
import { useAtalhos } from "./hooks/useAtalhos.js";

import { getWeekRange, dataParaISO } from "./domain/time.js";
import { getActivitiesForWeek, getEventsForWeek, getContextItems, getUpcomingEvents, getWeekStatus } from "./domain/week.js";
import { calculateWeeklySummary, detectConflicts } from "./domain/summary.js";
import { generateWeeklyInsights } from "./domain/insights.js";

import SplashScreen from "./components/splash/SplashScreen.jsx";
import CamadaAvisos from "./components/ui/CamadaAvisos.jsx";
import { avisar } from "./components/ui/avisos.js";
import AgendaHeader from "./components/agenda/AgendaHeader.jsx";
import WeeklyStatus from "./components/agenda/WeeklyStatus.jsx";
import WeekContext from "./components/agenda/WeekContext.jsx";
import CategoryBar from "./components/agenda/CategoryBar.jsx";
import WeekGrid from "./components/agenda/WeekGrid.jsx";
import WeekSummary from "./components/agenda/WeekSummary.jsx";
import WeekInsights from "./components/agenda/WeekInsights.jsx";
import ActivityModal from "./components/agenda/ActivityModal.jsx";
import EventModal from "./components/agenda/EventModal.jsx";
import CategoriesModal from "./components/agenda/CategoriesModal.jsx";
import PreferencesModal from "./components/modals/PreferencesModal.jsx";
import ShortcutsModal from "./components/modals/ShortcutsModal.jsx";
import DuplicateWeekModal from "./components/agenda/DuplicateWeekModal.jsx";
import TreinosApp from "./components/treino/TreinosApp.jsx";
import ProjetosApp from "./components/projeto/ProjetosApp.jsx";

const PREFS_KEY = "orbit:prefs:v1";
const PREFS_PADRAO = { tema: "escuro", acento: "cyan", densidade: "normal" };

function carregarPrefs() {
  try {
    return { ...PREFS_PADRAO, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") };
  } catch {
    return { ...PREFS_PADRAO };
  }
}

export default function App() {
  const [estado, versao] = useAgenda();
  const agora = useNow();

  const [prefs, setPrefs] = useState(carregarPrefs);
  const [dialogo, setDialogo] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [filtro, setFiltro] = useState(() => new Set());
  const [splashFechado, setSplashFechado] = useState(false);
  const [transicao, setTransicao] = useState(null);
  const importRef = useRef(null);
  const [aba, setAba] = useState("agenda");

  const hoje = dataParaISO(agora);
  const semanaAtual = estado.semanaAtual;

  /* ── durabilidade dos dados ────────────────────────── */

  /* Falha de armazenamento não pode ser silenciosa: sem aviso, você trabalha
     uma semana achando que gravou. */
  useEffect(() => aoFalhar(falha => {
    if (falha.tipo === "cota") {
      avisar("Armazenamento cheio — exporte um backup e remova semanas antigas", {
        tipo: "erro", duracao: 12000
      });
    } else if (falha.tipo === "corrompido") {
      avisar("Um arquivo de dados estava ilegível e foi posto em quarentena, não apagado", {
        tipo: "erro", duracao: 12000
      });
    } else {
      avisar("Não foi possível gravar os dados neste navegador", { tipo: "erro", duracao: 12000 });
    }
  }), []);

  /* Backup em disco uma vez por dia, quando rodando como aplicativo. */
  useEffect(() => {
    backupDiario().then(r => {
      if (r && !r.ok) {
        avisar("Backup automático falhou — exporte manualmente", { tipo: "erro", duracao: 8000 });
      }
    });
  }, []);

  /* ── preferências ──────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    const raiz = document.documentElement;
    raiz.dataset.tema = prefs.tema;
    raiz.dataset.acento = prefs.acento;
    raiz.dataset.densidade = prefs.densidade;
  }, [prefs]);

  /* ── pipeline da semana ────────────────────────────── */
  const dados = useMemo(() => {
    const range = getWeekRange(semanaAtual, hoje);
    const atividades = getActivitiesForWeek(estado.semanas, semanaAtual);
    const summary = calculateWeeklySummary(atividades, estado.categorias, range);
    const conflitos = detectConflicts(atividades);
    const eventos = getEventsForWeek(estado.eventos, semanaAtual);
    const contextItems = getContextItems(estado.eventos);
    const eventosProximos = getUpcomingEvents(estado.eventos, semanaAtual);
    const status = getWeekStatus(semanaAtual, hoje);

    const insights = generateWeeklyInsights({
      weekStartISO: semanaAtual,
      range, atividades, eventos, eventosProximos, conflitos, summary,
      categorias: estado.categorias,
      status, hoje,
      agoraMin: status === "atual" ? minutosDoDia(agora) : null,
      faixaIni: store.BASE,
      faixaFim: store.TOPO
    });

    return { range, atividades, summary, conflitos, eventos, contextItems, status, insights };
  }, [versao, semanaAtual, hoje, agora, estado]);

  const { range, summary, conflitos, eventos, contextItems, status, insights } = dados;

  /* fração da semana já decorrida — marcador no status */
  const decorrido = useMemo(() => {
    if (status === "passada") return 1;
    if (status === "futura") return null;
    const indice = range.dias.findIndex(d => d.hoje);
    return (indice + minutosDoDia(agora) / 1440) / 7;
  }, [status, range, agora]);

  /* ── ações ─────────────────────────────────────────── */
  function navegar(offset) {
    setTransicao(offset > 0 ? "frente" : "tras");
    setSelecionado(null);
    store.navegarSemana(offset);
  }

  function irParaHoje() {
    if (status === "atual") return;
    setTransicao(status === "futura" ? "tras" : "frente");
    setSelecionado(null);
    store.irParaHoje();
  }

  useEffect(() => {
    if (!transicao) return;
    const t = setTimeout(() => setTransicao(null), 240);
    return () => clearTimeout(t);
  }, [transicao, semanaAtual]);

  function exportar() {
    baixarBackup();
    avisar("Backup exportado");
  }

  function importar(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const restaurados = restaurarBackup(leitor.result);
        avisar(`Dados importados: ${restaurados.join(", ")}`);
      } catch {
        avisar("Arquivo inválido — use um backup exportado por esta agenda", { tipo: "erro", duracao: 5000 });
      }
    };
    leitor.readAsText(arquivo);
    e.target.value = "";
  }

  function alternarFiltro(id) {
    setFiltro(atual => {
      const proximo = new Set(atual);
      proximo.has(id) ? proximo.delete(id) : proximo.add(id);
      return proximo;
    });
  }

  /* ── atalhos ───────────────────────────────────────── */
  const atalhos = useMemo(() => ({
    n: () => setDialogo({ tipo: "atividade", diaIdx: range.dias.find(d => d.hoje)?.index ?? 0, blocoId: null }),
    e: () => setDialogo({ tipo: "evento", evento: null }),
    t: irParaHoje,
    ArrowLeft: () => navegar(-1),
    ArrowRight: () => navegar(1),
    Escape: () => setSelecionado(null),
    Enter: () => {
      const loc = selecionado && store.localizarBloco(selecionado);
      if (loc) setDialogo({ tipo: "atividade", diaIdx: loc.diaIdx, blocoId: selecionado });
    },
    Delete: () => {
      if (!selecionado) return;
      const removido = store.excluirBloco(selecionado);
      setSelecionado(null);
      if (removido) {
        avisar('"' + removido.bloco.rot + '" excluída', {
          desfazer: () => store.restaurarBloco(removido.diaIdx, removido.bloco)
        });
      }
    },
    " ": () => selecionado && store.alternarFeito(selecionado)
  }), [selecionado, range, status]);

  useAtalhos(atalhos, !dialogo && splashFechado && aba === "agenda");

  /* Troca de módulo vale em qualquer aba — os atalhos acima são da agenda. */
  const atalhosGlobais = useMemo(() => ({
    1: () => setAba("agenda"),
    2: () => setAba("treinos"),
    3: () => setAba("projetos"),
    "?": () => setDialogo({ tipo: "atalhos" })
  }), []);

  useAtalhos(atalhosGlobais, !dialogo && splashFechado);

  const dataPadraoEvento = range.dias.find(d => d.hoje)?.iso || range.inicioISO;

  return (
    <>
      <div className="app" data-transicao={transicao || undefined}>
        <input ref={importRef} type="file" accept="application/json" hidden onChange={importar} />

        {aba === "agenda" ? (
          <>
            <AgendaHeader
              aba={aba}
              onAba={setAba}
              range={range}
              status={status}
              onNavegar={navegar}
              onHoje={irParaHoje}
              onNova={() => setDialogo({ tipo: "atividade", diaIdx: range.dias.find(d => d.hoje)?.index ?? 0, blocoId: null })}
              onNovoEvento={() => setDialogo({ tipo: "evento", evento: null })}
              onCategorias={() => setDialogo({ tipo: "categorias" })}
              onPersonalizar={() => setDialogo({ tipo: "prefs" })}
              onDuplicar={() => setDialogo({ tipo: "duplicar" })}
              onExportar={exportar}
              onImportar={() => importRef.current?.click()}
              onAtalhos={() => setDialogo({ tipo: "atalhos" })}
            />

            <div className="conteudo" key={semanaAtual}>
              <WeeklyStatus summary={summary} decorrido={decorrido} />

              <WeekContext
                eventos={eventos}
                contextItems={contextItems}
                onNovo={() => setDialogo({ tipo: "evento", evento: null })}
                onEditar={evento => setDialogo({ tipo: "evento", evento })}
                onExcluir={id => store.excluirEvento(id)}
              />

              <CategoryBar
                categorias={estado.categorias}
                porCategoria={summary.porCategoria}
                filtro={filtro}
                onAlternar={alternarFiltro}
                onLimpar={() => setFiltro(new Set())}
              />

              <WeekGrid
                range={range}
                dias={estado.semanas[semanaAtual].dias}
                categorias={estado.categorias}
                densidade={prefs.densidade}
                filtro={filtro}
                conflitos={conflitos}
                selecionado={selecionado}
                agora={agora}
                onSelecionar={setSelecionado}
                onEditar={(diaIdx, blocoId) => setDialogo({ tipo: "atividade", diaIdx, blocoId })}
                onAdicionar={diaIdx => setDialogo({ tipo: "atividade", diaIdx, blocoId: null })}
              />

              <div className="camada-interpretacao">
                <WeekSummary summary={summary} />
                <WeekInsights insights={insights} />
              </div>

              <p className="rodape-dica">
                Arraste para reagendar · duplo clique para editar · <kbd>N</kbd> nova atividade · <kbd>←</kbd> <kbd>→</kbd> semanas
              </p>
            </div>
          </>
        ) : (
          (() => {
            const Modulo = aba === "treinos" ? TreinosApp : ProjetosApp;
            return (
              <Modulo
                aba={aba}
                onAba={setAba}
                onPersonalizar={() => setDialogo({ tipo: "prefs" })}
                onExportar={exportar}
                onImportar={() => importRef.current?.click()}
                onAtalhos={() => setDialogo({ tipo: "atalhos" })}
              />
            );
          })()
        )}
      </div>

      {dialogo?.tipo === "atividade" && (
        <ActivityModal
          key={dialogo.blocoId || `nova-${dialogo.diaIdx}`}
          estado={estado}
          range={range}
          modal={dialogo}
          onClose={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === "evento" && (
        <EventModal
          key={dialogo.evento?.id || "novo-evento"}
          evento={dialogo.evento}
          dataPadrao={dataPadraoEvento}
          onClose={() => setDialogo(null)}
        />
      )}
      {dialogo?.tipo === "categorias" && <CategoriesModal estado={estado} onClose={() => setDialogo(null)} />}
      {dialogo?.tipo === "prefs" && <PreferencesModal prefs={prefs} setPrefs={setPrefs} onClose={() => setDialogo(null)} />}
      {dialogo?.tipo === "atalhos" && <ShortcutsModal onClose={() => setDialogo(null)} />}
      {dialogo?.tipo === "duplicar" && <DuplicateWeekModal semanaAtual={semanaAtual} onClose={() => setDialogo(null)} />}

      <CamadaAvisos />

      {!splashFechado && <SplashScreen onEntered={() => setSplashFechado(true)} />}
    </>
  );
}
