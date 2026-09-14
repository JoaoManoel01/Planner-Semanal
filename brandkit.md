# brandkit.md
# Agenda Semanal — Brand System + UI Engineering Specification

> Documento-base para implementação visual e técnica da Agenda Semanal.
> Objetivo: transformar a identidade visual em regras executáveis, reutilizáveis e consistentes no código.

---

## 1. Visão do produto

A Agenda Semanal não deve ser tratada como um simples calendário.

Sua proposta visual e funcional é:

> **Ver a semana como um sistema.**

O produto combina:

- agenda semanal;
- compromissos por faixa horária;
- categorias visuais;
- resumo de carga semanal;
- observações e insights;
- navegação rápida;
- armazenamento local;
- experiência de aplicativo nativo.

A interface deve transmitir:

**precisão + controle + clareza + discrição + inteligência.**

Evitar a estética de:
- calendário corporativo genérico;
- dashboard excessivamente colorido;
- aplicativo “gamificado”;
- interface carregada de elementos de IA;
- excesso de sombras, gradientes e efeitos.

---

# 2. Princípios de design

## 2.1 Hierarquia temporal

O tempo é a estrutura principal da interface.

```text
Semana
 ├── Dia
 │    ├── Horário
 │    │    └── Compromisso
 │    └── Eventos
 └── Resumo
```

A grade semanal deve ser o elemento visual dominante.

## 2.2 Cor comunica função

As cores não devem decorar a interface.

Elas devem comunicar:

- identidade;
- categoria;
- estado;
- foco;
- ação.

## 2.3 Informação antes de ornamentação

Cada elemento visual deve justificar sua existência.

Preferir:
- bordas sutis;
- contraste;
- espaçamento;
- tipografia;
- microindicadores.

Evitar:
- sombras fortes;
- glassmorphism excessivo;
- gradientes decorativos;
- animações prolongadas.

## 2.4 Inteligência sem espetáculo

Insights devem parecer parte natural do sistema.

Correto:

> Quinta é atípica

> Você possui 10h de atividades entre 08:00 e 22:00.

Evitar:

> ✨ AI INSIGHT

A inteligência está na informação apresentada, não em símbolos de IA.

---

# 3. Design Tokens

Todos os valores abaixo devem existir como tokens centralizados.

Não utilizar valores hexadecimais diretamente em componentes.

---

## 3.1 Cores fundamentais

```css
:root {
  /* Background */
  --color-bg-void: #080B0D;
  --color-bg-base: #0D1114;

  /* Surfaces */
  --color-surface-1: #13181C;
  --color-surface-2: #181E22;

  /* Borders */
  --color-border: #252D32;
  --color-border-strong: #303A40;

  /* Text */
  --color-text-primary: #E8EDF0;
  --color-text-secondary: #98A5AD;
  --color-text-muted: #627078;
  --color-text-disabled: #414B51;

  /* Brand */
  --color-brand-petrol: #16454C;
  --color-brand-cyan: #21C7C4;
  --color-brand-cyan-soft: #143A3D;
}
```

### Semântica

| Token | Função |
|---|---|
| `bg-void` | áreas mais profundas / shell |
| `bg-base` | fundo principal |
| `surface-1` | cards |
| `surface-2` | cards elevados / menus |
| `border` | divisores normais |
| `border-strong` | foco estrutural |
| `text-primary` | informação principal |
| `text-secondary` | informação auxiliar |
| `text-muted` | rótulos discretos |
| `brand-petrol` | identidade |
| `brand-cyan` | ação / foco |
| `brand-cyan-soft` | seleção / fundo contextual |

---

# 4. Cores de categorias

As categorias possuem identidade cromática própria.

```css
:root {
  --category-stage: #37C98B;
  --category-classes: #5B8DEF;
  --category-english: #D56BAE;
  --category-gym: #A978F4;
  --category-event: #65C98A;
  --category-flexible: #87939A;
  --category-pibic: #28BFD0;
  --category-time: #55C7E8;
}
```

## 4.1 Uso obrigatório

A cor da categoria deve aparecer principalmente em:

