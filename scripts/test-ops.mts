/**
 * test:ops —— 宿主半边离线单测（不访问网络，node:assert）。
 *
 * 覆盖：免费判定 / 规范化 / 排序、路由识别优先级、模型条目映射、
 * applyModelConfig 的写入编排（新建路由 / 并入已有路由 / 凭据动作 / 默认模型）、
 * readRouteState、插件数据文件读写往返。
 */
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isFreeModel, sortModels, toFreeModel, type RawModel } from '../src/host/openrouter.ts'
import {
  applyModelConfig, findOpenRouterRoute, readRouteState, toRouteModelProfile,
  type CredentialsServiceView, type RouteModelProfile, type SettingsServiceView,
} from '../src/host/model-config.ts'
import { loadStore, resolveStoreDir, saveStore } from '../src/host/store.ts'
import type { FreeModel } from '../src/host/types.ts'

const tests: Array<[string, () => void | Promise<void>]> = []
const test = (name: string, fn: () => void | Promise<void>): void => { tests.push([name, fn]) }

/* ── 免费判定 / 规范化 / 排序 ─────────────────────────────── */

test('isFreeModel: pricing 0 strings', () => {
  assert.equal(isFreeModel({ id: 'a/b', pricing: { prompt: '0', completion: '0' } }), true)
})
test('isFreeModel: :free suffix wins over missing pricing', () => {
  assert.equal(isFreeModel({ id: 'a/b:free' }), true)
})
test('isFreeModel: nonzero or missing pricing is not free', () => {
  assert.equal(isFreeModel({ id: 'a/b', pricing: { prompt: '0.00000015', completion: '0' } }), false)
  assert.equal(isFreeModel({ id: 'a/b' }), false)
  assert.equal(isFreeModel({ id: 'a/b', pricing: { prompt: 0, completion: '0' } }), true)
})

test('toFreeModel normalizes fields', () => {
  const raw: RawModel = {
    id: 'x/y:free', name: 'X Y (free)', created: 1700000000, description: 'd',
    context_length: '65536',
    architecture: { input_modalities: ['text', 'image'], output_modalities: ['text'], tokenizer: 'Qwen', modality: 'text+image->text' },
    pricing: { prompt: '0', completion: '0', request: '0' },
    top_provider: { max_completion_tokens: '8192', is_moderated: true },
    supported_parameters: ['tools', 'temperature'],
    hugging_face_id: null,
  }
  const m = toFreeModel(raw)
  assert.equal(m.id, 'x/y:free')
  assert.equal(m.contextLength, 65536)
  assert.equal(m.maxCompletionTokens, 8192)
  assert.deepEqual(m.inputModalities, ['text', 'image'])
  assert.equal(m.pricing.prompt, 0)
  assert.equal(m.pricing.request, 0)
  assert.equal(m.moderated, true)
  assert.equal(m.freeSuffix, true)
  assert.equal(m.canonicalSlug, null)
  assert.equal(m.huggingFaceId, null)
})

test('sortModels: created desc, tie by id asc', () => {
  const model = (id: string, createdAt: number): FreeModel => ({
    id, canonicalSlug: null, name: id, createdAt, description: '', contextLength: null,
    maxCompletionTokens: null, inputModalities: [], outputModalities: [], modality: null,
    tokenizer: null,
    pricing: { prompt: 0, completion: 0, request: null, image: null, webSearch: null, internalReasoning: null, inputCacheRead: null, inputCacheWrite: null },
    supportedParameters: [], moderated: false, huggingFaceId: null, freeSuffix: false, reasoningMandatory: false,
  })
  const sorted = sortModels([model('b', 2), model('z', 3), model('a', 2), model('y', 1)])
  assert.deepEqual(sorted.map((m) => m.id), ['z', 'a', 'b', 'y'])
})

/* ── 路由识别 / 模型条目映射 ──────────────────────────────── */

test('findOpenRouterRoute priority: openrouter > openrouter-free > openrouter-* > baseURL', () => {
  const pick = (providers: Record<string, unknown>): string | undefined => findOpenRouterRoute(providers)?.name
  assert.equal(pick({ openrouter: {}, 'openrouter-free': {} }), 'openrouter')
  assert.equal(pick({ 'openrouter-free': {}, 'openrouter-x': {} }), 'openrouter-free')
  assert.equal(pick({ 'openrouter-x': {}, other: { baseURL: 'https://openrouter.ai/api/v1' } }), 'openrouter-x')
  assert.equal(pick({ other: { baseURL: 'https://openrouter.ai/api/v1' } }), 'other')
  assert.equal(findOpenRouterRoute({ deepseek: {} }), undefined)
  assert.equal(findOpenRouterRoute(undefined), undefined)
})

