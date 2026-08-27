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
import { isTrustedApiRequest } from "./fence.js";
import { runOp } from "./ops.js";
import { resolveStoreDir } from "./store.js";
export const name = 'dsh-free-model';
/**
 * 必需服务：settings（路由写入）与 credentials（Token 存储）。
 * webServer / webRuntime 为可选依赖，用 ctx.get 读取（headless 等组合缺失时
 * 仅跳过路由注册并告警，不影响插件其余部分）。
 */
export const inject = ['settings', 'credentials'];
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** 宿主插件入口：解析数据目录并注册浏览器 HTTP API。 */
export function apply(ctx) {
    const settings = ctx.get('settings');
    const credentials = ctx.get('credentials');
    const storeDir = resolveStoreDir(settings?.documentPath);
    const deps = { storeDir, settings, credentials };
    const webServer = ctx.get('webServer');
    const webRuntime = ctx.get('webRuntime');
    if (webServer === undefined) {
        console.warn('[dsh-free-model] webServer service unavailable; the settings tab will not reach the host half');
        return;
    }
    // ─── 浏览器 HTTP API（/dsh-free-model/api）────────────────────
    // 设置页经此路由与宿主通信；带浏览器信任围栏（loopback Host /
    // webRuntime.trustedHosts + 同源标记）。webServer 缺失时上面已告警跳过。
    const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
    try {
        webServer.register({
            kind: 'exact',
            path: '/dsh-free-model/api',
            handler: async (req, res) => {
                if (!fence(req.headers)) {
                    writeApiJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                    return;
                }
                if (req.method !== 'POST') {
                    writeApiJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                    return;
                }
                // 有界读取请求体（防御未绑定的大体）。
                const chunks = [];
                let total = 0;
                for await (const chunk of req) {
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    total += buffer.length;
                    if (total > API_BODY_LIMIT) {
                        writeApiJson(res, 413, { ok: false, error: { code: 'body-too-large', message: 'request body too large' } });
                        return;
                    }
                    chunks.push(buffer);
                }
                const text = Buffer.concat(chunks).toString('utf8');
                let request = { op: 'models' };
                if (text.trim().length > 0) {
                    try {
                        request = JSON.parse(text);
                    }
                    catch {
                        writeApiJson(res, 400, { ok: false, error: { code: 'params-invalid', message: 'Parameters must be JSON' } });
                        return;
                    }
                }
                try {
                    const payload = await runOp(deps, request);
                    writeApiJson(res, 200, { ok: true, value: payload });
                }
                catch (error) {
                    // runOp 内部已折叠 op 级失败；此处兜底真正的异常为同构错误载荷。
                    writeApiJson(res, 200, {
                        ok: true,
                        value: { ok: false, code: 'internal', error: error instanceof Error ? error.message : String(error) },
                    });
                }
            },
        });
    }
    catch (error) {
        // 热重载重复注册（kind,path 冲突）时幂等忽略；其余告警。
        console.warn('[dsh-free-model] api route registration skipped:', error instanceof Error ? error.message : String(error));
    }
}
