/**
 * dsh-free-model —— 设置 → 免费模型：平台 tab 外壳。
 *
 * 目前内置 OpenRouter 一个平台。新增平台时：
 * 1. 在 PLATFORMS 追加一项（id 同时是宿主 op 协议里的 platform 字段）；
 * 2. 实现对应的面板组件（参考 OpenRouterPanel），并在下方按 id 挂载；
 * 3. 宿主 ops.ts 的 runOp 里扩展同名平台分发。
 */
import type { RunFn } from '../rpc.ts';
export interface FreeModelsSectionProps {
    run: RunFn;
}
export declare function FreeModelsSection({ run }: FreeModelsSectionProps): import("react").JSX.Element;
//# sourceMappingURL=FreeModelsSection.d.ts.map