test('toRouteModelProfile maps modalities and omits nulls', () => {
  const entry = toRouteModelProfile({ id: 'm', name: 'M', contextLength: 65536.4, maxCompletionTokens: 0, inputModalities: ['text', 'image'] })
  assert.deepEqual(entry, { id: 'm', name: 'M', contextWindow: 65536, input: ['text', 'image'] })
  const plain = toRouteModelProfile({ id: 'm', name: '', contextLength: null, maxCompletionTokens: null, inputModalities: ['text'] })
  assert.deepEqual(plain, { id: 'm', name: 'm', input: ['text'] })
})

/* ── applyModelConfig 编排（stub 宿主服务）────────────────── */

interface Recording {
  writes: Array<{ ns: string; patch: object }>
  replaces: Array<{ ns: string; section: object }>
  sets: Array<{ ref: string; value: string }>
  user: unknown
  credentialConfigured: boolean
}

/** settings/credentials 的内存 stub：记录写入，get/describe 返回同一份 user 层。 */
function makeServices(options: { user?: unknown; credentialConfigured?: boolean } = {}): {
  settings: SettingsServiceView
  credentials: CredentialsServiceView
  recording: Recording
} {
  const recording: Recording = { writes: [], replaces: [], sets: [], user: options.user, credentialConfigured: options.credentialConfigured === true }
  const settings: SettingsServiceView = {
    async update(ns, patch) { recording.writes.push({ ns: String(ns), patch }) },
    async replace(ns, section) { recording.replaces.push({ ns: String(ns), section }) },
    get(ns) { return String(ns) === 'llm-pi-ai' ? structuredClone(recording.user) : undefined },
    describe() { return [{ ns: 'llm-pi-ai', user: structuredClone(recording.user) }] },
  }
  const credentials: CredentialsServiceView = {
    async set(ref, value) { recording.sets.push({ ref: String(ref), value }) },
    async describe(ref) { return { configured: recording.credentialConfigured, writable: true, source: String(ref) } },
  }
  return { settings, credentials, recording }
}

const freeModel = {
  id: 'vendor/model:free', name: 'Vendor Model (free)', contextLength: 131072,
  maxCompletionTokens: 32768, inputModalities: ['text'],
}

test('applyModelConfig: creates openrouter-free route + credential + default model', async () => {
  const { settings, credentials, recording } = makeServices({ user: { providers: {} } })
  const result = await applyModelConfig({ settings, credentials }, freeModel, { token: 'sk-or-v1-x', setDefault: true })
  assert.deepEqual(result, { routeName: 'openrouter-free', routeExisted: false, modelCount: 1, credentialAction: 'set', defaultModelSet: true })
  assert.equal(recording.writes.length, 1)
  assert.equal(recording.writes[0].ns, 'llm-pi-ai')
  const route = (recording.writes[0].patch as { providers: Record<string, Record<string, unknown>> }).providers['openrouter-free']
  assert.equal(route.api, 'openai-completions')
  assert.equal(route.baseURL, 'https://openrouter.ai/api/v1')
  assert.equal(route.apiKeyEnv, 'OPENROUTER_API_KEY')
  assert.equal(route.displayName, 'OpenRouter Free')
  assert.deepEqual(route.models, [{ id: 'vendor/model:free', name: 'Vendor Model (free)', contextWindow: 131072, maxTokens: 32768, input: ['text'] }])
  assert.deepEqual(recording.sets, [{ ref: 'OPENROUTER_API_KEY', value: 'sk-or-v1-x' }])
  assert.deepEqual(recording.replaces, [{ ns: 'agent-default-model', section: { provider: 'openrouter-free', model: 'vendor/model:free' } }])
})

