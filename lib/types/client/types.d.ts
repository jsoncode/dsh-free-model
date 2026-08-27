/**
 * dsh-free-model —— 浏览器半边：与宿主 op 载荷对应的类型视图。
 * 结构与宿主 src/host/types.ts 的 FreeModel 对齐（浏览器半边独立声明，
 * 两侧通过 HTTP JSON 边界交互）。
 */
/** 一个免费模型（规范化字段，列表直接渲染）。 */
export interface FreeModel {
    id: string;
    canonicalSlug: string | null;
    name: string;
    /** 上架时间（Unix 秒）；列表由宿主按此倒序。 */
    createdAt: number;
    description: string;
    contextLength: number | null;
    maxCompletionTokens: number | null;
    inputModalities: string[];
    outputModalities: string[];
    modality: string | null;
    tokenizer: string | null;
    pricing: {
        prompt: number;
        completion: number;
        request: number | null;
        image: number | null;
        webSearch: number | null;
        internalReasoning: number | null;
        inputCacheRead: number | null;
        inputCacheWrite: number | null;
    };
    supportedParameters: string[];
    moderated: boolean;
    huggingFaceId: string | null;
    freeSuffix: boolean;
    reasoningMandatory: boolean;
}
/** status op 返回的路由快照。 */
export interface RouteStatus {
    ok: boolean;
    route: {
        name: string;
        modelCount: number;
        modelIds: string[];
        apiKeyEnv: string | null;
    } | null;
    credentialConfigured?: boolean;
    code?: string;
    error?: string;
}
/** useModel op 的结果载荷。 */
export interface UseModelResult {
    ok: boolean;
    modelId?: string;
    modelName?: string;
    routeName?: string;
    routeExisted?: boolean;
    modelCount?: number;
    credentialAction?: 'set' | 'kept' | 'missing';
    defaultModelSet?: boolean;
    code?: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map