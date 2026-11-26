# AGENTS.md — regras do repositório gymflow

Leitura **obrigatória** para qualquer agente (ou pessoa) antes de alterar este repositório. As regras abaixo não são sugestões: o que puder ser verificado por ferramenta já está no lint, no `tsconfig` ou no CI, e uma PR que as viole não entra na `main`.

Ordem de leitura: este arquivo → `front/AGENTS.md` ou `api/AGENTS.md`, conforme a pasta em que você vai trabalhar. Em caso de conflito, **este arquivo prevalece** nas regras de qualidade; os arquivos das apps prevalecem só nos detalhes de framework (versões, APIs novas).

Contexto do produto: [`docs/escopo.txt`](docs/escopo.txt). Visão geral e comandos: [`README.md`](README.md).

---

## 1. Fluxo de trabalho (Git)

1. **Nunca** commite nem faça push na `main`. Ela é protegida por ruleset; todo trabalho entra por Pull Request.
2. Uma branch por assunto: `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `chore/…`, `test/…`.
3. Mensagens em **Conventional Commits, em português**: `tipo(escopo): descrição no imperativo` — ex.: `feat(api): criar módulo de planos`. Escopos: `front`, `api`, `ci`, `docker`, `docs`.
4. **Não** adicione co-autoria nem assinatura de ferramenta/IA em commits ou PRs.
5. PRs pequenas e focadas. Refatoração e funcionalidade nova vão em PRs separadas.
6. **Proibido** para fazer o CI passar: desligar regra de lint, afrouxar `tsconfig`, pular/remover teste, editar o workflow ou o ruleset. Se uma regra parece errada, pare e pergunte.

### Definição de pronto

Antes de declarar uma tarefa concluída, rode na raiz e garanta que **tudo passa**:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Mudou API ou fluxo de dados? Rode também `pnpm --filter @gymflow/api test:e2e` (com `pnpm db:up`). Não diga que algo funciona sem ter executado.

---

## 2. Tipagem — sem atalhos

O TypeScript está em modo estrito nas duas apps e assim deve permanecer.

- **Proibido `any`** — explícito ou implícito. Dado de origem desconhecida é `unknown` e é estreitado (type guard, `zod.parse`, `instanceof`).
- **Proibido** `@ts-ignore`, `@ts-nocheck` e `@ts-expect-error`.
- **Proibido** asserção de tipo para "calar" o compilador: `as Foo`, `as unknown as Foo`, `<Foo>valor`. Exceções: `as const`, e asserções inevitáveis em testes ou na borda com bibliotecas — sempre com comentário explicando por quê.
- **Proibido** non-null assertion (`valor!`). Trate o `null`/`undefined`.
- **Proibido** `// eslint-disable` / `// oxlint-disable` sem justificativa na mesma linha e sem aprovação na PR.
- Funções e métodos exportados (services, hooks, utils, handlers) têm **tipo de retorno explícito**.
- Uma fonte da verdade por tipo:
  - front: tipos de formulário e de resposta saem do schema Zod (`z.infer<typeof schema>`);
  - api: entradas são DTOs com `class-validator`; nunca use a entidade como tipo de entrada/saída HTTP.
- Prefira `type` para props e uniões; `interface` só quando precisar de extensão/declaration merging.
- Use uniões literais (`'aluno' | 'instrutor' | 'admin'`) ou `enum` do TypeORM onde houver estados finitos — nada de `string` solto.

---

## 3. Princípios de design

Aplique com bom senso; o objetivo é código simples de ler e de mudar.

- **KISS** — a solução mais simples que resolve o requisito atual. Sem abstração "para o futuro".
- **YAGNI** — não implemente o que o escopo não pede.
- **DRY** — conhecimento duplicado vira uma única fonte (schema, constante, helper). Regra de três: duplicou pela terceira vez, extraia. Não junte códigos que só _parecem_ iguais mas mudam por motivos diferentes.
- **SoC (separação de responsabilidades)** — UI não sabe de HTTP; controller não sabe de regra de negócio; service não sabe de SQL.
- **SOLID**
  - **S**: cada módulo/classe/componente/função tem um único motivo para mudar.
  - **O**: estenda por composição (novos componentes, novos providers), não editando um `switch` gigante.
  - **L**: implementações substituíveis respeitam o contrato da abstração.
  - **I**: interfaces e props pequenas e específicas; nada de "props de tudo".
  - **D**: dependa de abstrações injetadas (DI do Nest; services/hooks no front), não de instâncias criadas dentro da lógica.
- Nomes descritivos em inglês no código (variáveis, funções, arquivos); textos de UI e mensagens de erro ao usuário em português.
- Sem código morto, `console.log` esquecido ou comentário que repete o código. Comente o **porquê**, não o quê.
- Números/strings mágicos viram constantes nomeadas.

---

## 4. Front-end (`front/`)

### Organização feature-based

```
src/
├── app/                     # só rotas, layouts e composição — sem lógica
├── features/<feature>/
│   ├── components/          # componentes da feature
│   ├── hooks/               # estado e efeitos (useX)
│   ├── schemas/             # schemas Zod + tipos inferidos
│   ├── services/            # chamadas à API (funções puras e tipadas)
│   └── index.ts             # API pública da feature
├── components/ui/           # componentes visuais genéricos (botão, input, card…)
├── components/layout/       # shell, sidebar, header
├── lib/                     # cliente HTTP, helpers genéricos
└── stores/                  # stores Zustand globais
```

