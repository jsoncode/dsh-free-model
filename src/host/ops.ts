/**
 * dsh-free-model —— /dsh-free-model/api 的 op 分发（浏览器半边的全部宿主能力）。
 *
 * - models：免费模型列表（缓存 6 小时；refresh 强制拉取；网络 10 次重试全败时
 *   降级返回旧缓存并标记 stale）；
 * - status：当前 OpenRouter 路由与凭据状态（列表「已添加」徽标与弹框提示用）；
 * - checkToken：校验用户输入的 OpenRouter Token（GET /key）；
 * - useModel：创建模型配置（凭据可选 + 路由并入/新建 + 可选默认模型）。
 */

import { checkOpenRouterToken, fetchFreeModels } from './openrouter.ts'
import { applyModelConfig, readRouteState, type CredentialsServiceView, type SettingsServiceView } from './model-config.ts'
import { loadStore, saveStore } from './store.ts'
import type { FreeModel, OpRequest, OpResult } from './types.ts'

/** 缓存新鲜窗口：窗口内不回源（设置页每次打开都秒出列表）。 */
const FRESH_MS = 6 * 60 * 60 * 1000

/** op 分发依赖。 */
export interface OpDeps {
  /** 插件数据目录（模型缓存文件所在）。 */
  storeDir: string
  /** 宿主 settings 服务（缺失时写相关 op 返回 settings-missing）。 */
  settings: SettingsServiceView | undefined
  /** 宿主 credentials 服务（缺失时凭据按未配置处理）。 */
  credentials: CredentialsServiceView | undefined
}

/**
 * 从缓存里按 id 找模型；找不到且调用方带了内联快照时退回快照。
 * @param cached - 缓存的模型列表。
 * @param modelId - 目标模型 id。
 * @param inline - 调用方自带的模型快照（列表页渲染时的数据）。
 * @returns 命中的模型；都没有返回 undefined。
 */
function resolveTargetModel(
  cached: FreeModel[],
  modelId: string,
  inline: Partial<FreeModel> | undefined,
): FreeModel | undefined {
  const hit = cached.find((entry) => entry.id === modelId)
  if (hit !== undefined) return hit
  if (inline !== undefined && typeof inline.id === 'string' && inline.id.length > 0) {
    return {
      id: inline.id,
      canonicalSlug: inline.canonicalSlug ?? null,
      name: inline.name ?? inline.id,
      createdAt: inline.createdAt ?? 0,
      description: inline.description ?? '',
      contextLength: inline.contextLength ?? null,
      maxCompletionTokens: inline.maxCompletionTokens ?? null,
      inputModalities: Array.isArray(inline.inputModalities) ? inline.inputModalities : ['text'],
      outputModalities: Array.isArray(inline.outputModalities) ? inline.outputModalities : [],
      modality: inline.modality ?? null,
      tokenizer: inline.tokenizer ?? null,
      pricing: inline.pricing ?? { prompt: 0, completion: 0, request: null, image: null, webSearch: null, internalReasoning: null, inputCacheRead: null, inputCacheWrite: null },
      supportedParameters: Array.isArray(inline.supportedParameters) ? inline.supportedParameters : [],
      moderated: inline.moderated === true,
      huggingFaceId: inline.huggingFaceId ?? null,
      freeSuffix: inline.freeSuffix === true,
      reasoningMandatory: inline.reasoningMandatory === true,
    }
  }
  return undefined
}

/**
 * 分发一次 op 请求。
 * @param deps - op 依赖（服务视图 + 数据目录）。
 * @param request - 解析后的请求。
 * @returns 结果载荷（恒为 { ok, ... } 形态；异常已就地折叠）。
 */
export async function runOp(deps: OpDeps, request: OpRequest): Promise<OpResult> {
  // 平台路由：目前仅 openrouter；新增平台时在此扩展分发（UI 的 tab 与此一一对应）。
  const platform = typeof request.platform === 'string' && request.platform.length > 0 ? request.platform : 'openrouter'
  if (platform !== 'openrouter') {
    return { ok: false, code: 'unknown-platform', error: `unknown platform: ${platform}` }
  }
  try {
    switch (request.op) {
      case 'models':
        return await runModels(deps, request.refresh === true)
      case 'status':
        return await runStatus(deps)
      case 'checkToken':
        return await runCheckToken(deps, typeof request.token === 'string' ? request.token.trim() : '')
      case 'useModel':
        return await runUseModel(deps, request)
      default:
        return { ok: false, code: 'unknown-op', error: `unknown op: ${JSON.stringify((request as { op?: unknown }).op)}` }
    }
  } catch (error) {
    return { ok: false, code: 'internal', error: error instanceof Error ? error.message : String(error) }
  }
}

