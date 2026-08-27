/**
 * dsh-free-model —— OpenRouter 模型目录拉取与免费模型筛选。
 *
 * - `GET https://openrouter.ai/api/v1/models` 为公开端点，无需鉴权；
 * - 免费判定：id 以 `:free` 结尾，或 prompt/completion 定价同时为 0（定价为
 *   USD/token 字符串，缺失或不可解析视为非免费）；
 * - 排序：`created` 倒序（最新的在最上面），同秒按 id 升序保证稳定；
 * - 网络请求失败自动重试，最多 10 次（指数退避 + 抖动），全部失败抛出最后一次错误。
 */

import type { FreeModel } from './types.ts'

/** OpenRouter 公开 API 基地址。 */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
/** 模型目录端点。 */
const MODELS_URL = `${OPENROUTER_BASE_URL}/models`
/** 凭据校验端点（GET /key 返回当前 key 的 label/usage/limit）。 */
export const OPENROUTER_KEY_URL = `${OPENROUTER_BASE_URL}/key`

/** 网络请求最大尝试次数（首请求 + 重试共 10 次）。 */
export const MAX_ATTEMPTS = 10
/** 单次请求超时（毫秒）。 */
const REQUEST_TIMEOUT_MS = 20_000
/** 退避基数（毫秒）：第 n 次失败后等待 min(8s, 400 * 2^(n-1)) + 抖动。 */
const BACKOFF_BASE_MS = 400
const BACKOFF_CAP_MS = 8_000

/** OpenRouter 原始模型条目（只声明用到的字段，其余忽略）。 */
interface RawModel {
  id?: unknown
  canonical_slug?: unknown
  hugging_face_id?: unknown
  name?: unknown
  created?: unknown
  description?: unknown
  context_length?: unknown
  architecture?: {
    modality?: unknown
    input_modalities?: unknown
    output_modalities?: unknown
    tokenizer?: unknown
  } | null
  pricing?: Record<string, unknown> | null
  top_provider?: {
    context_length?: unknown
    max_completion_tokens?: unknown
    is_moderated?: unknown
  } | null
  supported_parameters?: unknown
  reasoning?: { mandatory?: unknown } | null
}

/** OpenRouter /models 响应。 */
interface RawModelsResponse {
  data?: unknown
}

/**
 * 把 OpenRouter 定价字段（USD/token 字符串或数字）解析为数字。
 * @returns 数字；缺失或不可解析返回 null。
 */
function numPrice(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** 安全读取字符串字段；非字符串返回 null。 */
function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

/** 安全读取非负整数；缺失或非法返回 null。 */
function numInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.round(value)
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed)
  }
  return null
}

/** 安全读取字符串数组；缺失返回空数组。 */
function strList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    : []
}

/**
 * 判定一个原始条目是否免费：`:free` 后缀，或 prompt/completion 定价同时为 0。
 * @param raw - OpenRouter 原始模型条目。
 * @returns true 表示免费模型。
 */
export function isFreeModel(raw: RawModel): boolean {
  if (typeof raw.id === 'string' && raw.id.endsWith(':free')) return true
  return numPrice(raw.pricing?.prompt) === 0 && numPrice(raw.pricing?.completion) === 0
}

/**
 * 把一个原始条目规范化为 FreeModel（仅对已通过免费判定的条目调用）。
 * @param raw - OpenRouter 原始模型条目。
 * @returns 规范化的免费模型视图。
 */
