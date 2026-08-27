/**
 * dsh-free-model —— 浏览器半边：与宿主通信（fetch POST /dsh-free-model/api）。
 *
 * 请求不进入对话命令通道，不会在会话中产生 command 节点。路由不可达（旧宿主 /
 * 未安装宿主半边 / 信任围栏拒绝）时返回结构化错误，由设置页直接提示。
 */
/** 请求超时（毫秒）：宿主侧拉取 OpenRouter 自带 10 次重试，这里给足余量。 */
const REQUEST_TIMEOUT_MS = 150_000;
/**
 * 构造与宿主的 RPC 函数。
 * @returns run(op) → 宿主 op 结果（恒为 { ok, ... } 形态）。
 */
export function makeRun() {
    return async (op) => {
        const controller = new AbortController();
        const timer = setTimeout(() => { controller.abort(); }, REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch('/dsh-free-model/api', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(op),
                signal: controller.signal,
            });
            if (!response.ok) {
                return { ok: false, code: 'route-unreachable', error: `HTTP ${String(response.status)}` };
            }
            const parsed = await response.json().catch(() => null);
            if (parsed === null || parsed.ok !== true || parsed.value === undefined) {
                const message = parsed?.error?.message;
                return { ok: false, code: parsed?.error?.code ?? 'route-unreachable', error: message ?? 'bad envelope' };
            }
            const value = parsed.value;
            return value !== null && typeof value === 'object'
                ? value
                : { ok: false, error: String(value) };
        }
        catch (error) {
            return { ok: false, code: 'route-unreachable', error: error instanceof Error ? error.message : String(error) };
        }
        finally {
            clearTimeout(timer);
        }
    };
}
