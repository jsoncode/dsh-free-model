/**
 * 冒烟测试（本地，不进发布包）：真实拉取 OpenRouter 模型目录，验证
 * 免费过滤、created 倒序排序与规范化字段。
 */
import { fetchFreeModels, MAX_ATTEMPTS } from '../src/host/openrouter.ts'
import { toRouteModelProfile, findOpenRouterRoute } from '../src/host/model-config.ts'

const models = await fetchFreeModels()
console.log(`attempts cap: ${MAX_ATTEMPTS}`)
console.log(`free models: ${models.length}`)
console.log('first 5 (should be newest):')
for (const m of models.slice(0, 5)) {
  console.log(`  ${new Date(m.createdAt * 1000).toISOString().slice(0, 10)}  ${m.id}  ctx=${m.contextLength}  in=[${m.inputModalities.join(',')}]  params=${m.supportedParameters.length}`)
}
const sorted = [...models].every((m, i, arr) => i === 0 || arr[i - 1].createdAt >= m.createdAt)
console.log(`sorted desc by created: ${sorted}`)
const allFree = models.every((m) => m.freeSuffix || (m.pricing.prompt === 0 && m.pricing.completion === 0))
console.log(`all free: ${allFree}`)

// 路由映射抽查
const sample = models.find((m) => m.inputModalities.includes('image')) ?? models[0]
console.log('sample route profile:', JSON.stringify(toRouteModelProfile(sample)))

// 路由识别抽查（模拟用户现有 settings.yaml 的形态）
const existing = findOpenRouterRoute({ openrouter: { models: [{ id: 'x' }], apiKeyEnv: 'OPENROUTER_API_KEY' } })
console.log('route found (openrouter):', existing?.name, existing?.apiKeyEnv)
const none = findOpenRouterRoute({ deepseek: { models: [] } })
console.log('route found (none):', none)
