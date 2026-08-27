/**
 * dsh-free-model —— /dsh-free-model/api 的 op 分发（浏览器半边的全部宿主能力）。
 *
 * - models：免费模型列表（缓存 6 小时；refresh 强制拉取；网络 10 次重试全败时
 *   降级返回旧缓存并标记 stale）；
 * - status：当前 OpenRouter 路由与凭据状态（列表「已添加」徽标与弹框提示用）；
 * - checkToken：校验用户输入的 OpenRouter Token（GET /key）；
 * - useModel：创建模型配置（凭据可选 + 路由并入/新建 + 可选默认模型）。
 */
import { type CredentialsServiceView, type SettingsServiceView } from './model-config.ts';
import type { OpRequest, OpResult } from './types.ts';
/** op 分发依赖。 */
export interface OpDeps {
    /** 插件数据目录（模型缓存文件所在）。 */
    storeDir: string;
    /** 宿主 settings 服务（缺失时写相关 op 返回 settings-missing）。 */
    settings: SettingsServiceView | undefined;
    /** 宿主 credentials 服务（缺失时凭据按未配置处理）。 */
    credentials: CredentialsServiceView | undefined;
}
/**
 * 分发一次 op 请求。
 * @param deps - op 依赖（服务视图 + 数据目录）。
 * @param request - 解析后的请求。
 * @returns 结果载荷（恒为 { ok, ... } 形态；异常已就地折叠）。
 */
export declare function runOp(deps: OpDeps, request: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map