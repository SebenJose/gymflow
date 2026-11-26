# gymflow

Sistema de gestão para redes de academias: planos de assinatura, matrículas, fichas de treino, aulas coletivas com controle de vagas e histórico de frequência. Atende **alunos**, **instrutores** e **administradores**.

Escopo completo em [`docs/escopo.txt`](docs/escopo.txt).

## Stack

| Camada   | Tecnologias                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| `front/` | Next.js (App Router) + React, Tailwind CSS, React Hook Form + Zod, Motion, Zustand, Lucide React, fonte Geist |
| `api/`   | NestJS, TypeORM, class-validator, JWT, bcrypt                                                                 |
| Banco    | PostgreSQL em container (Docker Compose)                                                                      |

Monorepo com **pnpm workspaces**.

## Estrutura

```
gymflow/
├── front/                 # Next.js — organização feature-based
│   └── src/
│       ├── app/           # rotas: (auth) e (app)
│       ├── features/      # auth, plans, workouts, classes, attendance, admin
│       │   └── <feature>/{components,hooks,schemas,services}
│       ├── components/    # ui/ e layout/ compartilhados
│       ├── lib/           # cliente HTTP, utilitários
│       └── stores/        # stores Zustand
├── api/                   # NestJS — controller / service / repository
│   └── src/
│       ├── modules/       # auth, users, plans, subscriptions, workouts, classes, attendance
│       ├── common/        # filters, interceptors, middleware, guards, decorators
│       └── database/seeds
├── docs/
└── docker-compose.yml
```

## Rodando localmente

Pré-requisitos: Node 24+, pnpm, Docker.

```bash
cp .env.example .env
pnpm install
pnpm db:up          # sobe o Postgres
pnpm dev            # front em :3000 e api em :3333/api
```

Stack inteira em containers:

```bash
docker compose --profile full up --build
```

## Padrões e fluxo de trabalho

> Regras obrigatórias de código e de processo (para pessoas e agentes de IA): [`AGENTS.md`](AGENTS.md).

- **Formatação:** Prettier único na raiz (`.prettierrc.json`) para front e api. Use `pnpm format` para formatar e `pnpm format:check` para conferir.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`…).
- **Branches:** a `main` é protegida. Todo trabalho entra por Pull Request, e o merge só é liberado com o CI verde.
- **CI** (`.github/workflows/ci.yml`), em toda PR para a `main`:
  - formatação, lint e checagem de tipos;
  - testes unitários e e2e da API contra um Postgres de serviço;
  - build do front e da api;
  - build das imagens Docker.
