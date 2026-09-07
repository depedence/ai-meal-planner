# AGENTS.md

Guidance for Codex when working in this repository.

## What this project is

**AI Meal Planner** — a Spring Boot REST backend that generates a budget-constrained
meal plan for a Russian household using an LLM (Groq API, OpenAI-compatible endpoint).

The user gives four inputs (budget in rubles, number of days, number of people, how
varied the dishes should be). The backend builds a prompt, calls Groq, parses the
model's JSON answer into typed DTOs, and returns a flat list of meals with per-dish
and per-ingredient price estimates plus a grand total.

There is no database, no auth, and no persistence — every request is a stateless
round trip to the LLM.

A React/Vite frontend lives in `frontend/` (dev server on `http://localhost:5173`).
It is a two-screen SPA over the single backend endpoint. Both halves are documented
here: backend first, then **Frontend** below.

## Working scope — read this first

When the user says the work is **frontend only** ("работа только по фронту", "только
фронт", or similar), do not touch anything outside `frontend/`: no Java sources, no
`pom.xml`, no `application.yaml`, no `.env`, no backend docs. The same rule mirrored:
when the work is **backend only**, do not touch `frontend/` at all.

That includes "while I'm here" fixes. If a task genuinely cannot be finished without
crossing the line — e.g. a frontend change needs a new response field — stop, say so,
and let the user decide; do not cross it on your own judgment.

The one shared artefact is the API contract in **API** below: if it changes, both
sides change together, and that is by definition not single-scope work.

## `design.html` is the source of truth

`frontend/design.html` is the design specification the whole product is built around —
tokens, type scale, spacing, radii, shadows, every component with all its states,
layout rules per breakpoint, the logo, and a layout checklist. It renders standalone
in a browser.

**Open it before designing anything new and before editing anything that already
exists.** Do not invent a colour, a font size, a radius, a shadow, a spacing step or a
component state — look it up there first. If what you need genuinely is not in the
spec, derive it from the nearest thing that is, and say which token you extended.

Build around what is already there. This project has a settled visual language and a
settled component set; a new element should look like it was in the spec from the
start. Prefer reusing an existing component over adding a lookalike.

Sections of `design.html`:

| # | Section | What it fixes |
| --- | --- | --- |
| 01 | Цветовая палитра | every colour token with its hex and intended role |
| 02 | Типографика | Newsreader/Karla split, the named type roles (`display-xl`, `money-hero`, `heading-day`, `overline`, …) with mobile sizes |
| 03 | Отступы, радиусы, тени | 4px spacing scale, which radius belongs to which surface, the three shadows |
| 04 | Компоненты и состояния | button, slider, stepper, variety option, day card, total panel, input — each with hover / active / focus / disabled |
| 05 | Layout и адаптив | breakpoints, both screens' grids, alignment rules, a `tailwind.config` sketch |
| 06 | Логотип | `logo.svg` geometry, per-context sizes, clear space, wordmark rules |
| 07 | Чек-лист вёрстки | the acceptance checklist to run a change against |

Where the implementation deliberately differs from the spec, that is recorded under
**Frontend → Known deviations from the spec**. Read it before "fixing" a difference —
some of them are decisions, not drift.

---

# Backend

## Backend stack

- Java 17, Spring Boot **4.1.1** (`spring-boot-starter-web`, `-validation`)
- Maven (`./mvnw`)
- Lombok (`@Data`, `@RequiredArgsConstructor`, `@Slf4j`)
- Jackson **3** — note the package is `tools.jackson.databind.ObjectMapper`,
  **not** `com.fasterxml.jackson.databind`. Annotations
  (`@JsonProperty`, `@JsonIgnoreProperties`) still come from `com.fasterxml.jackson.annotation`.
- `me.paulschwarz:springboot4-dotenv` — loads `.env` into the Spring environment
- `RestClient` (not `RestTemplate`, not `WebClient`) for outbound HTTP

## Running the backend

```bash
./mvnw spring-boot:run     # starts on http://localhost:8080
./mvnw clean package
```

Requires a `.env` in the project root:

```
GROQ_API_KEY=<key>
```

`.env` is gitignored; `.env.example` is the committed template.

There are no tests yet (`src/test/` does not exist).

## Backend configuration (`src/main/resources/application.yaml`)

| Key | Value | Notes |
| --- | --- | --- |
| `server.port` | `8080` | |
| `groq.api-key` | `${GROQ_API_KEY}` | from `.env`, required |
| `groq.base-url` | `https://api.groq.com/openai/v1` | |
| `groq.model` | `openai/gpt-oss-120b` | |
| `groq.max-completion-tokens` | `4500` | min 1024 (bean-validated) |
| `proxy.enabled` | `true` | |
| `proxy.host` / `proxy.port` | `127.0.0.1` / `10809` | local HTTP proxy — Groq is not reachable directly from Russia |

Bound as validated records via `@ConfigurationPropertiesScan` on `Main`:
`GroqProperties`, `ProxyProperties`. When `proxy.enabled` is false the `RestClient`
is built without a proxy request factory.

**If Groq calls fail with a connection error, the local proxy on port 10809 is
probably not running** — that is a machine-level dependency, not a code bug.

## Backend package layout

```
ru.depedence.aimealplanner
├── Main                      @SpringBootApplication + @ConfigurationPropertiesScan
├── config
│   ├── CorsConfig            /api/v1/** ← http://localhost:5173
│   ├── GroqProperties        validated record, prefix "groq"
│   ├── ProxyProperties       validated record, prefix "proxy"
│   └── RestClientConfig      groqRestClient bean (base URL, auth header, optional proxy)
├── controller
│   └── MealPlanController    POST /api/v1/meal-plan
├── dto
│   ├── groq                  wire format for the Groq chat-completions API
│   ├── request               MealPlanRequest, VarietyLevel
│   └── response              MealPlanResponse, Meal, Ingredient, MealType
├── exception                 GlobalExceptionHandler + 2 runtime exceptions
└── service
    ├── PromptBuilder         request → English prompt string
    ├── GroqClient            prompt → raw model text
    └── MealPlanService       orchestration + JSON parsing
```

## Backend request flow

`MealPlanController` → `MealPlanService.generatePlan`:

1. `PromptBuilder.build(request)` — renders a text-block prompt with days, people,
   budget and a variety instruction.
2. `GroqClient.askForMealPlan(prompt)` — POSTs `/chat/completions` with
   `temperature=0.7`, `reasoning_effort="low"`, `max_completion_tokens` from config.
3. `MealPlanService.stripMarkdownFences` — strips a leading ` ```json ` / trailing
   ` ``` ` if the model wrapped the JSON despite being told not to.
4. `ObjectMapper.readValue(..., MealPlanResponse.class)`.

## API

### `POST /api/v1/meal-plan`

Request body (all fields `@NotNull`):

```json
{
  "budget": 5000,
  "days": 3,
  "peopleCount": 2,
  "varietyLevel": "MIXED"
}
```

| Field | Type | Constraint |
| --- | --- | --- |
| `budget` | int (₽) | 500 – 15000 |
| `days` | int | 1 – 7 |
| `peopleCount` | int | 1 – 5 |
| `varietyLevel` | enum | `SAME` \| `MIXED` \| `DIFFERENT` |

The upper bounds mirror the frontend form limits and are deliberately narrow: each
request costs Groq tokens, and a long plan overruns `max_completion_tokens`, comes
back truncated, and then fails to parse.

`varietyLevel` maps to prompt wording — `SAME` = identical meals every day,
`MIXED` = some repetition allowed, `DIFFERENT` = a fresh set of dishes each day.

Response `200`:

```json
{
  "totalEstimatedPrice": 1250,
  "meals": [
    {
      "dayNumber": 1,
      "type": "breakfast",
      "dishName": "Овсянка с бананом",
      "ingredients": [
        { "name": "овсяные хлопья", "amount": "50 г", "estimatedPrice": 20 }
      ],
      "estimatedPrice": 45
    }
  ]
}
```

`meals` is a **flat** array — days are expressed by the `dayNumber` field on each
meal, not by nesting. (An earlier `DayPlan` wrapper was removed; do not reintroduce
nesting without also updating the prompt and the frontend.)

`type` serializes lowercase (`breakfast` / `lunch` / `dinner`) via `@JsonProperty` on
the `MealType` enum constants. Prices are whole rubles (`Integer`). Dish and
ingredient names come back in Russian; everything else — field names, the prompt
itself, error messages — is English.

### Errors (`GlobalExceptionHandler`, plain-text bodies)

| Exception | Status | Meaning |
| --- | --- | --- |
| `MethodArgumentNotValidException` | `400` | request outside the validated ranges |
| `GroqApiException` | `502` | HTTP call to Groq failed, or it returned no choices |
| `InvalidPlanResponseException` | `502` | `finish_reason == "length"` (truncated), or the payload is not parseable JSON |

## Requirements the prompt encodes

- The plan must not exceed the given budget; prices are estimates in rubles at
  typical Russian grocery prices.
- 3 meals per day: breakfast, lunch, dinner.
- Simple home-cookable dishes from ingredients commonly sold in Russia,
  at most 6 ingredients per dish.
- All prices are whole integers.
- The model must answer with a single compact JSON object, no markdown, no prose.

These live in `PromptBuilder`. Changing the response shape means changing the
prompt's example JSON **and** the response DTOs together — they are only kept in
sync by hand.

## Backend conventions

- Prompt text, log messages and client-facing error strings: **English**.
  Code comments in the existing files are in Russian — match the file you are editing.
- Constructor injection through Lombok `@RequiredArgsConstructor`; no field injection.
- Config is bound to validated `record`s, not `@Value`.
- DTOs are Lombok `@Data` classes with `@NoArgsConstructor`/`@AllArgsConstructor`
  (Jackson needs the no-arg one); config properties are records.
- Formatting matches prettier-java output: 4-space indent, 80-column wrap,
  trailing commas in enum constants.

## Backend working notes

- **Do not call the real `POST /api/v1/meal-plan` just to check something** — it
  spends Groq tokens. Use a mock/stub when verifying frontend or serialization
  behaviour.
- `MealPlanService` logs the full raw and cleaned model response at INFO — useful
  when debugging parse failures.

---

# Frontend

Lives in `frontend/`. A two-screen React SPA over the single backend endpoint. No
router, no state library, no server rendering in production — one `App` component
switches between the form and the result, and the plan history lives in
`localStorage`.

## Frontend stack

- React **19** + TypeScript, Vite **8** (`@vitejs/plugin-react`)
- Tailwind CSS **4** via `@tailwindcss/vite` — **no `tailwind.config.js`**. Design
  tokens are declared with `@theme` inside `src/index.css`; the `tailwind.config`
  snippet in `design.html` §05 is a sketch from the spec, not the real config.
- ESLint 10 flat config (`js` + `typescript-eslint` + `react-hooks` + `react-refresh`)
- No test runner, no component library, no icon package, no HTTP client — plain
  `fetch`, hand-written SVG, hand-written components.

## Running the frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
npm run check          # typecheck + lint + render-check — run this before finishing
npm run build          # tsc -b && vite build → dist/
```

`npm run dev` proxies `/api` to `http://localhost:8080` (`vite.config.ts`) and strips
the `Origin`/`Referer` headers so Spring never treats the call as cross-origin — the
browser sees a same-origin request and CORS never comes into play in dev. The backend
still has `CorsConfig` for the case where the frontend is served from somewhere else.

## `npm run check` — the only test suite

There is no Vitest/Jest. Verification is three commands chained in `package.json`:

1. `tsc -b` over three project references — `tsconfig.app.json` (src),
   `tsconfig.node.json` (`vite.config.ts`), `tsconfig.check.json` (`ssr-check.tsx`).
   `strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`.
2. `eslint .`
3. `render-check` — builds `ssr-check.tsx` with `vite.ssr.config.ts` and runs it in
   Node. It renders `FormScreen` and `ResultScreen` through `renderToString` in ten
   states (idle / loading / error / history / over-budget / navigation) and asserts
   that expected substrings are present and forbidden ones absent, then runs unit
   assertions over `parseMealPlan`, `groupMealsByDay`, `formatMoney`, `clampRequest`
   and the history reader. ~31 cases; it exits non-zero if any fail.

**Add a case to `ssr-check.tsx` when you add rendered text or a new state.** That file
is the project's regression net — treat it the way you would a test file. It renders
the screens directly, not `App`, so anything mounted only by `App` (the footer) is
not covered by the screen cases.

Screens must stay renderable without a DOM: no `window` / `localStorage` /
`matchMedia` access during render, only inside effects and handlers.

## Frontend layout

```
frontend/
├── design.html            design spec — the source of truth (see above)
├── index.html             favicon → /logo.svg, Google Fonts, <title>
├── public/logo.svg        the logo, 64×64 (see Логотип below)
├── ssr-check.tsx          render + unit checks, run by `npm run check`
├── vite.config.ts         port 5173, /api proxy to :8080
└── src
    ├── main.tsx           createRoot + StrictMode + ErrorBoundary
    ├── index.css          @theme design tokens, base styles, keyframes, range/number CSS
    ├── App.tsx            the whole state machine + <Footer/> wrapper
    ├── api/mealPlan.ts    types, fetchMealPlan, parseMealPlan (defensive parsing)
    ├── lib
    │   ├── limits.ts      BUDGET/DAYS/PEOPLE bounds + clampRequest — mirrors backend @Min/@Max
    │   ├── format.ts      formatMoney (NBSP + ₽), plural (RU 1/2/5 declension)
    │   ├── meals.ts       MEAL_TITLES, groupMealsByDay (flat meals → days)
    │   └── history.ts     localStorage plan history, defensive reader
    └── components
        ├── FormScreen     screen 1: offer + saved plans + parameters panel
        ├── ResultScreen   screen 2: header + day cards + total panel + actions
        ├── ErrorBoundary  crash screen, offers reload / clear storage
        ├── Logo           знак + wordmark lockup
        ├── Footer         © depedence + the AI disclaimer, on every screen
        ├── BudgetSlider   range + click-to-type value
        ├── NumberStepper  − / number input / +
        ├── VarietyGroup   ARIA radiogroup with roving tabindex
        ├── HistoryCard    saved plan, collapsible summary
        ├── DayCard        collapsible day, holds MealBlocks
        ├── MealBlock      one meal: overline, dish, ingredient rows
        ├── TotalPanel     spent / budget bar, over-budget state
        ├── DaySkeleton    shimmer placeholders while loading
        ├── LoadingNote    progress bar + "Считаем план…"
        ├── Button         primary / ghost, loading state
        └── Chevron        the one inline SVG icon
```

## State model (`App.tsx`)

All state is in `App`; every component below it is controlled by props and holds no
data of its own beyond open/closed UI state.

- `params` — the form values. Kept even after a plan is generated, so "Параметры"
  returns to a filled form.
- `history` — `PlanEntry[]`, oldest first, capped at `HISTORY_LIMIT = 10`,
  persisted to `localStorage` under `aimealplanner.plans.v1` by an effect.
- `activeId` — `null` renders `FormScreen`, otherwise `ResultScreen` for that entry.
  **This is the entire routing mechanism.** There is no URL state; a reload always
  lands on the form.
- `loading` / `error` — shared by both screens.
- `requestId` (a counter) and `inFlight` (an `AbortController`) — a new submit aborts
  the previous request, and a late response from a stale request is dropped by
  comparing the counter. Unmount aborts too. Keep this if you touch `submit`: the
  request takes seconds and the user can re-submit or navigate meanwhile.

`submit` takes its params explicitly rather than reading `params` from state, because
"Пересобрать" re-runs the *entry's* parameters, not whatever is in the form.

Every successful plan appends a new entry — plans are never replaced, so the user can
compare variants with the ‹ › pager on the result screen.

## Trusting nothing that crosses a boundary

Two inputs are untrusted and both are parsed defensively. This is deliberate and
load-bearing:

- **The backend response**, because it originates from an LLM. `parseMealPlan`
  (`api/mealPlan.ts`) validates the shape and returns `null` if unusable. It is
  *tolerant*: one broken meal or ingredient is dropped, the rest of the plan survives.
  `toNumber` accepts numeric strings but rejects `null` / `''` — `Number(null) === 0`
  would print a missing price as a free dish. Unknown `type` values are kept and
  rendered as-is (`MEAL_TITLES[type] ?? type`).
- **`localStorage`**, because the user can edit it and old entries may predate the
  current format. `history.ts` re-parses every entry through `parseMealPlan` +
  `clampRequest` and drops what does not fit — the removed `DayPlan` wrapper format is
  explicitly covered by a check in `ssr-check.tsx`.

Error text shown to the user goes through `isUserFriendly`: a short plain-text body
from the backend is displayed as-is, anything that looks like JSON, HTML or a Java
stack trace is replaced by a generic message.

`formatMoney` rounds non-finite input to `0` as a last line of defence — "NaN ₽" on
screen is worse than a wrong zero.

## Validation bounds are mirrored, not derived

`src/lib/limits.ts` duplicates the backend's `@Min`/`@Max`: budget 500–15000 step 100,
days 1–7, people 1–5, variety `SAME|MIXED|DIFFERENT`. `clampRequest` normalises before
submit so a hand-typed value never produces a 400. **If the backend bounds change,
this file changes with them** — that is cross-scope work (see **Working scope**).

## Design tokens live in `src/index.css`

Tailwind 4 `@theme` block. Class names follow from the token names: `--color-ink-muted`
→ `text-ink-muted`, `--shadow-card` → `shadow-card`, `--radius-2xl` → `rounded-2xl`.

- surfaces `base` `surface` `muted`; text `ink` `ink-muted` `ink-soft` `ink-faint`;
  accent `accent` + `accent-soft` `accent-line` `accent-press` `accent-ink`;
  lines `line` `line-hover` `track` `leader`; status `success` / `success-soft`,
  `danger` / `danger-line`
- fonts `--font-display` (Newsreader) and `--font-sans` (Karla), loaded from Google
  Fonts in `index.html`
- radii 14 / 18 / 24, shadows `card` `hover` `sticky`, extra spacing `5.5` `6.5` `7.5`
- utilities defined with `@utility`: `tnum` (tabular numerals — **use it on every
  price**), `animate-screen-in`, `animate-meal-in`, `animate-progress`,
  `animate-dot`, `shimmer`
- a global `:focus-visible` ring (2px `accent`, offset 3px) and a
  `prefers-reduced-motion` block that kills every animation

**Do not write raw hex in JSX.** The only current exception is the error banner
background `bg-[#f7e0db]`, which has no token yet.

## Frontend conventions

- 2-space indent, single quotes, no semicolons — matches most files and
  `.editorconfig`. `FormScreen.tsx` is an outlier (4-space, double quotes,
  semicolons); match the file you are editing rather than reformatting it.
- Function components with a named `export function`; props typed by a local
  `interface FooProps`, or inline for one- or two-prop components. No default exports
  except `App`.
- Comments in Russian, in the "why" register, not the "what" — the existing ones
  explain a non-obvious decision (why the request counter, why not `Number()`, why a
  chevron and not a minus). Keep that bar; do not narrate the obvious.
- All user-facing text is Russian. `plural()` for anything counted.
- Composition over configuration: prefer a new small component over another boolean
  prop on an existing one.
- Accessibility is part of "done", and the spec's checklist (§07) is the bar:
  `aria-expanded` + `aria-controls` on every disclosure, `inert` on the collapsed
  panel, `role="radiogroup"` with roving tabindex for the variety options,
  `role="alert"` on errors, `role="status"` on the loading note, `aria-hidden` on
  decorative marks, hit areas ≥ 44px on mobile.
- Animations ≤ 220ms, and always disabled under `prefers-reduced-motion`.
- Collapsible panels animate with `grid-template-rows: 0fr → 1fr`, not `max-height` —
  it animates to the content's real height. `DayCard` and `HistoryCard` both do it
  this way; copy the pattern.

## Логотип

`public/logo.svg` — 64×64, terracotta plate `#C4623F` with `rx=16` (25%), mark
`#F3EDE4`; the rounding is baked into the file, so never add a CSS radius on top.
Sizes per §06: 24px mobile header, 28px desktop, 16px in the footer and as favicon.
`components/Logo.tsx` is the lockup (mark + «Кастрюля» set in Newsreader) — use it
rather than a bare `<img>`. Its `alt` is empty on purpose: the wordmark beside it
already carries the name.

## Footer / AI disclaimer

`components/Footer.tsx` carries `© depedence` and the notice that the plan is produced
by an LLM: informational only, may be inaccurate, not medical / dietary / financial
advice, prices are estimates and not an offer, check ingredients and allergies
yourself. It is mounted once in `App` (and in the `ErrorBoundary` fallback) so it
appears on every screen. **Do not remove it or make it conditional** — showing it is
the point. Screens therefore end with `flex-1` rather than `min-h-dvh`, and the
`env(safe-area-inset-bottom)` padding belongs to the footer, not to the screens.

## Known deviations from the spec

`design.html` describes a slightly wider product than what is built. These are
decisions, not drift — do not "restore" them without being asked:

- **Saved plans instead of the two metrics.** §05 puts two metrics in the form
  screen's left column; the implementation shows the `HistoryCard` list there.
- **No "Список покупок".** The spec's result-screen header mentions it; there is no
  shopping-list feature and no backend field for one.
- **Variety options are always a vertical list.** §05 asks for `grid-cols-3` on
  desktop; a single vertical list is used at every width because the labels are long
  sentences.
- **Result-screen actions live in the right column**, not in a mobile
  `sticky bottom-0` bar. The mobile total panel *is* sticky at the top as specified.
- **`logo.svg` was not delivered with the spec** — the current file was reconstructed
  from §06's written geometry. If the original asset turns up, replacing the file is
  enough; nothing else references the artwork.

## Frontend working notes

- **Never call the real `POST /api/v1/meal-plan` to check frontend behaviour** — it
  spends Groq tokens. Use `npm run check`, which renders every state from fixtures, or
  stub `fetch`.
- Verifying visually means `npm run dev`; kill the dev server when you are done.
- Money formatting uses a non-breaking space; `ssr-check.tsx` normalises it before
  matching, so assert on the plain-space form.
- `dist/` and `dist-ssr/` are build output and gitignored; do not edit or commit them.

