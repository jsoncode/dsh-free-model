/**
 * dsh-free-model —— OpenRouter 模型目录拉取与免费模型筛选。
 *
 * - `GET https://openrouter.ai/api/v1/models` 为公开端点，无需鉴权；
 * - 免费判定：id 以 `:free` 结尾，或 prompt/completion 定价同时为 0（定价为
 *   USD/token 字符串，缺失或不可解析视为非免费）；
 * - 排序：`created` 倒序（最新的在最上面），同秒按 id 升序保证稳定；
 * - 网络请求失败自动重试，最多 10 次（指数退避 + 抖动），全部失败抛出最后一次错误。
 */
import type { FreeModel } from './types.ts';
/** OpenRouter 公开 API 基地址。 */
export declare const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
/** 凭据校验端点（GET /key 返回当前 key 的 label/usage/limit）。 */
export declare const OPENROUTER_KEY_URL = "https://openrouter.ai/api/v1/key";
/** 网络请求最大尝试次数（首请求 + 重试共 10 次）。 */
export declare const MAX_ATTEMPTS = 10;
/** OpenRouter 原始模型条目（只声明用到的字段，其余忽略）。 */
interface RawModel {
    id?: unknown;
    canonical_slug?: unknown;
    hugging_face_id?: unknown;
    name?: unknown;
    created?: unknown;
    description?: unknown;
    context_length?: unknown;
    architecture?: {
        modality?: unknown;
        input_modalities?: unknown;
        output_modalities?: unknown;
        tokenizer?: unknown;
    } | null;
    pricing?: Record<string, unknown> | null;
    top_provider?: {
        context_length?: unknown;
        max_completion_tokens?: unknown;
        is_moderated?: unknown;
    } | null;
    supported_parameters?: unknown;
    reasoning?: {
        mandatory?: unknown;
    } | null;
}
/**
 * 判定一个原始条目是否免费：`:free` 后缀，或 prompt/completion 定价同时为 0。
 * @param raw - OpenRouter 原始模型条目。
 * @returns true 表示免费模型。
 */
export declare function isFreeModel(raw: RawModel): boolean;
/**
 * 把一个原始条目规范化为 FreeModel（仅对已通过免费判定的条目调用）。
 * @param raw - OpenRouter 原始模型条目。
 * @returns 规范化的免费模型视图。
 */
export declare function toFreeModel(raw: RawModel): FreeModel;
/**
 * 拉取 OpenRouter 全量模型并筛选免费模型（created 倒序）。
 * 失败自动重试，最多 MAX_ATTEMPTS 次尝试；全部失败抛出最后一次错误。
 * @returns 免费模型列表（最新在最上面）。
 */
export declare function fetchFreeModels(): Promise<FreeModel[]>;
/**
 * 列表排序：created 倒序（最新在最上），同秒按 id 升序保证稳定。
 * 独立导出供离线测试（scripts/test-ops.mts）复用。
 * @param models - 待排序列表（就地排序）。
 * @returns 同一引用，已排序。
 */
export declare function sortModels(models: FreeModel[]): FreeModel[];
/**
 * 校验一个 OpenRouter API Token（GET /key，携带 Bearer）。
 * 401/403 是确定性的无效结果，不重试；网络类错误沿用 MAX_ATTEMPTS 重试。
 * @param token - 用户输入的 API Token（sk-or-v1-…）。
 * @returns 有效时返回 key 的 label/usage/limit 概要；无效时返回原因。
 */
export declare function checkOpenRouterToken(token: string): Promise<{
    valid: true;
    label: string | null;
    usage: number | null;
    limit: number | null;
} | {
    valid: false;
    reason: string;
}>;
export {};
//# sourceMappingURL=openrouter.d.ts.map