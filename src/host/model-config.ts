/**
 * dsh-free-model —— 经 DSH 服务创建/更新模型配置（本插件的核心写路径）。
 *
 * 写的两半都走宿主服务，不直接碰文件：
 * - 凭据：`ctx.credentials.set(ref, token)` → 落 $DSH_HOME/.credentials.yaml（只写存储）；
 * - 路由：`ctx.settings.update('llm-pi-ai', patch)` → 合并进 settings.yaml 用户层，
 *   经 llm-pi-ai 自己的 schema/validator 校验后持久化，并即时触发适配器重注册
 *   （设置页与模型选择器通过推送事件自动刷新）。
 *
 * 路由选择：用户可能已手工配置过 OpenRouter（route 名为 openrouter / openrouter-free，
 * 或 baseURL 指向 openrouter.ai）。存在这样的路由时把模型并入该路由（只改 models，
 * 其余字段原样保留）；不存在时新建 `openrouter-free` 路由（openai-completions 协议）。
 * 另可选把新模型设为新会话默认模型（agent-default-model 命名空间，replace 全节写入，
 * 与 AgentDefaultModelConfig.saveSelection 同一写法）。
 */

import { settingsNamespace } from '@deepseek-ai/dsh-settings'

/** llm-pi-ai 插件的 settings 命名空间（provider 路由的持久化位置）。 */
const LLM_NS = settingsNamespace('llm-pi-ai')
/** 新会话默认模型命名空间（可选写）。 */
const DEFAULT_MODEL_NS = settingsNamespace('agent-default-model')

/** 新建路由时的路由键与展示名。 */
export const FALLBACK_ROUTE = 'openrouter-free'
export const FALLBACK_DISPLAY_NAME = 'OpenRouter Free'
/** 约定俗成的 OpenRouter 凭据引用（环境变量名）。 */
export const CREDENTIAL_REF = 'OPENROUTER_API_KEY'
/** 新建路由使用的线协议与端点。 */
export const ROUTE_API = 'openai-completions'

/** POSIX 环境变量名（credentials 引用）的语法校验，语义对齐 dsh-credentials。 */
const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/

/** 宿主 settings 服务的最小视图（本插件用到的成员）。 */
export interface SettingsServiceView {
  /** 合并 patch 到命名空间用户层并持久化（校验失败抛错）。 */
  update(ns: unknown, patch: object): Promise<void>
  /** 整节替换命名空间用户层（agent-default-model 的官方写法）。 */
  replace(ns: unknown, section: object): Promise<void>
  /** 读取命名空间当前解析值（schema 应用后；未注册返回 undefined）。 */
  get(ns: unknown): unknown
  /** 逐命名空间描述符（含原始用户层 section；进程内读取，无需脱敏）。 */
  describe(): Array<{ ns?: unknown; user?: unknown }>
}

/** 宿主 credentials 服务的最小视图（本插件用到的成员）。 */
export interface CredentialsServiceView {
  /** 存储一个凭据引用的值（.credentials.yaml）。 */
  set(ref: unknown, value: string): Promise<void>
  /** 描述一个凭据引用的状态（不含明文）。 */
  describe(ref: unknown): Promise<unknown>
}

/** 写入 settings.yaml 的模型条目（llm-pi-ai modelProfile 的已知名段）。 */
export interface RouteModelProfile {
  id: string
  name?: string
  contextWindow?: number
  maxTokens?: number
  input?: string[]
  [key: string]: unknown
}

/** 一个已存在的 OpenRouter 路由快照。 */
export interface OpenRouterRouteView {
  /** 路由键（providers dict 的 key）。 */
  name: string
  /** 路由当前 models 条目（原始 JSON 形态）。 */
  models: RouteModelProfile[]
  /** 路由声明的凭据引用（环境变量名），可能缺失。 */
  apiKeyEnv?: string
}

/** 当前 OpenRouter 路由与凭据状态（status op 与 useModel op 共用）。 */
export interface RouteState {
  /** 命中的 OpenRouter 路由；用户尚未配置任何 OpenRouter 路由时为 undefined。 */
  route: OpenRouterRouteView | undefined
  /** 凭据引用当前是否已有值。 */
  credentialConfigured: boolean
}