- dot;
- barra lateral;
- pequena borda;
- estado selecionado;
- legenda.

### Não recomendado

Preencher todo o card com a cor da categoria.

### Recomendado

```text
┌────────────────────────┐
│ ● Estágio              │
│   08:00 — 12:00        │
└────────────────────────┘
```

A cor identifica o compromisso sem destruir a neutralidade da superfície.

---

# 5. Tipografia

## 5.1 Fontes

### Display / títulos
**Space Grotesk**

### Interface / conteúdo
**Inter**

```css
:root {
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

## 5.2 Escala

```css
:root {
  --font-size-display: 28px;
  --font-size-heading: 20px;
  --font-size-title: 16px;
  --font-size-body: 13px;
  --font-size-small: 11px;
  --font-size-micro: 10px;
}
```

## 5.3 Pesos

```css
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}
```

### Regra

Não utilizar `700` como padrão.

A interface deve permanecer leve mesmo quando possui muita informação.

---

# 6. Espaçamento

Utilizar base de 4 px.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

### Guia

```text
4px   micro espaçamento
8px   elementos internos
12px  grupos pequenos
16px  padding padrão
20px  grupos de conteúdo
24px  seções
32px  separações principais
```

---

# 7. Raios

Os cards devem parecer superfícies de software, não cartões de aplicativo mobile.

```css
:root {
  --radius-sm: 5px;
  --radius-md: 8px;
  --radius-lg: 10px;
}
```

Uso:

- `sm`: badges, chips, pequenos controles;
- `md`: cards, inputs, botões;
- `lg`: modais e superfícies maiores.

---

# 8. Bordas e elevação

A interface utiliza profundidade principalmente através de:

1. contraste;
2. borda;
3. superfície.

Sombras devem ser mínimas.

```css
:root {
  --shadow-none: none;
  --shadow-soft: 0 4px 16px rgba(0, 0, 0, 0.18);
}
```

Não utilizar sombras como elemento dominante da identidade.

---

# 9. Sistema de ícones

## 9.1 Princípio

Os ícones devem ser:

- outline;
- geométricos;
- simples;
- consistentes;
- com `stroke-width` uniforme;
- visualmente compatíveis com uma interface desktop.

## 9.2 Padrão técnico

Recomendação:

**SVG inline ou componentes SVG reutilizáveis.**

Não utilizar PNG para ícones da interface.

O sistema deve tratar cada ícone como componente.

Exemplo:

```tsx
<IconCalendar size={16} />
<IconClock size={16} />
<IconPlus size={16} />
```

---

# 10. Geometria dos ícones

Padrão base:

```text
viewBox = 24 × 24
stroke = currentColor
stroke-width = 1.5
stroke-linecap = round
stroke-linejoin = round
fill = none
```

Exemplo:

```tsx
type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function IconPlus({
  size = 16,
  strokeWidth = 1.5,
  className
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
```

---

# 11. Escala dos ícones

```text
12px  → micro indicadores
14px  → texto / chips
16px  → controles normais
18px  → controles importantes
20px  → navegação
24px  → ações destacadas
32px  → ilustrações funcionais
```

O tamanho padrão da interface é **16 px**.

---

# 12. Ícones obrigatórios

O sistema inicial deve possuir:

```text
Calendar
Clock
Plus
Minus
ChevronLeft
ChevronRight
ChevronDown
ChevronUp
Edit
Trash
Check
Close
Search
Filter
Settings
Download
Upload
MoreHorizontal
MoreVertical
Refresh
Undo
Redo
```

Para a agenda:

```text
CalendarDays
Alarm
Bell
Repeat
Pin
Tag
```

---

# 13. Ícone de aplicativo

O símbolo da marca deve representar:

**tempo + foco + sistema.**

Direção visual:

```text
─────┬─────
     │
─────●─────
     │
─────┴─────
```

O ponto central representa o momento atual dentro de uma estrutura temporal.

A versão de aplicativo deve funcionar em:

```text
256 × 256
128 × 128
64 × 64
32 × 32
16 × 16
```

Em tamanhos pequenos, simplificar o símbolo.

---

# 14. Componentes

Todos os componentes devem seguir o sistema de tokens.

## Button

Tipos:

```text
Primary
Secondary
Ghost
Danger
Icon
```

### Primary

```css
background: var(--color-brand-cyan);
color: var(--color-bg-void);
```

### Secondary

```css
background: var(--color-surface-2);
color: var(--color-text-primary);
border: 1px solid var(--color-border);
```

### Ghost

```css
background: transparent;
color: var(--color-text-secondary);
```

---

# 15. Activity Card

Estrutura:

```tsx
<ActivityCard
  category="stage"
  title="Estágio"
  start="08:00"
  end="12:00"
  description="..."
/>
```

Modelo visual:

```text
┌─────────────────────────────┐
│ ● Estágio             ⋮     │
│ 08:00 — 12:00               │
│                             │
│ descrição opcional          │
└─────────────────────────────┘
```

Estados:

```text
default
hover
selected
dragging
completed
conflict
```

---

# 16. Estado selecionado

O estado selecionado não deve depender apenas da cor.

Usar combinação de:

- borda;
- contraste de superfície;
- pequeno acento de cor;
- foco visual.

Exemplo:

```css
.activity[data-selected="true"] {
  background: var(--color-brand-cyan-soft);
  border-color: var(--color-brand-cyan);
}
```

---

# 17. Grade semanal

A grade possui três dimensões:

```text
X = dias
Y = horários
Z = categoria/atividade
```

Estrutura conceitual:

```tsx
<WeekView>
  <TimeColumn />
  {days.map(day => (
    <DayColumn key={day.id}>
      {activities.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
        />
      ))}
    </DayColumn>
  ))}