export function toFreeModel(raw: RawModel): FreeModel {
  const pricingRaw = raw.pricing ?? {}
  const id = str(raw.id) ?? ''
  return {
    id,
    canonicalSlug: str(raw.canonical_slug),
    name: str(raw.name) ?? id,
    createdAt: numInt(raw.created) ?? 0,
    description: typeof raw.description === 'string' ? raw.description : '',
    contextLength: numInt(raw.context_length),
    maxCompletionTokens: numInt(raw.top_provider?.max_completion_tokens),
    inputModalities: strList(raw.architecture?.input_modalities),
    outputModalities: strList(raw.architecture?.output_modalities),
    modality: str(raw.architecture?.modality),
    tokenizer: str(raw.architecture?.tokenizer),
    pricing: {
      prompt: numPrice(pricingRaw.prompt) ?? 0,
      completion: numPrice(pricingRaw.completion) ?? 0,
      request: numPrice(pricingRaw.request),
      image: numPrice(pricingRaw.image),
      webSearch: numPrice(pricingRaw.web_search),
      internalReasoning: numPrice(pricingRaw.internal_reasoning),
      inputCacheRead: numPrice(pricingRaw.input_cache_read),
      inputCacheWrite: numPrice(pricingRaw.input_cache_write),
    },
    supportedParameters: strList(raw.supported_parameters),
    moderated: raw.top_provider?.is_moderated === true,
    huggingFaceId: str(raw.hugging_face_id),
    freeSuffix: id.endsWith(':free'),
    reasoningMandatory: raw.reasoning?.mandatory === true,
  }
}

/**
 * 拉取 OpenRouter 全量模型并筛选免费模型（created 倒序）。
 * 失败自动重试，最多 MAX_ATTEMPTS 次尝试；全部失败抛出最后一次错误。
 * @returns 免费模型列表（最新在最上面）。
 */
export async function fetchFreeModels(): Promise<FreeModel[]> {
  let lastError: unknown = new Error('openrouter request failed')
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const models = await fetchOnce()
      return models
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        const backoff = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1))
        const jitter = Math.floor(Math.random() * 250)
        await new Promise((resolve) => { setTimeout(resolve, backoff + jitter) })
      }
    }
  }
  throw lastError
}

/**
 * 列表排序：created 倒序（最新在最上），同秒按 id 升序保证稳定。
 * 独立导出供离线测试（scripts/test-ops.mts）复用。
 * @param models - 待排序列表（就地排序）。
 * @returns 同一引用，已排序。
 */
export function sortModels(models: FreeModel[]): FreeModel[] {
  return models.sort((left, right) => (right.createdAt - left.createdAt) || left.id.localeCompare(right.id))
}

/** 单次拉取 + 筛选 + 排序。 */
async function fetchOnce(): Promise<FreeModel[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(MODELS_URL, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) {
    throw new Error(`openrouter /models responded HTTP ${String(response.status)}`)
  }
  const parsed = (await response.json()) as RawModelsResponse
  const data = Array.isArray(parsed.data) ? (parsed.data as RawModel[]) : []
  return sortModels(data
    .filter((raw) => raw !== null && typeof raw === 'object' && typeof raw.id === 'string' && isFreeModel(raw))
    .map((raw) => toFreeModel(raw)))
}

/**
 * 校验一个 OpenRouter API Token（GET /key，携带 Bearer）。
 * 401/403 是确定性的无效结果，不重试；网络类错误沿用 MAX_ATTEMPTS 重试。
 * @param token - 用户输入的 API Token（sk-or-v1-…）。
 * @returns 有效时返回 key 的 label/usage/limit 概要；无效时返回原因。
 */
export async function checkOpenRouterToken(token: string): Promise<
  { valid: true; label: string | null; usage: number | null; limit: number | null }
  | { valid: false; reason: string }
> {
  let lastError: unknown = new Error('openrouter request failed')
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => { controller.abort() }, REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(OPENROUTER_KEY_URL, {
        method: 'GET',
        headers: { accept: 'application/json', authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      if (response.status === 401 || response.status === 403) {
        return { valid: false, reason: `HTTP ${String(response.status)}` }
      }
      if (!response.ok) {
        throw new Error(`openrouter /key responded HTTP ${String(response.status)}`)
      }
      const parsed = (await response.json()) as {
        data?: { label?: unknown; usage?: unknown; limit?: unknown } | null
      }
      const data = parsed.data ?? {}
      return {
        valid: true,
        label: str(data.label),
        usage: numPrice(data.usage),
        limit: numPrice(data.limit),
      }
    } catch (error) {
      lastError = error
      if (attempt < MAX_ATTEMPTS) {
        const backoff = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1))
        const jitter = Math.floor(Math.random() * 250)
        await new Promise((resolve) => { setTimeout(resolve, backoff + jitter) })
      }
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError
}