/**
 * 校验一个凭据引用名（对齐 dsh-credentials 的 POSIX 标识符语法）。
 * @param ref - 候选引用名。
 * @returns true 表示语法合法。
 */
export function isCredentialRefName(ref: string): boolean {
  return REF_PATTERN.test(ref)
}

/**
 * 在解析后的 llm-pi-ai 配置里找到 OpenRouter 路由。
 * 命中优先级：名为 `openrouter` > `openrouter-free` > 其它 `openrouter*` > baseURL
 * 指向 openrouter.ai 的路由。
 * @param providers - llm-pi-ai 解析值里的 providers dict（可为空）。
 * @returns 路由视图；没有命中返回 undefined。
 */
export function findOpenRouterRoute(
  providers: Record<string, unknown> | undefined,
): OpenRouterRouteView | undefined {
  if (providers === undefined || typeof providers !== 'object') return undefined
  const entries = Object.entries(providers)
    .filter(([, profile]) => profile !== null && typeof profile === 'object')
    .map(([name, profile]) => {
      const record = profile as Record<string, unknown>
      const models = Array.isArray(record.models)
        ? (record.models as Record<string, unknown>[]).filter((entry) =>
            entry !== null && typeof entry === 'object' && typeof entry.id === 'string')
          .map((entry) => entry as RouteModelProfile)
        : []
      const apiKeyEnv = typeof record.apiKeyEnv === 'string' && record.apiKeyEnv.length > 0
        ? record.apiKeyEnv
        : undefined
      const baseURL = typeof record.baseURL === 'string' ? record.baseURL : ''
      return { name, models, apiKeyEnv, baseURL }
    })
  const byName = (name: string): OpenRouterRouteView | undefined =>
    entries.find((entry) => entry.name === name)
  return byName('openrouter')
    ?? byName(FALLBACK_ROUTE)
    ?? entries.find((entry) => /^openrouter-/.test(entry.name))
    ?? entries.find((entry) => entry.baseURL.includes('openrouter.ai'))
}

/**
 * 从 settings 描述符里读 llm-pi-ai 命名空间「原始用户层」的某路由 models。
 * 合并进已有路由时优先用它：数组整体替换是 settings 合并的语义，携带原始条目
 * 才不会把 schema 解析出的默认值噪声（`input: []` 等）写回用户文件。
 * @param settings - 宿主 settings 服务。
 * @param routeName - 路由键。
 * @returns 原始用户层 models；路由不在用户层（仅组合层声明）或读取失败返回 undefined。
 */
function rawUserModels(
  settings: SettingsServiceView,
  routeName: string,
): RouteModelProfile[] | undefined {
  try {
    const descriptor = settings.describe().find((entry) => String(entry?.ns) === 'llm-pi-ai')
    const user = descriptor?.user as { providers?: Record<string, { models?: unknown }> } | undefined
    const models = user?.providers?.[routeName]?.models
    if (!Array.isArray(models)) return undefined
    return models
      .filter((entry) => entry !== null && typeof entry === 'object' && typeof (entry as RouteModelProfile).id === 'string')
      .map((entry) => entry as RouteModelProfile)
  } catch {
    return undefined
  }
}

/**
 * 读取当前 OpenRouter 路由与凭据状态。
 * @param settings - 宿主 settings 服务（缺失时返回未配置状态）。
 * @param credentials - 宿主 credentials 服务（缺失时凭据按未配置处理）。
 * @returns 路由与凭据快照。
 */
export async function readRouteState(
  settings: SettingsServiceView | undefined,
  credentials: CredentialsServiceView | undefined,
): Promise<RouteState> {
  const resolved = settings?.get(LLM_NS) as { providers?: Record<string, unknown> } | undefined
  const route = findOpenRouterRoute(resolved?.providers)
  if (route !== undefined && settings !== undefined) {
    const raw = rawUserModels(settings, route.name)
    if (raw !== undefined) route.models = raw
  }
  let credentialConfigured = false
  if (credentials !== undefined) {
    try {
      const info = (await credentials.describe(CREDENTIAL_REF)) as { configured?: unknown } | undefined
      credentialConfigured = info?.configured === true
    } catch {
      credentialConfigured = false
    }
  }
  return { route, credentialConfigured }
}

