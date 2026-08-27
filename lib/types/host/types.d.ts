/**
 * dsh-free-model —— 宿主/浏览器两侧共享的数据类型（宿主半边视角）。
 *
 * FreeModel 是 OpenRouter 模型条目的规范化视图：保留列表展示需要的完整信息，
 * 价格统一为数字（USD / token）。op 协议是 /dsh-free-model/api 的请求/响应载荷。
 */
/** 一个免费模型（规范化字段，浏览器列表直接渲染）。 */
export interface FreeModel {
    /** OpenRouter 模型 id，如 `deepseek/deepseek-chat-v3.1:free`。 */
    id: string;
    /** OpenRouter 规范 slug（带日期后缀的端点标识），可能缺失。 */
    canonicalSlug: string | null;
    /** 展示名，如 `DeepSeek: DeepSeek Chat v3.1 (free)`。 */
    name: string;
    /** 上架时间（Unix 秒，OpenRouter `created`）；列表按此倒序。 */
    createdAt: number;
    /** 模型描述（英文，可能较长，前端截断展开）。 */
    description: string;
    /** 上下文长度（token）。 */
    contextLength: number | null;
    /** 单次最大输出 token（top_provider.max_completion_tokens）。 */
    maxCompletionTokens: number | null;
    /** 输入模态（text / image / video / …）。 */
    inputModalities: string[];
    /** 输出模态。 */
    outputModalities: string[];
    /** 架构 modality 串，如 `text+image->text`。 */
    modality: string | null;
    /** 分词器名，如 `Qwen`。 */
    tokenizer: string | null;
    /** 价格（USD / token，数字）；免费模型此处均为 0。 */
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
    /** 支持的请求参数名（temperature / tools / reasoning / …）。 */
    supportedParameters: string[];
    /** 是否被上游人工审核（moderated）。 */
    moderated: boolean;
    /** HuggingFace 模型 id，可能缺失。 */
    huggingFaceId: string | null;
    /** 是否以 `:free` 后缀标记免费。 */
    freeSuffix: boolean;
    /** 是否强制推理（reasoning.mandatory）。 */
    reasoningMandatory: boolean;
}
/** 一次 /dsh-free-model/api 请求（platform 缺省为 openrouter；新增平台时扩展）。 */
export type OpRequest = {
    op: 'models';
    platform?: string;
    refresh?: boolean;
    sessionId?: string;
} | {
    op: 'status';
    platform?: string;
    sessionId?: string;
} | {
    op: 'checkToken';
    platform?: string;
    token?: string;
    sessionId?: string;
} | {
    op: 'useModel';
    platform?: string;
    modelId?: string;
    model?: Partial<FreeModel>;
    token?: string;
    setDefault?: boolean;
    sessionId?: string;
};
/** 一次 op 的结果载荷（HTTP 信封 value 字段；命令通道同构）。 */
export interface OpResult {
    ok: boolean;
    code?: string;
    error?: string;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map