/**
 * dsh-free-model —— 「添加到模型列表」弹框：确认后由宿主创建模型配置。
 *
 * Token 规则：平台凭据（OPENROUTER_API_KEY）已配置时**不再要求输入**——直接沿用
 * 已存 Token，确认即添加；未配置时 Token 必填（免费模型同样需要 Key）。
 * 添加 = Token（可选）经 credentials 服务落 .credentials.yaml + 模型并入
 * settings.yaml 的 OpenRouter 路由（llm-pi-ai 命名空间）+ 可选设为新会话默认模型。
 */
import type { RunFn } from '../rpc.ts';
import type { FreeModel } from '../types.ts';
export interface AddModelModalProps {
    model: FreeModel;
    run: RunFn;
    /** 当前命中的 OpenRouter 路由名（null = 将新建 openrouter-free）。 */
    routeName: string | null;
    /** 命中路由当前的模型数。 */
    routeModelCount: number;
    /** 平台 Token（OPENROUTER_API_KEY）是否已配置；true 时隐藏 Token 输入。 */
    credentialConfigured: boolean;
    onClose: () => void;
    /** 保存成功后回调（列表刷新「已添加」徽标）。 */
    onSaved: () => void;
}
export declare function AddModelModal(props: AddModelModalProps): import("react").JSX.Element;
//# sourceMappingURL=AddModelModal.d.ts.map