</WeekView>
```

A grade não deve conter regra de negócio complexa.

Ela deve receber dados já normalizados.

---

# 18. Separação entre UI e domínio

Não misturar:

```text
renderização
+
persistência
+
regras de horário
+
cálculos
```

Cada camada deve ter responsabilidade clara.

Arquitetura recomendada:

```text
UI
 ↓
Application / Use Cases
 ↓
Domain
 ↓
Infrastructure
 ↓
Local Storage / SQLite
```

---

# 19. Modelo de domínio

Entidade principal:

```ts
type Activity = {
  id: string;
  title: string;

  startAt: string;
  endAt: string;

  categoryId: string;

  description?: string;

  completed: boolean;

  flexible?: boolean;

  recurrence?: RecurrenceRule | null;

  createdAt: string;
  updatedAt: string;
};
```

Categoria:

```ts
type Category = {
  id: string;
  name: string;
  colorToken: string;
  icon?: string;
  active: boolean;
};
```

Insight:

```ts
type WeeklyInsight = {
  id: string;
  weekStart: string;
  title: string;
  body: string;
  severity: "info" | "attention" | "positive";
};
```

---

# 20. Armazenamento local

Como o produto é local/nativo, a persistência deve funcionar sem internet.

Preferência arquitetural:

```text
SQLite
  ↓
Repository
  ↓
Domain
  ↓
UI
```

Não acessar SQLite diretamente dentro dos componentes.

Exemplo:

```ts
interface ActivityRepository {
  getByWeek(weekStart: string): Promise<Activity[]>;
  getById(id: string): Promise<Activity | null>;
  create(activity: Activity): Promise<void>;
  update(activity: Activity): Promise<void>;
  delete(id: string): Promise<void>;
}
```

---

# 21. IDs

Utilizar IDs estáveis.

Preferência:

```text
UUID
```

ou outro identificador único equivalente.

Nunca usar o índice do array como `id`.

---

# 22. Estado da aplicação

Separar:

## UI State

```text
selectedDay
selectedActivity
modalOpen
currentWeek
viewMode
```

## Domain State

```text
activities
categories
insights
settings
```

## Persisted State

```text
activities
categories
preferences
```

A UI não deve possuir a responsabilidade de decidir como salvar dados.

---

# 23. Cálculos da semana

Os cálculos devem ser funções puras.

Exemplo:

```ts
function calculateWeeklyHours(
  activities: Activity[]
): number {
  return activities.reduce((total, activity) => {
    return total + differenceInMinutes(
      parseISO(activity.endAt),
      parseISO(activity.startAt)
    );
  }, 0) / 60;
}
```

Outros cálculos:

```text
total de horas
horas por categoria
horas por dia
percentual concluído
dias mais carregados
intervalos livres
conflitos
atividade atípica
```

---

# 24. Insights

Insights devem ser produzidos por uma camada própria.

```text
Weekly Data
   ↓