/** models op：缓存优先，miss/refresh 回源（10 次重试），全败降级旧缓存。 */
async function runModels(deps: OpDeps, refresh: boolean): Promise<OpResult> {
  const cached = await loadStore(deps.storeDir)
  if (!refresh && cached !== null && cached.models.length > 0 && Date.now() - cached.fetchedAt < FRESH_MS) {
    return { ok: true, models: cached.models, fetchedAt: cached.fetchedAt, source: 'cache' }
  }
  try {
    const models = await fetchFreeModels()
    const fetchedAt = Date.now()
    await saveStore(deps.storeDir, { version: 1, models, fetchedAt })
    return { ok: true, models, fetchedAt, source: 'network' }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (cached !== null && cached.models.length > 0) {
      return { ok: true, models: cached.models, fetchedAt: cached.fetchedAt, source: 'cache', stale: true, error: message }
    }
    return { ok: false, code: 'fetch-failed', error: message }
  }
}

/** status op：OpenRouter 路由 + 凭据状态。 */
async function runStatus(deps: OpDeps): Promise<OpResult> {
  if (deps.settings === undefined) {
    return { ok: false, code: 'settings-missing', error: 'settings service unavailable' }
  }
  const state = await readRouteState(deps.settings, deps.credentials)
  return {
    ok: true,
    route: state.route === undefined
      ? null
      : {
          name: state.route.name,
          modelCount: state.route.models.length,
          modelIds: state.route.models.map((entry) => entry.id),
          apiKeyEnv: state.route.apiKeyEnv ?? null,
        },
    credentialConfigured: state.credentialConfigured,
  }
}

/** checkToken op：GET /key 校验（401/403 不重试，网络错误 10 次重试）。 */
async function runCheckToken(deps: OpDeps, token: string): Promise<OpResult> {
  if (token.length === 0) {
    return { ok: false, code: 'token-required', error: 'token is required' }
  }
  try {
    const result = await checkOpenRouterToken(token)
    if (result.valid) {
      return { ok: true, valid: true, label: result.label, usage: result.usage, limit: result.limit }
    }
    return { ok: true, valid: false, code: 'auth-failed', error: result.reason }
  } catch (error) {
    return { ok: false, code: 'network-failed', error: error instanceof Error ? error.message : String(error) }
  }
}

/** useModel op：创建模型配置（凭据 + 路由 + 可选默认模型）。 */
async function runUseModel(
  deps: OpDeps,
  request: Extract<OpRequest, { op: 'useModel' }>,
): Promise<OpResult> {
  if (deps.settings === undefined) {
    return { ok: false, code: 'settings-missing', error: 'settings service unavailable' }
  }
  if (deps.credentials === undefined) {
    return { ok: false, code: 'credentials-missing', error: 'credentials service unavailable' }
  }
  const modelId = typeof request.modelId === 'string' ? request.modelId.trim() : ''
  if (modelId.length === 0) {
    return { ok: false, code: 'model-missing', error: 'modelId is required' }
  }
  const cached = await loadStore(deps.storeDir)
  const model = resolveTargetModel(cached?.models ?? [], modelId, request.model)
  if (model === undefined) {
    return { ok: false, code: 'model-not-found', error: `model "${modelId}" is not in the cached free-model list; refresh the list and retry` }
  }
  try {
    const result = await applyModelConfig(
      { settings: deps.settings, credentials: deps.credentials },
      model,
      { token: request.token, setDefault: request.setDefault === true },
    )
    return {
      ok: true,
      modelId: model.id,
      modelName: model.name,
      routeName: result.routeName,
      routeExisted: result.routeExisted,
      modelCount: result.modelCount,
      credentialAction: result.credentialAction,
      defaultModelSet: result.defaultModelSet,
    }
  } catch (error) {
    // settings 写入被命名空间 schema/validator 拒绝等：原文透出，前端按 code 提示。
    return { ok: false, code: 'settings-rejected', error: error instanceof Error ? error.message : String(error) }
  }
}
