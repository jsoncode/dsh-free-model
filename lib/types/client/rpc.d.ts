/**
 * dsh-free-model —— 浏览器半边：与宿主通信（fetch POST /dsh-free-model/api）。
 *
 * 请求不进入对话命令通道，不会在会话中产生 command 节点。路由不可达（旧宿主 /
 * 未安装宿主半边 / 信任围栏拒绝）时返回结构化错误，由设置页直接提示。
 */
export interface RunResult {
    ok: boolean;
    code?: string;
    error?: string;
    [key: string]: unknown;
}
export type RunFn = (op: Record<string, unknown>) => Promise<RunResult>;
/**
 * 构造与宿主的 RPC 函数。
 * @returns run(op) → 宿主 op 结果（恒为 { ok, ... } 形态）。
 */
export declare function makeRun(): RunFn;
//# sourceMappingURL=rpc.d.ts.map