test('applyModelConfig: merges into existing user route verbatim, keeps apiKeyEnv, keeps credential when no token', async () => {
  const existing = {
    providers: {
      openrouter: {
        models: [{ id: 'z-ai/glm', name: 'GLM', contextWindow: 1000000 }],
        apiKeyEnv: 'MY_CUSTOM_REF',
      },
    },
  }
  const { settings, credentials, recording } = makeServices({ user: existing, credentialConfigured: true })
  const result = await applyModelConfig({ settings, credentials }, freeModel, {})
  assert.deepEqual(result, { routeName: 'openrouter', routeExisted: true, modelCount: 2, credentialAction: 'kept', defaultModelSet: false })
  assert.equal(recording.sets.length, 0)
  const route = (recording.writes[0].patch as { providers: Record<string, Record<string, unknown>> }).providers['openrouter']
  // 已有路由只重写 models；apiKeyEnv 等其余字段不触碰。
  assert.deepEqual(Object.keys(route), ['models'])
  assert.deepEqual(route.models, [
    { id: 'z-ai/glm', name: 'GLM', contextWindow: 1000000 },
    { id: 'vendor/model:free', name: 'Vendor Model (free)', contextWindow: 131072, maxTokens: 32768, input: ['text'] },
  ])
})

test('applyModelConfig: token with existing custom ref writes that ref; same id replaces its entry', async () => {
  const existing = {
    providers: {
      openrouter: {
        models: [
          { id: 'vendor/model:free', name: 'Old Name' },
          { id: 'other/model', name: 'Other' },
        ],
        apiKeyEnv: 'MY_CUSTOM_REF',
      },
    },
  }
  const { settings, credentials, recording } = makeServices({ user: existing })
  const result = await applyModelConfig({ settings, credentials }, { ...freeModel, name: 'New Name' }, { token: 'sk-or-v1-new' })
  assert.deepEqual(result, { routeName: 'openrouter', routeExisted: true, modelCount: 2, credentialAction: 'set', defaultModelSet: false })
  assert.deepEqual(recording.sets, [{ ref: 'MY_CUSTOM_REF', value: 'sk-or-v1-new' }])
  const models = (recording.writes[0].patch as { providers: Record<string, { models: RouteModelProfile[] }> }).providers['openrouter'].models
  assert.deepEqual(models.map((m) => m.id), ['other/model', 'vendor/model:free'])
  assert.equal(models[1].name, 'New Name')
})

test('applyModelConfig: existing route without apiKeyEnv gains the conventional ref', async () => {
  const existing = { providers: { openrouter: { models: [{ id: 'a' }] } } }
  const { settings, credentials, recording } = makeServices({ user: existing, credentialConfigured: true })
  const result = await applyModelConfig({ settings, credentials }, freeModel, {})
  assert.equal(result.credentialAction, 'kept')
  const route = (recording.writes[0].patch as { providers: Record<string, Record<string, unknown>> }).providers['openrouter']
  assert.deepEqual(Object.keys(route).sort(), ['apiKeyEnv', 'models'])
  assert.equal(route.apiKeyEnv, 'OPENROUTER_API_KEY')
})

test('readRouteState: joins route + credential', async () => {
  const { settings, credentials } = makeServices({ user: { providers: { openrouter: { models: [{ id: 'a' }] } } }, credentialConfigured: true })
  const state = await readRouteState(settings, credentials)
  assert.equal(state.route?.name, 'openrouter')
  assert.equal(state.credentialConfigured, true)
  const none = await readRouteState(undefined, undefined)
  assert.equal(none.route, undefined)
  assert.equal(none.credentialConfigured, false)
})

/* ── 数据文件往返 ─────────────────────────────────────────── */

test('store: save/load round-trip + corrupt file → null', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-free-model-test-'))
  try {
    assert.equal(resolveStoreDir(join(dir, 'settings.yaml')), dir)
    const store = { version: 1, models: [toFreeModel({ id: 'a/b:free', created: 1 })], fetchedAt: 42 }
    await saveStore(dir, store)
    const loaded = await loadStore(dir)
    assert.deepEqual(loaded, store)
    const { writeFile } = await import('node:fs/promises')
    await writeFile(join(dir, 'dsh-free-model.json'), '{broken', 'utf8')
    assert.equal(await loadStore(dir), null)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

/* ── 运行 ─────────────────────────────────────────────────── */

let failed = 0
for (const [name, fn] of tests) {
  try {
    await fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    failed += 1
    console.error(`FAIL - ${name}`)
    console.error(error)
  }
}
if (failed > 0) {
  console.error(`test:ops FAIL: ${failed}/${tests.length} failed`)
  process.exit(1)
}
console.log(`test:ops OK: ${tests.length} tests`)