Analytics
   ↓
Rules
   ↓
Insights
   ↓
Insight Cards
```

Exemplo:

```ts
function detectBusyDay(day: DaySummary): WeeklyInsight | null {
  if (day.totalHours >= 10) {
    return {
      id: crypto.randomUUID(),
      weekStart: day.weekStart,
      title: `${day.name} é atípica`,
      body: `Você possui ${day.totalHours}h de atividades neste dia.`,
      severity: "attention"
    };
  }

  return null;
}
```

Não colocar essa lógica diretamente no componente visual.

---

# 25. Modelo de desenvolvimento

O projeto deve seguir desenvolvimento incremental.

## Fase 1 — Foundation

Criar:

```text
tokens
typography
icons
buttons
inputs
cards
layout
```

Objetivo:

**construir a linguagem visual.**

---

## Fase 2 — Agenda

Implementar:

```text
week navigation
day columns
time grid
activity cards
create activity
edit activity
delete activity
```

Objetivo:

**tornar a agenda funcional.**

---

## Fase 3 — Persistência

Implementar:

```text
SQLite
repositories
migrations
backup
restore
```

Objetivo:

**garantir os dados localmente.**

---

## Fase 4 — Inteligência da semana

Implementar:

```text
weekly summary
category totals
completion rate
busy-day detection
free-time detection
insights
```

Objetivo:

**transformar agenda em sistema de interpretação.**

---

## Fase 5 — Refinamento nativo

Implementar:

```text
keyboard shortcuts
native menus
system tray, se necessário
drag and drop
context menus
window state
startup behavior
offline-first
```

Objetivo:

**fazer a aplicação parecer realmente nativa.**

---

# 26. Padrão de desenvolvimento de componentes

Cada componente deve possuir:

```text
component/
├── Component.tsx
├── Component.test.tsx
└── index.ts
```

Quando houver necessidade de estilos específicos:

```text
component/
├── Component.tsx
├── Component.module.css
├── Component.test.tsx
└── index.ts
```

Evitar componentes gigantes.

Um componente não deve concentrar:

- acesso ao banco;
- regras de negócio;
- cálculos complexos;
- renderização inteira da aplicação.

---

# 27. Regra de responsabilidade

Cada módulo responde uma pergunta:

```text
UI
"O que aparece?"

Application
"O que o usuário está tentando fazer?"

Domain
"Qual é a regra?"

Infrastructure
"Como isso é armazenado?"

Database
"Como os dados existem fisicamente?"
```

---

# 28. Nomenclatura

Componentes:

```text
PascalCase
```

Funções:

```text
camelCase
```

Tipos:

```text
PascalCase
```

Tokens:

```text
kebab-case
```

Exemplo:

```text
ActivityCard
createActivity()
Activity
--color-text-primary
```

---

# 29. Performance

Como a agenda possui uma quantidade relativamente pequena de eventos, a prioridade não é micro-otimização.

Prioridades:

1. inicialização rápida;
2. resposta imediata da interface;
3. persistência confiável;
4. baixo consumo;
5. simplicidade arquitetural.

Evitar introduzir complexidade de virtualização ou caching sem evidência de necessidade.

---

# 30. Acessibilidade

Mesmo sendo uma aplicação pessoal, os componentes devem respeitar:

- contraste suficiente;
- foco visível;
- navegação por teclado;
- áreas de clique adequadas;
- labels para ícones;
- estado não comunicado apenas por cor.

Ícones decorativos:

```tsx
aria-hidden="true"
```

Ícones acionáveis:

```tsx
aria-label="Excluir atividade"
```

---

# 31. Atalhos de teclado

A experiência nativa deve aproveitar teclado.

Sugestão inicial:

```text
N           nova atividade
T           voltar para hoje
← / →       semana anterior / próxima
Esc         fechar modal
Enter       confirmar
Delete      excluir atividade selecionada
Ctrl/Cmd+F  pesquisar
Ctrl/Cmd+S  salvar, quando aplicável
```

Os atalhos devem ser documentados dentro de uma tela de ajuda.

---

# 32. Drag and Drop

Quando implementado, o arrastar de atividade deve alterar apenas o posicionamento temporal.

Fluxo:

```text
drag
 ↓
