/* ==========================================================================
   AGENDA SEMANAL — editor

   Os dados vivem em ESTADO (carregado/salvo no localStorage). O objeto SEMANA
   abaixo é só o ponto de partida da primeira vez; depois disso as edições
   são persistidas e ele deixa de ser usado.
   ========================================================================== */

const SEMANA = {
  periodo: "14 a 20 de setembro de 2026 · montada no domingo, 13/09",

  dias: [
    {
      nome: "Segunda", data: "14/09",
      blocos: [
        { tipo: "estagio",  rot: "Estágio",          ini: "08:00", fim: "12:00" },
        { tipo: "aula",     rot: "Aulas",            ini: "13:00", fim: "16:00" },
        { tipo: "academia", rot: "Academia",         ini: "19:30", fim: "21:00" },
        { tipo: "ingles",   rot: "Inglês · curto",   ini: "21:20", fim: "22:30" }
      ]
    },
    {
      nome: "Terça", data: "15/09",
      blocos: [
        { tipo: "estagio",  rot: "Estágio",              ini: "08:40", fim: "12:40" },
        { tipo: "flex",     rot: "Academia ou projetos", ini: "13:00", fim: "16:00" },
        { tipo: "ingles",   rot: "Inglês · longo",       ini: "19:00", fim: "20:30" }
      ]
    },
    {
      nome: "Quarta", data: "16/09",
      blocos: [
        { tipo: "estagio",  rot: "Estágio",          ini: "08:00", fim: "12:00" },
        { tipo: "aula",     rot: "Aulas",            ini: "13:00", fim: "16:00" },
        { tipo: "academia", rot: "Academia",         ini: "19:30", fim: "21:00" },
        { tipo: "ingles",   rot: "Inglês · longo",   ini: "21:20", fim: "22:50" }
      ]
    },
    {
      nome: "Quinta", data: "17/09",
      blocos: [
        { tipo: "evento",   rot: "CONIC",            ini: "08:00", fim: "18:00", nota: "sem estágio nem aula" },
        { tipo: "academia", rot: "Academia",         ini: "20:30", fim: "22:00" },
        { tipo: "ingles",   rot: "Inglês · curto",   ini: "22:15", fim: "23:25" }
      ]
    },
    {
      nome: "Sexta", data: "18/09",
      blocos: [
        { tipo: "estagio",  rot: "Estágio",          ini: "08:40", fim: "12:40" },
        { tipo: "aula",     rot: "Aulas",            ini: "15:30", fim: "17:00" },
        { tipo: "academia", rot: "Academia",         ini: "20:30", fim: "22:00" },
        { tipo: "ingles",   rot: "Inglês · curto",   ini: "22:15", fim: "23:25" }
      ]
    },
    {
      nome: "Sábado", data: "19/09", folga: true,
      blocos: [
        { tipo: "ingles",   rot: "Inglês · longo",   ini: "10:00", fim: "11:30" }
      ]
    },
    {
      nome: "Domingo", data: "20/09", folga: true,
      blocos: [
        { tipo: "ingles",   rot: "Anki · 10 min",    ini: "20:00", fim: "20:20" }
      ]
    }
  ],

  notas: [
    {
      titulo: "Inglês depois do treino",
      texto: "Os blocos de inglês ficam sempre após a academia. Nas quintas e sextas, com treino às 20:30, isso empurra a sessão para 22:15 — é o custo dessa escolha, e o dia em que ela mais pesa."
    },
    {
      titulo: "Quinta é atípica",
      texto: "CONIC das 8h às 18h, no lugar do estágio e das aulas. A noite segue normal."
    },
    {
      titulo: "Antes de fechar o próximo domingo",
      itens: [
        "Confirmar o tempo real de deslocamento Abreu e Lima ↔ Igarassu.",
        "Encaixar o PIBIC, ainda sem horário fixo — ~2h30 por dia em média; nos fins de semana fecho as dependências. Total: 20h semanais. A terça de tarde é a única janela grande.",
        "Sexta, 18/09: sai o resultado do Santander Fala Mundo. Se vier, o bloco de produção migra para a Immerse."
      ]
    }
  ],

  lembretes: [
    {
      titulo: "Santander Fala Mundo",
      data: "18/09",
      texto: "Resultado sai na sexta, 18/09. Se vier, o bloco de produção migra para a Immerse."
    },
    {
      titulo: "Rotina diária",
      data: "",
      texto: "Em pé às 6:00. Saída às 7:00 (seg e qua) e às 7:30 (ter, qui e sex). Quinta, 17/09, é atípica (CONIC)."
    }
  ]
};