- Uma feature **só importa outra pelo `index.ts`** dela. Nunca `@/features/x/components/...` de fora da feature `x`.
- `components/ui` não importa nada de `features/`.

### Componentes "burros" e pequenos

- Componentes de UI são **apresentacionais**: recebem dados e callbacks por props e renderizam. Não fazem fetch, não acessam store, não conhecem a API.
- Estado, efeitos, chamadas a services e acesso a store ficam em **hooks** (`features/*/hooks`). A página/container conecta hook + componentes.
- **Limite**: componente com mais de ~80 linhas de JSX/lógica, mais de ~5 props, ou mais de uma responsabilidade **deve ser dividido**. O lint barra arquivos acima de 150 linhas e funções acima de 80.
- Um componente exportado por arquivo, nome do arquivo em `kebab-case.tsx`, componente em `PascalCase`.
- Props tipadas com `type NomeProps = { … }`; sem `React.FC`.
- Server Components por padrão; `'use client'` só onde houver interatividade, no menor componente possível.

### Bibliotecas — uma por responsabilidade

| Precisa de…              | Use                                             | Não use                                  |
| ------------------------ | ----------------------------------------------- | ---------------------------------------- |
| Estilo                   | Tailwind (classes)                              | `style={{}}`, CSS-in-JS, CSS module novo |
| Formulário               | React Hook Form + `zodResolver`                 | estado manual por campo                  |
| Validação                | Zod (schema em `schemas/`)                      | validação ad-hoc em `if`                 |
| Ícones                   | `lucide-react`                                  | SVG solto, outra lib de ícones           |
| Animação                 | `motion`                                        | CSS keyframes complexos, outra lib       |
| Estado global de cliente | Zustand (`stores/`), só se for realmente global | Context para estado que muda muito       |
| Fonte                    | Geist                                           | —                                        |

- Toda chamada HTTP passa pelo cliente em `lib/` (URL base de `NEXT_PUBLIC_API_URL`, token, tratamento de erro padronizado). Nada de `fetch` espalhado nem dados fixos no lugar da API.
- Acessibilidade mínima: elementos semânticos, `label` em inputs, `alt` em imagens, foco visível.

---

## 5. Back-end (`api/`)

### Camadas — responsabilidade de cada uma

| Camada         | Faz                                                                      | Não faz                                   |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| **Controller** | rota, método HTTP, params/query/body (DTO), status code, guards          | regra de negócio, acesso a banco          |
| **Service**    | **todas** as regras de negócio, orquestração, lançar exceções de domínio | conhecer `Request`/`Response`, montar SQL |
| **Repository** | acesso a dados via TypeORM                                               | regra de negócio                          |

### Estrutura de um módulo

```
src/modules/<modulo>/
├── dto/                     # create-x.dto.ts, update-x.dto.ts, query-x.dto.ts
├── entities/                # x.entity.ts
├── <modulo>.controller.ts
├── <modulo>.service.ts
├── <modulo>.repository.ts
├── <modulo>.module.ts
└── <modulo>.service.spec.ts
```

### Regras

- Toda entrada (body, query, params) é validada por **DTO com `class-validator`**; o `ValidationPipe` global usa `whitelist` + `forbidNonWhitelisted`.
- Respostas e erros seguem o **formato padronizado** (interceptor e filtro globais em `common/`). Controller não monta envelope manualmente.
- Erros são exceções HTTP do Nest (`NotFoundException`, `ConflictException`…), lançadas no service. Nunca retorne `null` para indicar erro nem `res.status()` manual.
- Status codes corretos: `201` criação, `204` remoção sem corpo, `400` validação, `401` sem token/token inválido, `403` papel sem permissão, `404` não encontrado, `409` conflito.
- Rotas privadas usam o guard de JWT; restrição por papel usa o guard de roles com decorator (`@Roles(...)`).
- Senha **só** em hash bcrypt e **nunca** retornada em resposta (`select: false` na coluna + DTO/serialização de saída).
- Configuração via `ConfigService`, nunca `process.env` espalhado (exceção: `main.ts`).
- Regras de concorrência (ex.: vagas em aula) são garantidas no banco/transação, não só em `if` no código.
- Projeto ESM: imports relativos terminam em `.js`.
- `strictPropertyInitialization` está desligado **só** por causa das entidades TypeORM; nas demais classes inicialize as propriedades.

---

## 6. Testes

- Toda regra de negócio de service tem teste unitário (Vitest, `*.spec.ts` ao lado do arquivo). Dependências são mockadas por injeção (`vi.fn()`), não por monkey-patch.
- Rota nova ou alterada ganha/atualiza teste e2e em `api/test/`, cobrindo o caminho feliz e os erros relevantes (400/401/403/404).
- Correção de bug vem com um teste que falharia sem a correção.
- Teste não acessa rede externa; o e2e usa o Postgres do `docker compose` / serviço do CI.

---

## 7. Segurança e dependências

- Nunca commite `.env`, segredos ou tokens. Novas variáveis de ambiente entram em `.env.example` e no workflow, com valor fictício.
- Não adicione dependência nova sem necessidade clara; prefira o que já está na stack. Justifique na descrição da PR.
- Não adicione telemetria, analytics ou SDK de serviço externo sem pedido explícito.