calculate target date/time
 ↓
validate
 ↓
update activity
 ↓
persist
 ↓
refresh summary
 ↓
refresh insights
```

A lógica não deve ficar no componente visual do card.

---

# 33. Modelo de telas

## Principal

```text
Header
 ├── semana
 ├── navegação
 └── ações

Context
 ├── destaque atual
 └── rotina diária

Categories

Week Grid

Weekly Summary

Insights
```

## Modal de atividade

```text
Título
Categoria
Data
Início
Fim
Descrição
Recorrência
Flexível
Salvar
Cancelar
```

## Configurações

```text
Categorias
Preferências
Aparência
Atalhos
Dados
Backup
Importação
Exportação
```

---

# 34. Exportação / importação

O sistema deve permitir exportar dados em formato estruturado.

Preferência:

```text
JSON → backup completo
CSV  → intercâmbio de atividades
```

Formato conceitual:

```json
{
  "version": 1,
  "exportedAt": "2026-09-13T00:00:00Z",
  "activities": [],
  "categories": [],
  "settings": {}
}
```

A versão do arquivo é obrigatória para permitir migrações futuras.

---

# 35. Versionamento de banco

Toda alteração estrutural deve gerar migration.

Exemplo:

```text
001_initial
002_add_recurrence
003_add_flexible
004_add_insights
```

Nunca alterar silenciosamente o schema existente.

---

# 36. Testes

Prioridade de testes:

## Alta

- cálculo de duração;
- cálculo semanal;
- conflitos;
- recorrência;
- persistência;
- importação;
- exportação;
- migrations.

## Média

- componentes de formulário;
- filtros;
- navegação.

## Visual

Utilizar snapshots/component tests quando fizer sentido.

---

# 37. Princípio de QA

Toda nova funcionalidade deve ser validada em quatro dimensões:

```text
Funcional
Visual
Dados
Experiência
```

Exemplo:

### Nova atividade

Funcional:
- cria corretamente.

Visual:
- aparece na posição correta.

Dados:
- permanece após reiniciar o app.

Experiência:
- criação é rápida e clara.

---

# 38. Modelo de Git

Branches:

```text
main
develop
feature/*
fix/*
refactor/*
```

Commits:

```text
feat: add weekly navigation
fix: prevent overlapping activities
refactor: isolate activity repository
style: adjust calendar spacing
test: add weekly duration tests
```

---

# 39. Stack recomendada

Para uma aplicação desktop local moderna:

```text
Frontend
React + TypeScript

Desktop Runtime
Tauri

Styling
CSS Modules ou Tailwind com tokens centralizados

State
Zustand ou equivalente simples

Database
SQLite

Data Access
Repository Pattern

Validation
Zod ou equivalente

Icons
SVG components

Testing
Vitest + Testing Library
```

Princípio:

> escolher ferramentas por responsabilidade, não por quantidade.

Não adicionar biblioteca para resolver um problema que poucas linhas de código resolvem.

---

# 40. Arquitetura sugerida

```text
src/
│
├── app/
│   ├── routes/
│   ├── providers/
│   └── config/
│
├── components/
│   ├── ui/
│   ├── calendar/
│   ├── activities/
│   ├── summary/
│   └── insights/
│
├── domain/
│   ├── activity/
│   ├── category/
│   ├── week/
│   └── insight/
│
├── application/
│   ├── activities/
│   ├── week/
│   ├── insights/
│   └── analytics/
│
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   ├── import/
│   └── export/
│
├── store/
│
├── styles/
│   ├── tokens.css
│   ├── globals.css
│   └── typography.css
│
└── icons/
    ├── IconPlus.tsx
    ├── IconCalendar.tsx
    └── ...
```

---

# 41. Regra de ouro da implementação

Nunca faça isto:

```tsx
<div style={{ background: "#21C7C4" }}>
```

Fazer:

```tsx
<div className="activity-selected">
```

E no sistema:

```css
.activity-selected {
  background: var(--color-brand-cyan-soft);
  border-color: var(--color-brand-cyan);
}
```

O design deve ser alterável sem precisar procurar hexadecimal espalhado pelo projeto.

---

# 42. Critério visual de pronto

Uma funcionalidade só deve ser considerada visualmente pronta quando:

- usa os tokens oficiais;
- segue a escala tipográfica;
- usa o sistema de ícones;
- respeita espaçamento;
- possui estados de interação;
- possui estado de foco;
- funciona em tema escuro;
- não introduz cores fora do sistema sem justificativa;
- não cria um padrão visual paralelo.

---

# 43. Regra para futuras expansões

Qualquer novo recurso deve responder:

### Isso pertence à semana?

Se sim:
→ integrar à agenda.

### Isso explica a semana?

Se sim:
→ integrar ao resumo/insights.

### Isso configura o sistema?

Se sim:
→ integrar às configurações.

### Isso não pertence a nenhuma dessas três áreas?

→ pode ser um **módulo próprio**.

---

## 43.1 Módulos (revisão)

As três perguntas acima nasceram quando o produto era só a agenda, e davam a
entender que tudo o que não coubesse nela deveria ser reavaliado. O produto
cresceu em outro eixo, e a regra precisa acompanhar.

Existem dois eixos:

```text
HORIZONTAL — o tempo passando
  A agenda. Uma semana por vez.
  Responde: o que acontece na terça?

VERTICAL — uma atividade em profundidade
  Treinos, Projetos. Atravessam semanas.
  Responde: estou evoluindo? quanto investi nisso?
```

Um recurso vira módulo próprio quando tem **história própria ao longo do tempo**
e é consultado fora do contexto de uma semana específica. Progressão de carga e
tempo investido em pesquisa são assim: ninguém pergunta "quanto eu progredi na
semana de 14 de setembro", pergunta "estou progredindo".

### Regras de um módulo

1. Pasta própria em `components/`, domínio próprio em `domain/`, store próprio.
2. **Nenhum módulo lê o dado do outro.** A agenda não importa treinos; treinos
   não importa projetos. Se dois módulos precisarem do mesmo cálculo, ele desce
   para `domain/` como função pura, sem estado.
3. O que for compartilhado sobe para `components/ui` ou `components/layout` —
   e só quando o **segundo** módulo precisar. Abstrair no primeiro uso é chute.
4. Todos os módulos usam a mesma casca: `BrandRow` + linha de contexto com
   período e ação primária. Um módulo não inventa navegação nova.

### O que continua valendo

Criar módulo é caro: mais superfície, mais estado, mais coisa para manter
coerente. Antes de criar o quarto, verifique se ele não é uma visão dentro de
um dos três.

---

# 44. DNA visual resumido

```text
IDENTIDADE
Dark / Petrol / Cyan / Precise

TIPOGRAFIA
Space Grotesk + Inter

FORMA
Retangular / cantos discretos

ÍCONES
SVG outline / 24×24 / 1.5px

COR
Função > decoração

ANIMAÇÃO
Rápida / discreta

LAYOUT
Grade temporal

DADOS
Claros / mensuráveis

INTELIGÊNCIA
Integrada / silenciosa

ARQUITETURA
UI → Application → Domain → Infrastructure → SQLite

PRIORIDADE
Clareza → Velocidade → Confiabilidade → Sofisticação
```

---

# 45. Frase-guia

> **Veja a sua semana como um sistema.**

A interface deve fazer o usuário sentir isso antes mesmo de ler a frase.
