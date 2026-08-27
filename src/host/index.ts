/**
 * dsh-free-model —— OpenRouter 免费模型浏览/一键配置插件 · 宿主半边。
 *
 * - `/dsh-free-model/api` HTTP 路由（webServer 注册 + 浏览器信任围栏）：浏览器半边
 *   （设置 → 免费模型 tab）经 fetch POST JSON 调用，op 分发见 ops.ts：
 *   `models`（拉取/缓存免费模型）、`status`（路由与凭据状态）、`checkToken`、
 *   `useModel`（写凭据 + settings.yaml 路由，创建可直接使用的模型配置）。
 * - 模型缓存落 $DSH_HOME/dsh-free-model.json；OpenRouter Token 只经 credentials
 *   服务落 .credentials.yaml，本插件不存储任何密钥。
 * - 无模型工具、无对话命令：设置页是唯一入口。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主/插件目录解析，本文件不含任何绝对路径。
 */

import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { isTrustedApiRequest } from './fence.ts'
import { runOp, type OpDeps } from './ops.ts'
import type { CredentialsServiceView, SettingsServiceView } from './model-config.ts'
import { resolveStoreDir } from './store.ts'
import type { OpRequest } from './types.ts'

export const name = 'dsh-free-model'

/**
 * 必需服务：settings（路由写入）与 credentials（Token 存储）。
 * webServer / webRuntime 为可选依赖，用 ctx.get 读取（headless 等组合缺失时
 * 仅跳过路由注册并告警，不影响插件其余部分）。
 */
export const inject = ['settings', 'credentials']

/** 宿主 webServer 服务最小视图（@deepseek-ai/dsh-host-webserver）。 */
interface WebServerService {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

/** webRuntime 服务最小视图（@deepseek-ai/dsh-web-app 提供，绑定派生的受信任主机）。 */
interface WebRuntimeService {
  trustedHosts?: readonly string[]
}

/** /dsh-free-model/api 信封：{ ok: true, value } 成功；{ ok: false, error } 路由级失败。 */
interface ApiEnvelope {
  ok: boolean
  value?: unknown
  error?: { code?: string; message?: string }
}

const API_BODY_LIMIT = 1 << 20

function writeApiJson(res: ServerResponse, status: number, body: ApiEnvelope): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/** 宿主插件入口：解析数据目录并注册浏览器 HTTP API。 */
export function apply(ctx: Context): void {
  const settings = ctx.get<SettingsServiceView>('settings')
  const credentials = ctx.get<CredentialsServiceView>('credentials')
  const storeDir = resolveStoreDir((settings as { documentPath?: string } | undefined)?.documentPath)
  const deps: OpDeps = { storeDir, settings, credentials }

  const webServer = ctx.get<WebServerService>('webServer')
  const webRuntime = ctx.get<WebRuntimeService>('webRuntime')
  if (webServer === undefined) {
    console.warn('[dsh-free-model] webServer service unavailable; the settings tab will not reach the host half')
    return
  }

  // ─── 浏览器 HTTP API（/dsh-free-model/api）────────────────────
  // 设置页经此路由与宿主通信；带浏览器信任围栏（loopback Host /
  // webRuntime.trustedHosts + 同源标记）。webServer 缺失时上面已告警跳过。
  const fence = (headers: IncomingHttpHeaders): boolean =>
    isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? [])
  try {
    webServer.register({
      kind: 'exact',
      path: '/dsh-free-model/api',
      handler: async (req, res) => {
        if (!fence(req.headers)) {
          writeApiJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
          return
        }
        if (req.method !== 'POST') {
          writeApiJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } })
          return
        }
        // 有界读取请求体（防御未绑定的大体）。
        const chunks: Buffer[] = []
        let total = 0
        for await (const chunk of req) {
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
          total += buffer.length
          if (total > API_BODY_LIMIT) {
            writeApiJson(res, 413, { ok: false, error: { code: 'body-too-large', message: 'request body too large' } })
            return
          }
          chunks.push(buffer)
        }
        const text = Buffer.concat(chunks).toString('utf8')
        let request: OpRequest = { op: 'models' }
        if (text.trim().length > 0) {
          try {
            request = JSON.parse(text) as OpRequest
          } catch {
            writeApiJson(res, 400, { ok: false, error: { code: 'params-invalid', message: 'Parameters must be JSON' } })
            return
          }
        }
        try {
          const payload = await runOp(deps, request)
          writeApiJson(res, 200, { ok: true, value: payload })
        } catch (error) {
          // runOp 内部已折叠 op 级失败；此处兜底真正的异常为同构错误载荷。
          writeApiJson(res, 200, {
            ok: true,
            value: { ok: false, code: 'internal', error: error instanceof Error ? error.message : String(error) },
          })
        }
      },
    })
  } catch (error) {
    // 热重载重复注册（kind,path 冲突）时幂等忽略；其余告警。
    console.warn('[dsh-free-model] api route registration skipped:', error instanceof Error ? error.message : String(error))
  }
}
