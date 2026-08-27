# dsh-free-model

<p align="center">
  <img src="assets/logo.svg" alt="dsh-free-model logo" width="72" height="72" />
</p>

**dsh-free-model** is a [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) plugin that
browses OpenRouter's **free models** and adds any of them to your DSH model list in one click.

- **Platform tabs**: the Settings entry hosts one tab per provider platform (OpenRouter today; the
  `PLATFORMS` registry makes future providers a one-line addition). All fetch/filter/sort logic runs
  host-side; the tab is the single entry point.
- **Free-model directory**: fetches `https://openrouter.ai/api/v1/models` from the host, keeps only models
  priced 0 (prompt & completion) or flagged `:free`, and sorts them **newest first** (by OpenRouter `created`)
  so newly launched models surface on top. Results are cached in `$DSH_HOME/dsh-free-model.json`
  (6-hour freshness window; a failed refresh degrades to the cached list with a stale notice).
- **Full info per card**: name, id (click to copy), created date, context window, max output, modalities,
  tokenizer, pricing, supported parameters, moderated / forced-reasoning flags, expandable full description —
  plus a **local second-stage search** (id / name / description / vendor). Layout adapts to narrow panels
  and mobile widths (stacked cards, single-column grids, full-screen sheet dialog).
- **"Add to model list" → one-click model config**: the dialog takes an OpenRouter API token **only when the
  platform has no stored credential yet** (live-checked via `GET /api/v1/key` on demand). Confirming then
  1. stores the token through the host **credentials** service (`.credentials.yaml`, `OPENROUTER_API_KEY`),
  2. **merges the model into the OpenRouter route in `settings.yaml`** (`llm-pi-ai` namespace — reuses the
     existing `openrouter` / `openrouter-free` / openrouter.ai route when one exists, preserving its
     `apiKeyEnv` and model entries verbatim; otherwise creates `openrouter-free` with the
     `openai-completions` protocol and `https://openrouter.ai/api/v1`), and
  3. optionally sets it as the **default model for new sessions** (`agent-default-model` namespace).
  The model is selectable in the chat composer's model selector immediately — no host restart.
- **Robust fetching**: every OpenRouter request retries up to **10 times** (exponential backoff + jitter).
- Bilingual UI (中文 / English), no hardcoded paths.

[中文文档](README.zh.md)

## Commands

| Script | What it does |
| --- | --- |
| `npm run check` | `tsc -b` typecheck (host + client programs) |
| `npm run build` | clean `lib/`, `tsc -b`, then tsdown bundles `lib/index.js` (host, ESM) + `lib/client.js` (browser, `__ModuleLoader__` factory) |
| `npm run watch` | tsdown watch mode |
| `npm run verify` | simulate the host module loader against `lib/client.js` (factory shape + seed externals) |
| `npm run test:ops` | offline host-logic tests (free filter, sorting, route detection, config-write orchestration, store round-trip) |
| `npm run smoke` | live smoke test against the real OpenRouter `/models` endpoint |
| `npm run release` | `check` + `build` + `verify`, then `npm version patch` and `git push --follow-tags` |
| `npm run publish:npm` | `check` + `build` + `verify`, then `npm publish --access public` |

## Installation

```sh
# Local development (link the workspace; picks up rebuilds of lib/ automatically)
dsh plugin --profile web add ./dsh-free-model

# Published: npm / tarball / GitHub
dsh plugin --profile web add dsh-free-model
dsh plugin --profile web add github:you/dsh-free-model#<sha>

dsh --profile web --dump-config   # verify the layer
dsh --profile web                 # start (restart required for the host half to load)
```

> **Local development dependencies**: the host loads `lib/index.js` through native Node ESM, so
> `@deepseek-ai/schemastery` and `@deepseek-ai/dsh-settings` must be resolvable from the plugin
> directory. Either run `pnpm install` inside the plugin directory, or use the committed `lib/`
> build (this repository commits `lib/`, mirroring dsh-jenkins).

## Usage

1. Open **Settings → 免费模型 / Free Models**, pick the platform tab (OpenRouter).
2. The list arrives newest-first (served from cache when fresh; hit **刷新** to force a refetch).
3. Type in the search box to narrow the list locally.
4. Click **添加到模型列表 / Add to model list** on a model:
   - the token field appears **only** when the platform has no stored credential yet
     (otherwise the existing `OPENROUTER_API_KEY` is reused and noted in the dialog),
   - optionally tick **设为新会话的默认模型**,
   - confirm — the config is written and the dialog shows the exact route/model to pick
     in the composer's model selector.

## Adding a platform

1. `src/client/components/FreeModelsSection.tsx`: append `{ id, labelKey }` to `PLATFORMS` and mount the
   panel by id.
2. Copy `src/client/components/OpenRouterPanel.tsx` as a starting point; ops carry `platform: '<id>'`.
3. `src/host/ops.ts`: extend the `runOp` platform dispatch (fetch/filter per the platform's API, map its
   models onto `RouteModelProfile`, and teach `model-config.ts` the platform's credential ref and route
   naming).

## Structure

```
├── src/host/*.ts      # Host half: /dsh-free-model/api route (platform-dispatched ops),
│                      # OpenRouter fetch+filter+sort (10 retries), cache store,
│                      # model-config writer (settings + credentials services)
├── src/client/*.tsx   # Browser half: settings.section shell with platform tabs,
│                      # per-platform panel (search, cards), add-to-model-list dialog
├── lib/index.js       # Host half build artifact (tsdown, ESM), committed
├── lib/client.js      # Browser half build artifact (tsdown → __ModuleLoader__ factory), committed
├── scripts/           # verify-client.mjs, test-ops.mts (offline), smoke-openrouter.mts (live)
├── tsdown.config.ts   # node half + client bundle banner wrapper
├── cordis.patch.yml   # Bundle patch: plugin row referenced by package name
└── package.json       # dsh.bundle + dsh.client(web) manifests + peerDependencies
```

## Notes

- OpenRouter free models still require an account token (daily rate limits apply); the dialog says so.
- The write path is the sanctioned one: `settings.update('llm-pi-ai', …)` validates against the
  llm-pi-ai schema (a bad profile is refused where it is written) and the adapter re-registers routes
  live, so no host restart is needed after adding a model.
- Manual edits to an existing OpenRouter route (custom `apiKeyEnv`, extra profile fields) are preserved:
  adding a model only rewrites that route's `models` array (merged by id, same id → replaced).
- The plugin never touches settings/credentials files directly — everything goes through the host
  services; its own cache file (`dsh-free-model.json`) is the only file it writes.
