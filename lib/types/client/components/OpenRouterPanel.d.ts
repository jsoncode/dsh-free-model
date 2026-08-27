/**
 * dsh-free-model —— OpenRouter 平台面板：列表展示 + 二次本地搜索 + 「添加到模型列表」。
 *
 * 数据全部来自宿主 /dsh-free-model/api（platform: 'openrouter'）：models op
 * （宿主已按 created 倒序排序、已过滤免费模型，本组件保持顺序不再排序）；
 * status op（已添加徽标 + 弹框的「沿用已存 Token」提示）。
 */
import type { RunFn } from '../rpc.ts';
export interface OpenRouterPanelProps {
    run: RunFn;
}
export declare function OpenRouterPanel({ run }: OpenRouterPanelProps): import("react").JSX.Element;
//# sourceMappingURL=OpenRouterPanel.d.ts.map