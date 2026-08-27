/**
 * dsh-free-model —— 经 DSH 服务创建/更新模型配置（本插件的核心写路径）。
 *
 * 写的两半都走宿主服务，不直接碰文件：
 * - 凭据：`ctx.credentials.set(ref, token)` → 落 $DSH_HOME/.credentials.yaml（只写存储）；
 * - 路由：`ctx.settings.update('llm-pi-ai', patch)` → 合并进 settings.yaml 用户层，
 *   经 llm-pi-ai 自己的 schema/validator 校验后持久化，并即时触发适配器重注册
 *   （设置页与模型选择器通过推送事件自动刷新）。
 *
 * 路由选择：用户可能已手工配置过 OpenRouter（route 名为 openrouter / openrouter-free，
 * 或 baseURL 指向 openrouter.ai）。存在这样的路由时把模型并入该路由（只改 models，
 * 其余字段原样保留）；不存在时新建 `openrouter-free` 路由（openai-completions 协议）。
 * 另可选把新模型设为新会话默认模型（agent-default-model 命名空间，replace 全节写入，
 * 与 AgentDefaultModelConfig.saveSelection 同一写法）。
 */
/** 新建路由时的路由键与展示名。 */
export declare const FALLBACK_ROUTE = "openrouter-free";
export declare const FALLBACK_DISPLAY_NAME = "OpenRouter Free";
/** 约定俗成的 OpenRouter 凭据引用（环境变量名）。 */
export declare const CREDENTIAL_REF = "OPENROUTER_API_KEY";
/** 新建路由使用的线协议与端点。 */
export declare const ROUTE_API = "openai-completions";
/** 宿主 settings 服务的最小视图（本插件用到的成员）。 */
export interface SettingsServiceView {
    /** 合并 patch 到命名空间用户层并持久化（校验失败抛错）。 */
    update(ns: unknown, patch: object): Promise<void>;
    /** 整节替换命名空间用户层（agent-default-model 的官方写法）。 */
    replace(ns: unknown, section: object): Promise<void>;
    /** 读取命名空间当前解析值（schema 应用后；未注册返回 undefined）。 */
    get(ns: unknown): unknown;
    /** 逐命名空间描述符（含原始用户层 section；进程内读取，无需脱敏）。 */
    describe(): Array<{
        ns?: unknown;
        user?: unknown;
    }>;
}
/** 宿主 credentials 服务的最小视图（本插件用到的成员）。 */
export interface CredentialsServiceView {
    /** 存储一个凭据引用的值（.credentials.yaml）。 */
    set(ref: unknown, value: string): Promise<void>;
    /** 描述一个凭据引用的状态（不含明文）。 */
    describe(ref: unknown): Promise<unknown>;
}
/** 写入 settings.yaml 的模型条目（llm-pi-ai modelProfile 的已知名段）。 */
export interface RouteModelProfile {
    id: string;
    name?: string;
    contextWindow?: number;
    maxTokens?: number;
    input?: string[];
    [key: string]: unknown;
}
/** 一个已存在的 OpenRouter 路由快照。 */
export interface OpenRouterRouteView {
    /** 路由键（providers dict 的 key）。 */
    name: string;
    /** 路由当前 models 条目（原始 JSON 形态）。 */
    models: RouteModelProfile[];
    /** 路由声明的凭据引用（环境变量名），可能缺失。 */
    apiKeyEnv?: string;
}
/** 当前 OpenRouter 路由与凭据状态（status op 与 useModel op 共用）。 */
export interface RouteState {
    /** 命中的 OpenRouter 路由；用户尚未配置任何 OpenRouter 路由时为 undefined。 */
    route: OpenRouterRouteView | undefined;
    /** 凭据引用当前是否已有值。 */
    credentialConfigured: boolean;
}
/**
 * 校验一个凭据引用名（对齐 dsh-credentials 的 POSIX 标识符语法）。
 * @param ref - 候选引用名。
 * @returns true 表示语法合法。
 */
export declare function isCredentialRefName(ref: string): boolean;
/**
 * 在解析后的 llm-pi-ai 配置里找到 OpenRouter 路由。
 * 命中优先级：名为 `openrouter` > `openrouter-free` > 其它 `openrouter*` > baseURL
 * 指向 openrouter.ai 的路由。
 * @param providers - llm-pi-ai 解析值里的 providers dict（可为空）。
 * @returns 路由视图；没有命中返回 undefined。
 */
export declare function findOpenRouterRoute(providers: Record<string, unknown> | undefined): OpenRouterRouteView | undefined;
/**
 * 读取当前 OpenRouter 路由与凭据状态。
 * @param settings - 宿主 settings 服务（缺失时返回未配置状态）。
 * @param credentials - 宿主 credentials 服务（缺失时凭据按未配置处理）。
 * @returns 路由与凭据快照。
 */
export declare function readRouteState(settings: SettingsServiceView | undefined, credentials: CredentialsServiceView | undefined): Promise<RouteState>;
/**
 * 把一个 FreeModel 映射为 llm-pi-ai 的模型条目。
 * @param model - 规范化免费模型。
 * @returns settings.yaml 形态的模型条目。
 */
export declare function toRouteModelProfile(model: {
    id: string;
    name: string;
    contextLength: number | null;
    maxCompletionTokens: number | null;
    inputModalities: string[];
}): RouteModelProfile;
/**
 * 创建/更新模型配置：写入凭据（可选）并把模型并入 OpenRouter 路由。
 * @param deps - settings 与 credentials 服务视图。
 * @param model - 目标模型（规范化字段）。
 * @param options - token（提供则落凭据）与 setDefault（设为新会话默认模型）。
 * @returns 写入结果摘要（路由名、是否已存在、模型总数、凭据动作、默认模型）。
 */
export declare function applyModelConfig(deps: {
    settings: SettingsServiceView;
    credentials: CredentialsServiceView;
}, model: {
    id: string;
    name: string;
    contextLength: number | null;
    maxCompletionTokens: number | null;
    inputModalities: string[];
}, options?: {
    token?: string;
    setDefault?: boolean;
}): Promise<{
    routeName: string;
    routeExisted: boolean;
    modelCount: number;
    credentialAction: 'set' | 'kept' | 'missing';
    defaultModelSet: boolean;
}>;
/** 新建路由时的 OpenRouter 端点。 */
export declare const OPENROUTER_ROUTE_BASE_URL = "https://openrouter.ai/api/v1";
//# sourceMappingURL=model-config.d.ts.map