/* ==========================================================================
   Estado e persistência
   ========================================================================== */

const CHAVE = "agenda-semanal:v3";
const FAIXA = { ini: "08:00", fim: "24:00" };
const PASSO = 10; // minutos por linha da grade
const SNAP_PADRAO = 30; // trava de 30 min para blocos comuns
const SNAP_REUNIAO = PASSO; // reuniões podem variar (10 min)
const PALETA = ["#7c7cf0", "#38bdf8", "#34d399", "#f472b6", "#fbbf24", "#f87171", "#a3a3a3"];

const el = id => document.getElementById(id);

const gerarId = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const toMin = hhmm => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = m => {
  m = Math.round(m);
  const h = Math.floor(m / 60), mm = m % 60;
  return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
};

const hojeDDMM = () => {
  const d = new Date();
  return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
};

const agoraMinutos = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

function formatarHoras(min) {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function isoParaData(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dataParaISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function segundaDe(data) {
  const d = new Date(data);
  const desloc = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desloc);
  d.setHours(0, 0, 0, 0);
  return d;
}

function semanaISO(data) {
  return dataParaISO(segundaDe(data));
}

function deslocarISO(iso, dias) {
  const d = isoParaData(iso);
  d.setDate(d.getDate() + dias);
  return dataParaISO(d);
}

function chaveDaSemanaDosDias(dias) {
  const [dd, mm] = (dias[0]?.data || "14/09").split("/").map(Number);
  const ano = new Date().getFullYear();
  return `${ano}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function periodoSemana(key) {
  const inicio = isoParaData(key);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  return `${inicio.getDate()} a ${fim.getDate()} de ${MESES[fim.getMonth()]} de ${fim.getFullYear()}`;
}

function gerarDiasDaSemana(key) {
  const inicio = isoParaData(key);
  return DIAS_SEMANA.map((nome, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return {
      nome,
      data: String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"),
      folga: i >= 5,
      blocos: []
    };
  });
}

function estadoInicial() {
  const categorias = [
    { id: "estagio",  nome: "Estágio",  cor: "#3fc1b3" },
    { id: "aula",     nome: "Aulas",    cor: "#6b8afd" },
    { id: "ingles",   nome: "Inglês",   cor: "#e58fc0" },
    { id: "academia", nome: "Academia", cor: "#f0a05a" },
    { id: "evento",   nome: "Evento",   cor: "#6fd0a0" },
    { id: "flex",     nome: "Flexível", cor: "#9aa4ad" },
    { id: "reuniao",  nome: "Reunião",  cor: "#22d3ee" }
  ];

  const dias = SEMANA.dias.map(d => ({
    nome: d.nome,
    data: d.data,
    folga: !!d.folga,
    blocos: d.blocos.map(b => ({
      id: gerarId(),
      cat: b.tipo,
      rot: b.rot,
      ini: b.ini,
      fim: b.fim,
      nota: b.nota || "",
      feito: false
    }))
  }));
  const notas = SEMANA.notas;
  const semanaAtual = chaveDaSemanaDosDias(dias);

  return {
    periodo: periodoSemana(semanaAtual),
    categorias,
    lembretes: SEMANA.lembretes,
    dias,
    notas,
    semanaAtual,
    semanas: { [semanaAtual]: { dias, notas } }
  };
}

function carregar() {
  try {
    const obj = JSON.parse(localStorage.getItem(CHAVE));
    if (obj && obj.semanas && obj.semanaAtual && Array.isArray(obj.categorias)) {
      if (!obj.semanas[obj.semanaAtual]) {
        const chaves = Object.keys(obj.semanas);
        obj.semanaAtual = chaves[0];
      }
      const atual = obj.semanas[obj.semanaAtual];
      obj.dias = atual.dias;
      obj.notas = atual.notas;
      obj.periodo = periodoSemana(obj.semanaAtual);
      obj.categorias = garantirReuniao(obj.categorias);
      obj.lembretes = obj.lembretes || SEMANA.lembretes;
      return obj;
    }
  } catch {}

  const migrado = migrarDeV2();
  return migrado || estadoInicial();
}

function migrarDeV2() {
  try {
    const obj = JSON.parse(localStorage.getItem("agenda-semanal:v2"));
    if (obj && Array.isArray(obj.dias) && Array.isArray(obj.categorias)) {
      const semanaAtual = chaveDaSemanaDosDias(obj.dias);
      const dias = obj.dias;
      const notas = obj.notas || [];
      return {
        categorias: garantirReuniao(obj.categorias),
        lembretes: obj.lembretes || SEMANA.lembretes,
        periodo: periodoSemana(semanaAtual),
        dias,
        notas,
        semanaAtual,
        semanas: { [semanaAtual]: { dias, notas } }
      };
    }
  } catch {}
  return null;
}

function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(ESTADO)); } catch {}
}

const ESTADO = carregar();

/* ==========================================================================
   Helpers de busca
   ========================================================================== */

const BASE = toMin(FAIXA.ini);
const TOPO = toMin(FAIXA.fim);
const LINHAS = (TOPO - BASE) / PASSO;

const linhaDe = hhmm => Math.round((toMin(hhmm) - BASE) / PASSO) + 2;

const todosBlocos = () => ESTADO.dias.flatMap(d => d.blocos);

const categoria = id => ESTADO.categorias.find(c => c.id === id);

function garantirReuniao(categorias) {
  if (!categorias.some(c =>
    (c.id || "").toLowerCase().includes("reuni") ||
    (c.nome || "").toLowerCase().includes("reuni")
  )) {
    categorias.push({ id: "reuniao", nome: "Reunião", cor: "#22d3ee" });
  }
  return categorias;
}

function passoDeSnap(bloco) {
  const c = categoria(bloco.cat);
  const alvo = ((c?.nome || "") + " " + (bloco.cat || "")).toLowerCase();
  return alvo.includes("reuni") ? SNAP_REUNIAO : SNAP_PADRAO;
}

function localizarBloco(id) {
  for (let i = 0; i < ESTADO.dias.length; i++) {
    const b = ESTADO.dias[i].blocos.find(x => x.id === id);
    if (b) return { diaIdx: i, bloco: b };
  }
  return null;
}

function removerBloco(id) {
  for (const dia of ESTADO.dias) {
    const i = dia.blocos.findIndex(b => b.id === id);
    if (i >= 0) { dia.blocos.splice(i, 1); return true; }
  }
  return false;
}

function blocosSobrepostos(diaIdx, inicio, fim, ignorarId) {
  return ESTADO.dias[diaIdx].blocos.filter(b =>
    b.id !== ignorarId && toMin(b.ini) < fim && toMin(b.fim) > inicio
  );
}

/* ==========================================================================
   Renderização
   ========================================================================== */

function montarGrade() {
  const grade = el("grade");
  grade.innerHTML = "";
  grade.style.gridTemplateRows = `auto repeat(${LINHAS}, var(--row))`;

  // canto vazio do trilho de horas
  const canto = document.createElement("div");
  canto.className = "cab";
  grade.appendChild(canto);

  // cabeçalhos dos dias
  ESTADO.dias.forEach((dia, i) => {
    const c = document.createElement("div");
    const ehHoje = dia.data === hojeDDMM();
    c.className = "cab" + (dia.folga ? " folga" : "") + (ehHoje ? " hoje" : "");
    c.innerHTML =
      `<span class="nome">${esc(dia.nome)}</span>` +
      `<span class="data">${esc(dia.data)}</span>` +
      `<button type="button" class="add-dia" title="Adicionar atividade">+</button>`;
    c.querySelector(".add-dia").addEventListener("click", () => abrirAtividade(i));
    grade.appendChild(c);
  });

  // trilho de horas e riscas
  for (let t = BASE; t < TOPO; t += 60) {
    const linha = Math.round((t - BASE) / PASSO) + 2;

    const h = document.createElement("div");
    h.className = "hora";
    h.style.gridRow = linha;
    h.textContent = String(Math.floor(t / 60)).padStart(2, "0") + ":00";
    grade.appendChild(h);

    const r = document.createElement("div");
    r.className = "risca";
    r.style.gridRow = linha;
    grade.appendChild(r);
  }

  // blocos
  ESTADO.dias.forEach((dia, i) => {
    dia.blocos.forEach(b => grade.appendChild(criarBloco(i, b)));
  });

  grade.appendChild(obterIndicador());
  esconderIndicador();

  grade.appendChild(obterMarcadorAgora());
  adicionarMarcadorAgora();
}

function criarBloco(diaIdx, b) {
  const duracao = toMin(b.fim) - toMin(b.ini);
  const node = document.createElement("div");
  node.className = "bl" + (duracao <= 30 ? " curto" : "");
  node.style.gridColumn = diaIdx + 2;
  node.style.gridRow = `${linhaDe(b.ini)} / ${linhaDe(b.fim)}`;
  node.style.setProperty("--cor", categoria(b.cat)?.cor || "var(--accent)");
  node.draggable = true;
  node.title = "Arraste para mover · duplo clique para editar";
  node.classList.toggle("feito", b.feito);

  const quando = b.nota ? `${b.ini} – ${b.fim} · ${esc(b.nota)}` : `${b.ini} – ${b.fim}`;
  node.innerHTML =
    `<input type="checkbox" aria-label="${esc(b.rot)}" ${b.feito ? "checked" : ""}>` +
    `<span class="rot">${esc(b.rot)}</span>` +
    `<span class="quando">${quando}</span>` +
    `<button type="button" class="bl-btn editar" title="Editar" aria-label="Editar">✎</button>` +
    `<button type="button" class="bl-btn excluir" title="Excluir" aria-label="Excluir">×</button>`;

  const input = node.querySelector("input");
  input.addEventListener("change", () => {
    b.feito = input.checked;
    node.classList.toggle("feito", b.feito);
    salvar();
    atualizarProgresso();
  });

  node.querySelector(".editar").addEventListener("click", e => {
    e.stopPropagation();
    abrirAtividade(diaIdx, b.id);
  });

  node.querySelector(".excluir").addEventListener("click", e => {
    e.stopPropagation();
    removerBloco(b.id);
    salvar();
    renderizar();
  });

  node.addEventListener("dblclick", e => {
    if (e.target.closest(".bl-btn, input")) return;
    abrirAtividade(diaIdx, b.id);
  });

  node.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", b.id);
    e.dataTransfer.effectAllowed = "move";
    requestAnimationFrame(() => node.classList.add("arrastando"));
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("arrastando");
    esconderIndicador();
  });

  return node;
}

function montarLegenda() {
  el("legenda").innerHTML = ESTADO.categorias.map(c =>
    `<div class="chip"><i style="background:${c.cor}"></i>${esc(c.nome)}</div>`
  ).join("");
}

function montarNotas() {
  el("notas").innerHTML = ESTADO.notas.map(n => {
    const corpo = n.itens
      ? `<ul>${n.itens.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`
      : `<p>${esc(n.texto)}</p>`;
    return `<div class="nota"><h2>${esc(n.titulo)}</h2>${corpo}</div>`;
  }).join("");
}

function montarLembretes() {
  const lista = ESTADO.lembretes || [];
  el("lembretes").innerHTML = lista.map(l =>
    `<div class="lembrete">` +
    `<h3>${esc(l.titulo)}${l.data ? `<span class="data">${esc(l.data)}</span>` : ""}</h3>` +
    `<p>${esc(l.texto)}</p>` +
    `</div>`
  ).join("");
}

function montarResumo() {
  const porCat = {};
  const porDia = ESTADO.dias.map(d => ({ nome: d.nome, min: 0 }));
  let total = 0;

  ESTADO.dias.forEach((d, i) => {
    d.blocos.forEach(b => {
      const dur = toMin(b.fim) - toMin(b.ini);
      total += dur;
      porCat[b.cat] = (porCat[b.cat] || 0) + dur;
      porDia[i].min += dur;
    });
  });

  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const catHtml = cats.map(([id, min]) => {
    const c = categoria(id);
    return `<div class="resumo-item"><i style="background:${c?.cor || "var(--accent)"}"></i>${esc(c?.nome || id)}<b>${formatarHoras(min)}</b></div>`;
  }).join("");

  const diaHtml = porDia.map(d =>
    `<span class="resumo-dia">${esc(d.nome)} <b>${formatarHoras(d.min)}</b></span>`
  ).join("");

  el("resumo").innerHTML =
    `<h2>Resumo da semana</h2>` +
    `<div class="resumo-lista">${catHtml}</div>` +
    `<div class="resumo-dias">${diaHtml}</div>` +
    `<div class="resumo-total">Total <b>${formatarHoras(total)}</b></div>`;
}

function atualizarProgresso() {
  const blocos = todosBlocos();
  const feitos = blocos.filter(b => b.feito).length;
  const ingleses = blocos.filter(b => b.cat === "ingles");
  const feitosIngles = ingleses.filter(b => b.feito).length;
  const p = blocos.length ? Math.round((feitos / blocos.length) * 100) : 0;

  el("pct").textContent = p + "%";
  el("preenchimento").style.width = p + "%";
  el("contagem").textContent = `${feitos} / ${blocos.length}`;
  el("contagem-ingles").textContent = `${feitosIngles} / ${ingleses.length}`;
}

function renderizar() {
  montarGrade();
  montarLegenda();
  montarResumo();
  atualizarProgresso();
}

/* ==========================================================================
   Arrastar e soltar
   ========================================================================== */

let indicadorArrasto = null;

function obterIndicador() {
  if (!indicadorArrasto) {
    indicadorArrasto = document.createElement("div");
    indicadorArrasto.className = "drop-indicador";
    indicadorArrasto.innerHTML = `<span class="drop-label"></span>`;
  }
  return indicadorArrasto;
}

function esconderIndicador() {
  obterIndicador().classList.remove("visivel");
}

function mapearTempo() {
  const riscas = el("grade").querySelectorAll(".risca");
  if (riscas.length < 2) return null;
  const r0 = riscas[0].getBoundingClientRect().top;
  const r1 = riscas[1].getBoundingClientRect().top;
  return { r0, pxPorPasso: (r1 - r0) / 6 };
}

let marcadorAgora = null;

function obterMarcadorAgora() {
  if (!marcadorAgora) {
    marcadorAgora = document.createElement("div");
    marcadorAgora.className = "agora";
    marcadorAgora.innerHTML = `<span class="agora-label"></span>`;
  }
  return marcadorAgora;
}

function adicionarMarcadorAgora() {
  const grade = el("grade");
  const marc = obterMarcadorAgora();
  const diaIdx = ESTADO.dias.findIndex(d => d.data === hojeDDMM());
  const agoraMin = agoraMinutos();

  if (diaIdx === -1 || agoraMin < BASE || agoraMin >= TOPO) {
    marc.classList.remove("visivel");
    return;
  }

  const m = mapearTempo();
  const cabs = grade.querySelectorAll(".cab");
  if (!m || !cabs[diaIdx + 1]) { marc.classList.remove("visivel"); return; }

  const cabRect = cabs[diaIdx + 1].getBoundingClientRect();
  const gradeRect = grade.getBoundingClientRect();
  const y = m.r0 + ((agoraMin - BASE) / PASSO) * m.pxPorPasso;

  marc.style.left = (cabRect.left - gradeRect.left) + "px";
  marc.style.top = (y - gradeRect.top) + "px";
  marc.style.width = cabRect.width + "px";
  marc.querySelector(".agora-label").textContent = `agora · ${toHHMM(agoraMin)}`;
  marc.classList.add("visivel");
}

function configurarArrasto() {
  const grade = el("grade");
  let alvo = null;

  grade.addEventListener("dragover", e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const loc = localizarBloco(id);
    if (!loc) return;

    const diaIdx = indiceDiaPeloX(e.clientX);
    if (diaIdx == null) { esconderIndicador(); alvo = null; return; }

    const duracao = toMin(loc.bloco.fim) - toMin(loc.bloco.ini);
    const passo = passoDeSnap(loc.bloco);
    const inicio = inicioPeloY(e.clientY, duracao, passo);
    alvo = { diaIdx, inicio, duracao };
    mostrarIndicador(alvo, id);
  });

  grade.addEventListener("drop", e => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    const loc = localizarBloco(id);
    if (!loc) return;

    const diaIdx = alvo ? alvo.diaIdx : indiceDiaPeloX(e.clientX);
    if (diaIdx == null) { esconderIndicador(); alvo = null; return; }

    const duracao = toMin(loc.bloco.fim) - toMin(loc.bloco.ini);
    const passo = passoDeSnap(loc.bloco);
    const inicio = alvo ? alvo.inicio : inicioPeloY(e.clientY, duracao, passo);

    const conflitos = blocosSobrepostos(diaIdx, inicio, inicio + duracao, id);
    if (conflitos.length && !confirm(`Conflito com "${conflitos[0].rot}". Mover mesmo assim?`)) {
      esconderIndicador();
      alvo = null;
      return;
    }

    removerBloco(id);
    loc.bloco.ini = toHHMM(inicio);
    loc.bloco.fim = toHHMM(inicio + duracao);
    ESTADO.dias[diaIdx].blocos.push(loc.bloco);

    esconderIndicador();
    alvo = null;
    salvar();
    renderizar();
  });
}

function mostrarIndicador(alvo, id) {
  const grade = el("grade");
  const ind = obterIndicador();
  const cabs = grade.querySelectorAll(".cab");
  const m = mapearTempo();

  if (!cabs[alvo.diaIdx + 1] || !m) return;

  const cabRect = cabs[alvo.diaIdx + 1].getBoundingClientRect();
  const gradeRect = grade.getBoundingClientRect();
  const topo = m.r0 + ((alvo.inicio - BASE) / PASSO) * m.pxPorPasso;
  const altura = (alvo.duracao / PASSO) * m.pxPorPasso;
  const fim = alvo.inicio + alvo.duracao;
  const conflito = blocosSobrepostos(alvo.diaIdx, alvo.inicio, fim, id).length > 0;

  ind.style.left = (cabRect.left - gradeRect.left) + "px";
  ind.style.top = (topo - gradeRect.top) + "px";
  ind.style.width = cabRect.width + "px";
  ind.style.height = altura + "px";
  ind.querySelector(".drop-label").textContent = conflito
    ? `conflito · ${toHHMM(alvo.inicio)}`
    : `${ESTADO.dias[alvo.diaIdx].nome} · ${toHHMM(alvo.inicio)}`;
  ind.classList.toggle("conflito", conflito);
  ind.classList.add("visivel");
}

function indiceDiaPeloX(x) {
  const cabs = Array.from(el("grade").querySelectorAll(".cab"));
  for (let i = 1; i < cabs.length; i++) {
    const r = cabs[i].getBoundingClientRect();
    if (x >= r.left && x <= r.right) return i - 1;
  }
  return null;
}

function inicioPeloY(y, duracao, passo = SNAP_PADRAO) {
  const m = mapearTempo();
  if (!m) return BASE;
  const pxPorMin = m.pxPorPasso / PASSO;
  const minRel = (y - m.r0) / pxPorMin;
  const inicio = BASE + Math.round(minRel / passo) * passo;
  return Math.max(BASE, Math.min(inicio, TOPO - duracao));
}

/* ==========================================================================
   Modal de atividade
   ========================================================================== */

function preencherSelectDia() {
  el("f-dia").innerHTML = ESTADO.dias.map((d, i) =>
    `<option value="${i}">${esc(d.nome)} · ${esc(d.data)}</option>`
  ).join("");
}

function preencherSelectCategoria(selecionado) {
  el("f-cat").innerHTML = ESTADO.categorias.map(c =>
    `<option value="${c.id}" ${c.id === selecionado ? "selected" : ""}>${esc(c.nome)}</option>`
  ).join("");
}

function abrirAtividade(diaIdx, blocoId) {
  const form = el("form-atividade");
  form.reset();
  preencherSelectDia();
  preencherSelectCategoria(ESTADO.categorias[0]?.id);

  if (blocoId) {
    const loc = localizarBloco(blocoId);
    if (!loc) return;
    el("titulo-atividade").textContent = "Editar atividade";
    el("f-id").value = blocoId;
    el("f-dia").value = loc.diaIdx;
    el("f-nome").value = loc.bloco.rot;
    el("f-ini").value = loc.bloco.ini;
    el("f-fim").value = loc.bloco.fim;
    preencherSelectCategoria(loc.bloco.cat);
    el("f-nota").value = loc.bloco.nota || "";
    el("btn-excluir").hidden = false;
  } else {
    el("titulo-atividade").textContent = "Nova atividade";
    el("f-id").value = "";
    el("f-dia").value = diaIdx != null ? diaIdx : 0;
    el("f-nome").value = "";
    el("f-ini").value = "09:00";
    el("f-fim").value = "10:00";
    el("f-nota").value = "";
    el("btn-excluir").hidden = true;
  }

  el("overlay-atividade").hidden = false;
  el("f-nome").focus();
}

function fecharAtividade() {
  el("overlay-atividade").hidden = true;
}

function salvarAtividade(e) {
  e.preventDefault();

  const id = el("f-id").value;
  const diaIdx = Number(el("f-dia").value);
  const nome = el("f-nome").value.trim();
  const ini = el("f-ini").value;
  const fim = el("f-fim").value;
  const cat = el("f-cat").value;
  const nota = el("f-nota").value.trim();

  if (!nome || !ini || !fim || !cat) return;

  let iniM = Math.max(BASE, Math.min(toMin(ini), TOPO - PASSO));
  let fimM = Math.max(iniM + PASSO, Math.min(toMin(fim), TOPO));
  if (fimM <= iniM) fimM = iniM + PASSO;

  const dados = {
    cat,
    rot: nome,
    ini: toHHMM(iniM),
    fim: toHHMM(fimM),
    nota
  };

  const conflitos = blocosSobrepostos(diaIdx, iniM, fimM, id);
  if (conflitos.length && !confirm(`Conflito com "${conflitos[0].rot}". Salvar mesmo assim?`)) {
    return;
  }

  if (id) {
    const loc = localizarBloco(id);
    if (loc) Object.assign(loc.bloco, dados);
  } else {
    ESTADO.dias[diaIdx].blocos.push({ ...dados, id: gerarId(), feito: false });
  }

  salvar();
  fecharAtividade();
  renderizar();
}

/* ==========================================================================
   Modal de categorias
   ========================================================================== */

function abrirCategorias() {
  el("overlay-categorias").hidden = false;
  renderizarCategorias();
}

function renderizarCategorias() {
  const lista = el("lista-categorias");
  lista.innerHTML = "";

  ESTADO.categorias.forEach(c => {
    const emUso = todosBlocos().some(b => b.cat === c.id);
    const unica = ESTADO.categorias.length <= 1;
    const podeExcluir = !emUso && !unica;
    const li = document.createElement("li");
    li.className = "cat-item";
    li.innerHTML =
      `<input type="color" class="cat-cor" value="${c.cor}" title="Cor">` +
      `<input type="text" class="cat-nome" value="${esc(c.nome)}" maxlength="30" placeholder="Nome da categoria">` +
      (emUso ? `<span class="em-uso">em uso</span>` : "") +
      `<button type="button" class="btn mini perigo excluir" ${podeExcluir ? "" : "disabled"} title="${emUso ? "Em uso" : unica ? "Pelo menos uma categoria" : "Excluir"}">×</button>`;

    li.querySelector(".cat-cor").addEventListener("input", e => {
      c.cor = e.target.value;
      salvar();
      renderizar();
    });

    li.querySelector(".cat-nome").addEventListener("input", e => {
      c.nome = e.target.value;
      salvar();
      montarLegenda();
    });

    li.querySelector(".excluir").addEventListener("click", () => {
      ESTADO.categorias = ESTADO.categorias.filter(x => x.id !== c.id);
      salvar();
      renderizar();
      renderizarCategorias();
    });

    lista.appendChild(li);
  });
}

function novaCategoria() {
  ESTADO.categorias.push({
    id: gerarId(),
    nome: "Nova categoria",
    cor: PALETA[ESTADO.categorias.length % PALETA.length]
  });
  salvar();
  renderizarCategorias();
  montarLegenda();

  const nomes = el("lista-categorias").querySelectorAll(".cat-nome");
  const ultimo = nomes[nomes.length - 1];
  if (ultimo) { ultimo.focus(); ultimo.select(); }
}

/* ==========================================================================
   Fechamento de modais e eventos globais
   ========================================================================== */

function fecharModais() {
  el("overlay-atividade").hidden = true;
  el("overlay-categorias").hidden = true;
}

function navegarParaKey(novaKey) {
  if (novaKey === ESTADO.semanaAtual) return;
  ESTADO.semanas[ESTADO.semanaAtual] = { dias: ESTADO.dias, notas: ESTADO.notas };

  const existente = ESTADO.semanas[novaKey];
  if (existente) {
    ESTADO.dias = existente.dias;
    ESTADO.notas = existente.notas;
  } else {
    ESTADO.dias = gerarDiasDaSemana(novaKey);
    ESTADO.notas = [];
    ESTADO.semanas[novaKey] = { dias: ESTADO.dias, notas: ESTADO.notas };
  }

  ESTADO.semanaAtual = novaKey;
  ESTADO.periodo = periodoSemana(novaKey);
  salvar();
  el("periodo").textContent = ESTADO.periodo;
  montarNotas();
  renderizar();
}

function navegarSemana(offset) {
  navegarParaKey(deslocarISO(ESTADO.semanaAtual, offset * 7));
}

function irParaHoje() {
  navegarParaKey(semanaISO(new Date()));
}

function exportar() {
  const blob = new Blob([JSON.stringify(ESTADO, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agenda-semanal.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importarArquivo(arquivo) {
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const obj = JSON.parse(leitor.result);
      let estado;

      if (obj && obj.semanas && obj.semanaAtual && Array.isArray(obj.categorias)) {
        estado = obj;
        if (!estado.semanas[estado.semanaAtual]) {
          estado.semanaAtual = Object.keys(estado.semanas)[0];
        }
      } else if (obj && Array.isArray(obj.dias) && Array.isArray(obj.categorias)) {
        const semanaAtual = chaveDaSemanaDosDias(obj.dias);
        estado = {
          categorias: obj.categorias,
          lembretes: obj.lembretes || [],
          dias: obj.dias,
          notas: obj.notas || [],
          semanaAtual,
          semanas: { [semanaAtual]: { dias: obj.dias, notas: obj.notas || [] } }
        };
      } else {
        throw new Error("inválido");
      }

      ESTADO.categorias = garantirReuniao(estado.categorias);
      ESTADO.lembretes = estado.lembretes || [];
      ESTADO.semanas = estado.semanas;
      ESTADO.semanaAtual = estado.semanaAtual;
      const atual = estado.semanas[estado.semanaAtual];
      ESTADO.dias = atual.dias;
      ESTADO.notas = atual.notas;
      ESTADO.periodo = periodoSemana(estado.semanaAtual);

      salvar();
      el("periodo").textContent = ESTADO.periodo;
      montarNotas();
      montarLembretes();
      renderizar();
    } catch {
      alert("Arquivo inválido. Use um backup exportado por esta agenda.");
    }
  };
  leitor.readAsText(arquivo);
}

function ligarEventos() {
  el("btn-prev").addEventListener("click", () => navegarSemana(-1));
  el("btn-hoje").addEventListener("click", irParaHoje);
  el("btn-prox").addEventListener("click", () => navegarSemana(1));
  el("btn-nova").addEventListener("click", () => abrirAtividade());
  el("btn-categorias").addEventListener("click", abrirCategorias);
  el("btn-exportar").addEventListener("click", exportar);
  el("btn-importar").addEventListener("click", () => el("input-importar").click());
  el("input-importar").addEventListener("change", e => {
    if (e.target.files[0]) importarArquivo(e.target.files[0]);
    e.target.value = "";
  });
  el("btn-add-cat").addEventListener("click", novaCategoria);
  el("form-atividade").addEventListener("submit", salvarAtividade);
  el("btn-excluir").addEventListener("click", () => {
    const id = el("f-id").value;
    if (id) { removerBloco(id); salvar(); }
    fecharAtividade();
    renderizar();
  });

  document.querySelectorAll("[data-fechar]").forEach(b =>
    b.addEventListener("click", fecharModais)
  );

  document.querySelectorAll(".overlay").forEach(o =>
    o.addEventListener("click", e => { if (e.target === o) fecharModais(); })
  );

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") fecharModais();
  });

  configurarArrasto();
}

/* ==========================================================================
   Inicialização
   ========================================================================== */

el("periodo").textContent = ESTADO.periodo;
montarNotas();
montarLembretes();
renderizar();
ligarEventos();
