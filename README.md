# ORBIT — Agenda Semanal

Planner semanal local, focado em **ver a semana como um sistema**. Três módulos independentes: **Agenda** (o tempo passando), **Treinos** (progressão de cargas e peso corporal) e **Projetos** (cada atividade em profundidade, com prazos e tempo investido). Roda no navegador (Vite) e como aplicativo desktop (Electron).

## Features atuais

### Agenda

- Grade semanal de **segunda a domingo**, com trilho de horários das 08:00 às 24:00 e resolução de 10 minutos.
- Navegação entre semanas (**anterior / próxima / Hoje**) com estado visual de semana corrente, passada ou futura.
- Linha de **"agora"** indicando o instante atual dentro da grade.
- **Drag & drop** para reagendar blocos, com snap (30 min padrão, 10 min para reuniões) e detecção de sobreposição.
- Modo densidade configurável: compacto, normal ou amplo.

### Atividades

- Criar, editar e excluir atividades com título, categoria, dia(s), início/fim, descrição e flag **flexível**.
- Criação em **múltiplos dias de uma vez** (repetição rápida dentro da semana).
- Concluir/desmarcar atividades, com barra de progresso semanal e contagem de blocos.
- Ações de editar/excluir rápidas direto no card e desfazer exclusões por aviso.

### Categorias

- Categorias com identidade de cor (paleta de tokens do brandkit).
- Criar, renomear, recolorir e excluir categorias.
- Proteção contra exclusão de categorias em uso.
- Filtro visual por categoria na grade (reduz contraste, sem apagar dados).

### Contexto e eventos temporais

- Eventos com data (**evento, prazo, marco, lembrete**) que aparecem na semana correspondente.
- **Contexto fixo**: itens sem data que permanecem visíveis em todas as semanas.
- Prioridade (baixa, média, alta) e horário opcional.

### Resumo e leitura da semana

- **Resumo quantitativo**: total de horas, distribuição por categoria, carga por dia e categoria predominante.
- **Motor de insights** por regras, sem fabricar conteúdo:
  - sobreposições de horário;
  - prazos próximos;
  - dia com carga atípica;
  - padrões de sequência entre categorias;
  - maiores janelas livres;
  - eventos logo após a semana;
  - semana vazia;
  - o que ainda resta hoje.

### Dados

- Persistência 100% local via `localStorage`, com schema versionado (`v4`) e migração de dados legados (`v2`/`v3`).
- **Exportar / importar** backup em JSON.
- **Repetir outra semana** na semana atual, copiando a estrutura de atividades.

### Treinos

- Plano semanal: escolha os dias de treino e adicione os exercícios com a carga de 100%.
- Séries derivadas automaticamente: aquecimento + 60% + 80% + 100%.
- Registro pós-treino do peso pego em cada exercício (reps opcionais e marcação de falha).
- **Mapa corporal** frente/costas que acende cada grupo conforme o volume do dia ou da semana.
- **Octógono de desempenho** por grupo muscular.
- **Progressão** de carga e 1RM estimado por exercício ao longo das semanas.
- **Linha do tempo semanal** com carga consolidada.
- **Pesagem diária em jejum** com curva de peso e média móvel.

### Projetos

- Índice de projetos com estado, tempo investido e o prazo mais próximo.
- **Workspace por projeto**: cada atividade tem o próprio espaço, isolado da semana.
- **Marcos** com data — entregas, submissões, bancas — e aviso de atraso.
- **Registro de trabalho**: data, tempo e o que avançou.
- **Curva de investimento**: barras de ritmo semanal sobre a linha do acumulado.

### Experiência e aparência

- Três módulos — Agenda, Treinos e Projetos — trocados por um controle segmentado no cabeçalho.
- Tema **escuro/claro**, acento configurável e densidade da grade.
- Sistema de ícones SVG inline (outline, 24×24, `stroke 1.5`).
- Avisos discretos com **desfazer** e confirmações customizadas (no lugar de `alert`/`confirm`).
- Splash screen com ativador por arrasto.
- Atalhos de teclado com tela de ajuda.

## Stack

- **React 18** + **Vite 6**
- **CSS customizado com design tokens** centralizados em `src/styles/` — o Tailwind está instalado no setup do Vite, mas os estilos atuais são CSS puro (sem classes utilitárias do Tailwind)
- **Electron** + **electron-builder** (instalador NSIS para Windows, com atualização automática via GitHub Releases)
- JavaScript (JSX), sem TypeScript neste momento

## Scripts

```bash
npm install          # instala as dependências
npm run dev          # roda no navegador (Vite)
npm run build        # gera o build web em dist/
npm run preview      # serve o build de produção localmente
npm run electron:dev # roda como app Electron em desenvolvimento
npm run electron:build # empacota o executável em %LOCALAPPDATA%/orbit-release (fora do OneDrive)
npm run icon         # regenera os ícones do app
```

## Estrutura do projeto

```text
.
├── electron/            # camada desktop (janela, updater)
├── legacy/              # versão anterior em JS puro (referência)
├── scripts/             # utilitários (geração de ícones)
├── build/               # ícones do aplicativo
└── src/
    ├── App.jsx          # composição das telas e ações
    ├── main.jsx         # entrypoint React
    ├── index.css        # entrada dos estilos
    ├── components/
    │   ├── agenda/      # módulo Agenda: grade, cards, resumo e diálogos da semana
    │   ├── treino/      # módulo Treinos: plano, sessão, mapa corporal e progressão
    │   ├── projeto/     # módulo Projetos: índice, workspace, marcos e curva
    │   ├── layout/      # casca comum a todos os módulos
    │   ├── modals/      # diálogos de aplicação (preferências, atalhos)
    │   ├── splash/      # tela de entrada
    │   └── ui/          # primitivas: ícones, modal, gráfico, segmentado, avisos
    ├── domain/          # regras puras (tempo, semana, insights, treinos, projetos)
    ├── store/           # estado, ações e persistência — um store por módulo
    ├── hooks/           # relógio, atalhos e assinatura dos stores
    └── styles/          # tokens e estilos por área
```

A separação segue a direção `UI → store/ações → domain → persistência`: componentes apenas renderizam dados normalizados, as regras de negócio vivem em `domain/` e o armazenamento fica isolado em `store/`.

Cada módulo é uma pasta em `components/`, com o próprio domínio e o próprio store. Os três não se conhecem: a agenda não lê treinos nem projetos, e vice-versa. O que eles compartilham vive em `ui/` e `layout/` — e só chega lá quando um segundo módulo passa a precisar.