/**
 * 把一个 FreeModel 映射为 llm-pi-ai 的模型条目。
 * @param model - 规范化免费模型。
 * @returns settings.yaml 形态的模型条目。
 */
export function toRouteModelProfile(model: {
  id: string
  name: string
  contextLength: number | null
  maxCompletionTokens: number | null
  inputModalities: string[]
}): RouteModelProfile {
  const entry: RouteModelProfile = { id: model.id, name: model.name || model.id }
  if (model.contextLength !== null && model.contextLength > 0) {
    entry.contextWindow = Math.round(model.contextLength)
  }
  if (model.maxCompletionTokens !== null && model.maxCompletionTokens > 0) {
    entry.maxTokens = Math.round(model.maxCompletionTokens)
  }
  // pi-ai 模态只认 text / image；OpenRouter 的 video 输入不声明（保持文本回退）。
  entry.input = model.inputModalities.includes('image') ? ['text', 'image'] : ['text']
  return entry
}

/**
 * 创建/更新模型配置：写入凭据（可选）并把模型并入 OpenRouter 路由。
 * @param deps - settings 与 credentials 服务视图。
 * @param model - 目标模型（规范化字段）。
 * @param options - token（提供则落凭据）与 setDefault（设为新会话默认模型）。
 * @returns 写入结果摘要（路由名、是否已存在、模型总数、凭据动作、默认模型）。
 */
export async function applyModelConfig(
  deps: { settings: SettingsServiceView; credentials: CredentialsServiceView },
  model: { id: string; name: string; contextLength: number | null; maxCompletionTokens: number | null; inputModalities: string[] },
  options: { token?: string; setDefault?: boolean } = {},
): Promise<{
  routeName: string
  routeExisted: boolean
  modelCount: number
  credentialAction: 'set' | 'kept' | 'missing'
  defaultModelSet: boolean
}> {
  const token = typeof options.token === 'string' ? options.token.trim() : ''
  const before = await readRouteState(deps.settings, deps.credentials)
  const routeExisted = before.route !== undefined

  // ── 凭据：提供 token 则覆盖写入；路由自带别的引用名时写那个引用 ──
  let credentialAction: 'set' | 'kept' | 'missing' = 'kept'
  if (token.length > 0) {
    const targetRef = before.route?.apiKeyEnv !== undefined && isCredentialRefName(before.route.apiKeyEnv)
      ? before.route.apiKeyEnv
      : CREDENTIAL_REF
    await deps.credentials.set(targetRef, token)
    credentialAction = 'set'
  }

  // ── 路由：并入已有路由或新建；models 按 id 去重（同 id 覆盖为新条目）──
  const routeName = before.route?.name ?? FALLBACK_ROUTE
  const existing = before.route?.models ?? []
  const entry = toRouteModelProfile(model)
  const nextModels: RouteModelProfile[] = [...existing.filter((item) => item.id !== model.id), entry]

  const routePatch: Record<string, unknown> = { models: nextModels }
  if (!routeExisted) {
    routePatch.displayName = FALLBACK_DISPLAY_NAME
    routePatch.api = ROUTE_API
    routePatch.baseURL = OPENROUTER_ROUTE_BASE_URL
    routePatch.apiKeyEnv = CREDENTIAL_REF
  } else if (before.route?.apiKeyEnv === undefined) {
    // 已有路由却没声明凭据引用：补上约定引用，避免请求期走 pi-ai 的环境发现
    // 而报出难以理解的错误；已有引用名则不覆盖用户的手工配置。
    routePatch.apiKeyEnv = CREDENTIAL_REF
  }
  await deps.settings.update(LLM_NS, { providers: { [routeName]: routePatch } })

  // ── 可选：设为新会话默认模型（replace 全节，同官方 saveSelection）──
  let defaultModelSet = false
  if (options.setDefault === true) {
    await deps.settings.replace(DEFAULT_MODEL_NS, { provider: routeName, model: model.id })
    defaultModelSet = true
  }

  return {
    routeName,
    routeExisted,
    modelCount: nextModels.length,
    credentialAction,
    defaultModelSet,
  }
}

/** 新建路由时的 OpenRouter 端点。 */
export const OPENROUTER_ROUTE_BASE_URL = 'https://openrouter.ai/api/v1'
