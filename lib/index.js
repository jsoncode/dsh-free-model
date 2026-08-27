import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
//#region src/host/fence.ts
/** 规范化后的 URL hostname 是否指向本地回环（localhost / 127.0.0.0/8 / [::1]）。 */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** 规范化一个 Host 头 authority 为 URL，解析失败返回 undefined。 */
function parseAuthority(authority) {
	try {
		return new URL(`http://${authority}`);
	} catch {
		return;
	}
}
/** 规范化 authority 形式：hostname，或带端口的 hostname:port。 */
function canonicalAuthority(entry, entryUrl) {
	const port = entryUrl.port !== "" ? entryUrl.port : new URL(`https://${entry}`).port;
	return port === "" ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
/** 请求 authority 是否匹配 trustedHosts 中的一项（精确或省略端口）。 */
function isTrustedAuthority(hostUrl, trustedHosts) {
	return trustedHosts.some((entry) => {
		const entryUrl = parseAuthority(entry);
		if (entryUrl === void 0) return false;
		return canonicalAuthority(entry, entryUrl) === entryUrl.hostname ? entryUrl.hostname === hostUrl.hostname : entryUrl.host === hostUrl.host;
	});
}
/**
* 判定一次 /dsh-free-model/api 请求是否可放行。
* @param headers - node HTTP 请求头。
* @param trustedHosts - 部署的非回环受信任主机（webRuntime.trustedHosts，可为空）。
* @returns true 表示 Host 是自有（回环或受信任）且浏览器标记为同源。
*/
function isTrustedApiRequest(headers, trustedHosts) {
	const raw = headers.host;
	if (typeof raw !== "string" || raw === "") return false;
	const hostUrl = parseAuthority(raw);
	if (hostUrl === void 0) return false;
	if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false;
	if (headers["sec-fetch-site"] === "cross-site") return false;
	const origin = headers.origin;
	if (typeof origin !== "string" || origin === "") return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/host/openrouter.ts
/** OpenRouter 公开 API 基地址。 */
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
/** 模型目录端点。 */
const MODELS_URL = `${OPENROUTER_BASE_URL}/models`;
/** 凭据校验端点（GET /key 返回当前 key 的 label/usage/limit）。 */
const OPENROUTER_KEY_URL = `${OPENROUTER_BASE_URL}/key`;
/** 单次请求超时（毫秒）。 */
const REQUEST_TIMEOUT_MS = 2e4;
/** 退避基数（毫秒）：第 n 次失败后等待 min(8s, 400 * 2^(n-1)) + 抖动。 */
const BACKOFF_BASE_MS = 400;
const BACKOFF_CAP_MS = 8e3;
/**
* 把 OpenRouter 定价字段（USD/token 字符串或数字）解析为数字。
* @returns 数字；缺失或不可解析返回 null。
*/
function numPrice(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}
/** 安全读取字符串字段；非字符串返回 null。 */
function str(value) {
	return typeof value === "string" && value.length > 0 ? value : null;
}
/** 安全读取非负整数；缺失或非法返回 null。 */
function numInt(value) {
	if (typeof value === "number" && Number.isFinite(value) && value >= 0) return Math.round(value);
	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		if (Number.isFinite(parsed) && parsed >= 0) return Math.round(parsed);
	}
	return null;
}
/** 安全读取字符串数组；缺失返回空数组。 */
function strList(value) {
	return Array.isArray(value) ? value.filter((entry) => typeof entry === "string" && entry.length > 0) : [];
}
/**
* 判定一个原始条目是否免费：`:free` 后缀，或 prompt/completion 定价同时为 0。
* @param raw - OpenRouter 原始模型条目。
* @returns true 表示免费模型。
*/
function isFreeModel(raw) {
	if (typeof raw.id === "string" && raw.id.endsWith(":free")) return true;
	return numPrice(raw.pricing?.prompt) === 0 && numPrice(raw.pricing?.completion) === 0;
}
/**
* 把一个原始条目规范化为 FreeModel（仅对已通过免费判定的条目调用）。
* @param raw - OpenRouter 原始模型条目。
* @returns 规范化的免费模型视图。
*/
function toFreeModel(raw) {
	const pricingRaw = raw.pricing ?? {};
	const id = str(raw.id) ?? "";
	return {
		id,
		canonicalSlug: str(raw.canonical_slug),
		name: str(raw.name) ?? id,
		createdAt: numInt(raw.created) ?? 0,
		description: typeof raw.description === "string" ? raw.description : "",
		contextLength: numInt(raw.context_length),
		maxCompletionTokens: numInt(raw.top_provider?.max_completion_tokens),
		inputModalities: strList(raw.architecture?.input_modalities),
		outputModalities: strList(raw.architecture?.output_modalities),
		modality: str(raw.architecture?.modality),
		tokenizer: str(raw.architecture?.tokenizer),
		pricing: {
			prompt: numPrice(pricingRaw.prompt) ?? 0,
			completion: numPrice(pricingRaw.completion) ?? 0,
			request: numPrice(pricingRaw.request),
			image: numPrice(pricingRaw.image),
			webSearch: numPrice(pricingRaw.web_search),
			internalReasoning: numPrice(pricingRaw.internal_reasoning),
			inputCacheRead: numPrice(pricingRaw.input_cache_read),
			inputCacheWrite: numPrice(pricingRaw.input_cache_write)
		},
		supportedParameters: strList(raw.supported_parameters),
		moderated: raw.top_provider?.is_moderated === true,
		huggingFaceId: str(raw.hugging_face_id),
		freeSuffix: id.endsWith(":free"),
		reasoningMandatory: raw.reasoning?.mandatory === true
	};
}
/**
* 拉取 OpenRouter 全量模型并筛选免费模型（created 倒序）。
* 失败自动重试，最多 MAX_ATTEMPTS 次尝试；全部失败抛出最后一次错误。
* @returns 免费模型列表（最新在最上面）。
*/
async function fetchFreeModels() {
	let lastError = /* @__PURE__ */ new Error("openrouter request failed");
	for (let attempt = 1; attempt <= 10; attempt++) try {
		return await fetchOnce();
	} catch (error) {
		lastError = error;
		if (attempt < 10) {
			const backoff = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1));
			const jitter = Math.floor(Math.random() * 250);
			await new Promise((resolve) => {
				setTimeout(resolve, backoff + jitter);
			});
		}
	}
	throw lastError;
}
/**
* 列表排序：created 倒序（最新在最上），同秒按 id 升序保证稳定。
* 独立导出供离线测试（scripts/test-ops.mts）复用。
* @param models - 待排序列表（就地排序）。
* @returns 同一引用，已排序。
*/
function sortModels(models) {
	return models.sort((left, right) => right.createdAt - left.createdAt || left.id.localeCompare(right.id));
}
/** 单次拉取 + 筛选 + 排序。 */
async function fetchOnce() {
	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort();
	}, REQUEST_TIMEOUT_MS);
	let response;
	try {
		response = await fetch(MODELS_URL, {
			method: "GET",
			headers: { accept: "application/json" },
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
	if (!response.ok) throw new Error(`openrouter /models responded HTTP ${String(response.status)}`);
	const parsed = await response.json();
	return sortModels((Array.isArray(parsed.data) ? parsed.data : []).filter((raw) => raw !== null && typeof raw === "object" && typeof raw.id === "string" && isFreeModel(raw)).map((raw) => toFreeModel(raw)));
}
/**
* 校验一个 OpenRouter API Token（GET /key，携带 Bearer）。
* 401/403 是确定性的无效结果，不重试；网络类错误沿用 MAX_ATTEMPTS 重试。
* @param token - 用户输入的 API Token（sk-or-v1-…）。
* @returns 有效时返回 key 的 label/usage/limit 概要；无效时返回原因。
*/
async function checkOpenRouterToken(token) {
	let lastError = /* @__PURE__ */ new Error("openrouter request failed");
	for (let attempt = 1; attempt <= 10; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			controller.abort();
		}, REQUEST_TIMEOUT_MS);
		try {
			const response = await fetch(OPENROUTER_KEY_URL, {
				method: "GET",
				headers: {
					accept: "application/json",
					authorization: `Bearer ${token}`
				},
				signal: controller.signal
			});
			if (response.status === 401 || response.status === 403) return {
				valid: false,
				reason: `HTTP ${String(response.status)}`
			};
			if (!response.ok) throw new Error(`openrouter /key responded HTTP ${String(response.status)}`);
			const data = (await response.json()).data ?? {};
			return {
				valid: true,
				label: str(data.label),
				usage: numPrice(data.usage),
				limit: numPrice(data.limit)
			};
		} catch (error) {
			lastError = error;
			if (attempt < 10) {
				const backoff = Math.min(BACKOFF_CAP_MS, BACKOFF_BASE_MS * 2 ** (attempt - 1));
				const jitter = Math.floor(Math.random() * 250);
				await new Promise((resolve) => {
					setTimeout(resolve, backoff + jitter);
				});
			}
		} finally {
			clearTimeout(timer);
		}
	}
	throw lastError;
}
//#endregion
//#region src/host/model-config.ts
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
/** llm-pi-ai 插件的 settings 命名空间（provider 路由的持久化位置）。 */
const LLM_NS = settingsNamespace("llm-pi-ai");
/** 新会话默认模型命名空间（可选写）。 */
const DEFAULT_MODEL_NS = settingsNamespace("agent-default-model");
const FALLBACK_DISPLAY_NAME = "OpenRouter Free";
/** 约定俗成的 OpenRouter 凭据引用（环境变量名）。 */
const CREDENTIAL_REF = "OPENROUTER_API_KEY";
/** 新建路由使用的线协议与端点。 */
const ROUTE_API = "openai-completions";
/** POSIX 环境变量名（credentials 引用）的语法校验，语义对齐 dsh-credentials。 */
const REF_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
/**
* 校验一个凭据引用名（对齐 dsh-credentials 的 POSIX 标识符语法）。
* @param ref - 候选引用名。
* @returns true 表示语法合法。
*/
function isCredentialRefName(ref) {
	return REF_PATTERN.test(ref);
}
/**
* 在解析后的 llm-pi-ai 配置里找到 OpenRouter 路由。
* 命中优先级：名为 `openrouter` > `openrouter-free` > 其它 `openrouter*` > baseURL
* 指向 openrouter.ai 的路由。
* @param providers - llm-pi-ai 解析值里的 providers dict（可为空）。
* @returns 路由视图；没有命中返回 undefined。
*/
function findOpenRouterRoute(providers) {
	if (providers === void 0 || typeof providers !== "object") return void 0;
	const entries = Object.entries(providers).filter(([, profile]) => profile !== null && typeof profile === "object").map(([name, profile]) => {
		const record = profile;
		return {
			name,
			models: Array.isArray(record.models) ? record.models.filter((entry) => entry !== null && typeof entry === "object" && typeof entry.id === "string").map((entry) => entry) : [],
			apiKeyEnv: typeof record.apiKeyEnv === "string" && record.apiKeyEnv.length > 0 ? record.apiKeyEnv : void 0,
			baseURL: typeof record.baseURL === "string" ? record.baseURL : ""
		};
	});
	const byName = (name) => entries.find((entry) => entry.name === name);
	return byName("openrouter") ?? byName("openrouter-free") ?? entries.find((entry) => /^openrouter-/.test(entry.name)) ?? entries.find((entry) => entry.baseURL.includes("openrouter.ai"));
}
/**
* 从 settings 描述符里读 llm-pi-ai 命名空间「原始用户层」的某路由 models。
* 合并进已有路由时优先用它：数组整体替换是 settings 合并的语义，携带原始条目
* 才不会把 schema 解析出的默认值噪声（`input: []` 等）写回用户文件。
* @param settings - 宿主 settings 服务。
* @param routeName - 路由键。
* @returns 原始用户层 models；路由不在用户层（仅组合层声明）或读取失败返回 undefined。
*/
function rawUserModels(settings, routeName) {
	try {
		const models = (settings.describe().find((entry) => String(entry?.ns) === "llm-pi-ai")?.user)?.providers?.[routeName]?.models;
		if (!Array.isArray(models)) return void 0;
		return models.filter((entry) => entry !== null && typeof entry === "object" && typeof entry.id === "string").map((entry) => entry);
	} catch {
		return;
	}
}
/**
* 读取当前 OpenRouter 路由与凭据状态。
* @param settings - 宿主 settings 服务（缺失时返回未配置状态）。
* @param credentials - 宿主 credentials 服务（缺失时凭据按未配置处理）。
* @returns 路由与凭据快照。
*/
async function readRouteState(settings, credentials) {
	const resolved = settings?.get(LLM_NS);
	const route = findOpenRouterRoute(resolved?.providers);
	if (route !== void 0 && settings !== void 0) {
		const raw = rawUserModels(settings, route.name);
		if (raw !== void 0) route.models = raw;
	}
	let credentialConfigured = false;
	if (credentials !== void 0) try {
		credentialConfigured = (await credentials.describe(CREDENTIAL_REF))?.configured === true;
	} catch {
		credentialConfigured = false;
	}
	return {
		route,
		credentialConfigured
	};
}
/**
* 把一个 FreeModel 映射为 llm-pi-ai 的模型条目。
* @param model - 规范化免费模型。
* @returns settings.yaml 形态的模型条目。
*/
function toRouteModelProfile(model) {
	const entry = {
		id: model.id,
		name: model.name || model.id
	};
	if (model.contextLength !== null && model.contextLength > 0) entry.contextWindow = Math.round(model.contextLength);
	if (model.maxCompletionTokens !== null && model.maxCompletionTokens > 0) entry.maxTokens = Math.round(model.maxCompletionTokens);
	entry.input = model.inputModalities.includes("image") ? ["text", "image"] : ["text"];
	return entry;
}
/**
* 创建/更新模型配置：写入凭据（可选）并把模型并入 OpenRouter 路由。
* @param deps - settings 与 credentials 服务视图。
* @param model - 目标模型（规范化字段）。
* @param options - token（提供则落凭据）与 setDefault（设为新会话默认模型）。
* @returns 写入结果摘要（路由名、是否已存在、模型总数、凭据动作、默认模型）。
*/
async function applyModelConfig(deps, model, options = {}) {
	const token = typeof options.token === "string" ? options.token.trim() : "";
	const before = await readRouteState(deps.settings, deps.credentials);
	const routeExisted = before.route !== void 0;
	let credentialAction = "kept";
	if (token.length > 0) {
		const targetRef = before.route?.apiKeyEnv !== void 0 && isCredentialRefName(before.route.apiKeyEnv) ? before.route.apiKeyEnv : CREDENTIAL_REF;
		await deps.credentials.set(targetRef, token);
		credentialAction = "set";
	}
	const routeName = before.route?.name ?? "openrouter-free";
	const existing = before.route?.models ?? [];
	const entry = toRouteModelProfile(model);
	const nextModels = [...existing.filter((item) => item.id !== model.id), entry];
	const routePatch = { models: nextModels };
	if (!routeExisted) {
		routePatch.displayName = FALLBACK_DISPLAY_NAME;
		routePatch.api = ROUTE_API;
		routePatch.baseURL = OPENROUTER_ROUTE_BASE_URL;
		routePatch.apiKeyEnv = CREDENTIAL_REF;
	} else if (before.route?.apiKeyEnv === void 0) routePatch.apiKeyEnv = CREDENTIAL_REF;
	await deps.settings.update(LLM_NS, { providers: { [routeName]: routePatch } });
	let defaultModelSet = false;
	if (options.setDefault === true) {
		await deps.settings.replace(DEFAULT_MODEL_NS, {
			provider: routeName,
			model: model.id
		});
		defaultModelSet = true;
	}
	return {
		routeName,
		routeExisted,
		modelCount: nextModels.length,
		credentialAction,
		defaultModelSet
	};
}
/** 新建路由时的 OpenRouter 端点。 */
const OPENROUTER_ROUTE_BASE_URL = "https://openrouter.ai/api/v1";
/** 数据文件名。 */
const STORE_FILE = "dsh-free-model.json";
let cachedDir = null;
/**
* 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
* 结果进程内缓存（宿主运行期目录不会变化）。
* @param settingsDocPath - settings 服务的用户文档绝对路径（可为空）。
* @returns 数据目录绝对路径。
*/
function resolveStoreDir(settingsDocPath) {
	if (cachedDir !== null) return cachedDir;
	if (settingsDocPath && settingsDocPath.trim().length > 0) {
		cachedDir = dirname(settingsDocPath);
		return cachedDir;
	}
	const env = process.env.DSH_HOME;
	cachedDir = env && env.trim().length > 0 ? env.trim() : join(homedir(), ".dsh");
	return cachedDir;
}
/**
* 读取数据文件。
* @param dir - 数据目录。
* @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
*/
async function loadStore(dir) {
	const target = join(dir, STORE_FILE);
	let raw;
	try {
		raw = await readFile(target, "utf8");
	} catch (error) {
		const err = error;
		if (err && err.code === "ENOENT") return null;
		console.warn(`[dsh-free-model] cannot read store file: ${target}`, error instanceof Error ? error.message : String(error));
		return null;
	}
	try {
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.models)) return null;
		return {
			version: 1,
			models: parsed.models.filter((entry) => entry !== null && typeof entry === "object" && typeof entry.id === "string"),
			fetchedAt: typeof parsed.fetchedAt === "number" && Number.isFinite(parsed.fetchedAt) ? parsed.fetchedAt : 0
		};
	} catch (error) {
		try {
			await rename(target, target + ".bak");
		} catch {}
		console.warn(`[dsh-free-model] store file corrupt, backed up to .bak: ${target}`, error instanceof Error ? error.message : String(error));
		return null;
	}
}
let writeChain = Promise.resolve();
function doSave(dir, store) {
	return (async () => {
		await mkdir(dir, { recursive: true });
		const payload = JSON.stringify({
			version: 1,
			models: store.models,
			fetchedAt: store.fetchedAt
		});
		const tmp = join(dir, STORE_FILE + ".tmp");
		const target = join(dir, STORE_FILE);
		await writeFile(tmp, payload, { encoding: "utf8" });
		await rename(tmp, target);
	})();
}
/**
* 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。
* @param dir - 数据目录。
* @param store - 要写入的完整 store。
* @returns 写入完成后兑现。
*/
function saveStore(dir, store) {
	const next = writeChain.then(() => doSave(dir, store));
	writeChain = next.catch(() => {});
	return next;
}
//#endregion
//#region src/host/ops.ts
/**
* dsh-free-model —— /dsh-free-model/api 的 op 分发（浏览器半边的全部宿主能力）。
*
* - models：免费模型列表（缓存 6 小时；refresh 强制拉取；网络 10 次重试全败时
*   降级返回旧缓存并标记 stale）；
* - status：当前 OpenRouter 路由与凭据状态（列表「已添加」徽标与弹框提示用）；
* - checkToken：校验用户输入的 OpenRouter Token（GET /key）；
* - useModel：创建模型配置（凭据可选 + 路由并入/新建 + 可选默认模型）。
*/
/** 缓存新鲜窗口：窗口内不回源（设置页每次打开都秒出列表）。 */
const FRESH_MS = 216e5;
/**
* 从缓存里按 id 找模型；找不到且调用方带了内联快照时退回快照。
* @param cached - 缓存的模型列表。
* @param modelId - 目标模型 id。
* @param inline - 调用方自带的模型快照（列表页渲染时的数据）。
* @returns 命中的模型；都没有返回 undefined。
*/
function resolveTargetModel(cached, modelId, inline) {
	const hit = cached.find((entry) => entry.id === modelId);
	if (hit !== void 0) return hit;
	if (inline !== void 0 && typeof inline.id === "string" && inline.id.length > 0) return {
		id: inline.id,
		canonicalSlug: inline.canonicalSlug ?? null,
		name: inline.name ?? inline.id,
		createdAt: inline.createdAt ?? 0,
		description: inline.description ?? "",
		contextLength: inline.contextLength ?? null,
		maxCompletionTokens: inline.maxCompletionTokens ?? null,
		inputModalities: Array.isArray(inline.inputModalities) ? inline.inputModalities : ["text"],
		outputModalities: Array.isArray(inline.outputModalities) ? inline.outputModalities : [],
		modality: inline.modality ?? null,
		tokenizer: inline.tokenizer ?? null,
		pricing: inline.pricing ?? {
			prompt: 0,
			completion: 0,
			request: null,
			image: null,
			webSearch: null,
			internalReasoning: null,
			inputCacheRead: null,
			inputCacheWrite: null
		},
		supportedParameters: Array.isArray(inline.supportedParameters) ? inline.supportedParameters : [],
		moderated: inline.moderated === true,
		huggingFaceId: inline.huggingFaceId ?? null,
		freeSuffix: inline.freeSuffix === true,
		reasoningMandatory: inline.reasoningMandatory === true
	};
}
/**
* 分发一次 op 请求。
* @param deps - op 依赖（服务视图 + 数据目录）。
* @param request - 解析后的请求。
* @returns 结果载荷（恒为 { ok, ... } 形态；异常已就地折叠）。
*/
async function runOp(deps, request) {
	const platform = typeof request.platform === "string" && request.platform.length > 0 ? request.platform : "openrouter";
	if (platform !== "openrouter") return {
		ok: false,
		code: "unknown-platform",
		error: `unknown platform: ${platform}`
	};
	try {
		switch (request.op) {
			case "models": return await runModels(deps, request.refresh === true);
			case "status": return await runStatus(deps);
			case "checkToken": return await runCheckToken(deps, typeof request.token === "string" ? request.token.trim() : "");
			case "useModel": return await runUseModel(deps, request);
			default: return {
				ok: false,
				code: "unknown-op",
				error: `unknown op: ${JSON.stringify(request.op)}`
			};
		}
	} catch (error) {
		return {
			ok: false,
			code: "internal",
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
/** models op：缓存优先，miss/refresh 回源（10 次重试），全败降级旧缓存。 */
async function runModels(deps, refresh) {
	const cached = await loadStore(deps.storeDir);
	if (!refresh && cached !== null && cached.models.length > 0 && Date.now() - cached.fetchedAt < FRESH_MS) return {
		ok: true,
		models: cached.models,
		fetchedAt: cached.fetchedAt,
		source: "cache"
	};
	try {
		const models = await fetchFreeModels();
		const fetchedAt = Date.now();
		await saveStore(deps.storeDir, {
			version: 1,
			models,
			fetchedAt
		});
		return {
			ok: true,
			models,
			fetchedAt,
			source: "network"
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (cached !== null && cached.models.length > 0) return {
			ok: true,
			models: cached.models,
			fetchedAt: cached.fetchedAt,
			source: "cache",
			stale: true,
			error: message
		};
		return {
			ok: false,
			code: "fetch-failed",
			error: message
		};
	}
}
/** status op：OpenRouter 路由 + 凭据状态。 */
async function runStatus(deps) {
	if (deps.settings === void 0) return {
		ok: false,
		code: "settings-missing",
		error: "settings service unavailable"
	};
	const state = await readRouteState(deps.settings, deps.credentials);
	return {
		ok: true,
		route: state.route === void 0 ? null : {
			name: state.route.name,
			modelCount: state.route.models.length,
			modelIds: state.route.models.map((entry) => entry.id),
			apiKeyEnv: state.route.apiKeyEnv ?? null
		},
		credentialConfigured: state.credentialConfigured
	};
}
/** checkToken op：GET /key 校验（401/403 不重试，网络错误 10 次重试）。 */
async function runCheckToken(deps, token) {
	if (token.length === 0) return {
		ok: false,
		code: "token-required",
		error: "token is required"
	};
	try {
		const result = await checkOpenRouterToken(token);
		if (result.valid) return {
			ok: true,
			valid: true,
			label: result.label,
			usage: result.usage,
			limit: result.limit
		};
		return {
			ok: true,
			valid: false,
			code: "auth-failed",
			error: result.reason
		};
	} catch (error) {
		return {
			ok: false,
			code: "network-failed",
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
/** useModel op：创建模型配置（凭据 + 路由 + 可选默认模型）。 */
async function runUseModel(deps, request) {
	if (deps.settings === void 0) return {
		ok: false,
		code: "settings-missing",
		error: "settings service unavailable"
	};
	if (deps.credentials === void 0) return {
		ok: false,
		code: "credentials-missing",
		error: "credentials service unavailable"
	};
	const modelId = typeof request.modelId === "string" ? request.modelId.trim() : "";
	if (modelId.length === 0) return {
		ok: false,
		code: "model-missing",
		error: "modelId is required"
	};
	const model = resolveTargetModel((await loadStore(deps.storeDir))?.models ?? [], modelId, request.model);
	if (model === void 0) return {
		ok: false,
		code: "model-not-found",
		error: `model "${modelId}" is not in the cached free-model list; refresh the list and retry`
	};
	try {
		const result = await applyModelConfig({
			settings: deps.settings,
			credentials: deps.credentials
		}, model, {
			token: request.token,
			setDefault: request.setDefault === true
		});
		return {
			ok: true,
			modelId: model.id,
			modelName: model.name,
			routeName: result.routeName,
			routeExisted: result.routeExisted,
			modelCount: result.modelCount,
			credentialAction: result.credentialAction,
			defaultModelSet: result.defaultModelSet
		};
	} catch (error) {
		return {
			ok: false,
			code: "settings-rejected",
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
//#endregion
//#region src/host/index.ts
const name = "dsh-free-model";
/**
* 必需服务：settings（路由写入）与 credentials（Token 存储）。
* webServer / webRuntime 为可选依赖，用 ctx.get 读取（headless 等组合缺失时
* 仅跳过路由注册并告警，不影响插件其余部分）。
*/
const inject = ["settings", "credentials"];
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}
/** 宿主插件入口：解析数据目录并注册浏览器 HTTP API。 */
function apply(ctx) {
	const settings = ctx.get("settings");
	const credentials = ctx.get("credentials");
	const deps = {
		storeDir: resolveStoreDir(settings?.documentPath),
		settings,
		credentials
	};
	const webServer = ctx.get("webServer");
	const webRuntime = ctx.get("webRuntime");
	if (webServer === void 0) {
		console.warn("[dsh-free-model] webServer service unavailable; the settings tab will not reach the host half");
		return;
	}
	const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
	try {
		webServer.register({
			kind: "exact",
			path: "/dsh-free-model/api",
			handler: async (req, res) => {
				if (!fence(req.headers)) {
					writeApiJson(res, 403, {
						ok: false,
						error: {
							code: "forbidden",
							message: "forbidden"
						}
					});
					return;
				}
				if (req.method !== "POST") {
					writeApiJson(res, 405, {
						ok: false,
						error: {
							code: "method-error",
							message: "method not allowed"
						}
					});
					return;
				}
				const chunks = [];
				let total = 0;
				for await (const chunk of req) {
					const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
					total += buffer.length;
					if (total > API_BODY_LIMIT) {
						writeApiJson(res, 413, {
							ok: false,
							error: {
								code: "body-too-large",
								message: "request body too large"
							}
						});
						return;
					}
					chunks.push(buffer);
				}
				const text = Buffer.concat(chunks).toString("utf8");
				let request = { op: "models" };
				if (text.trim().length > 0) try {
					request = JSON.parse(text);
				} catch {
					writeApiJson(res, 400, {
						ok: false,
						error: {
							code: "params-invalid",
							message: "Parameters must be JSON"
						}
					});
					return;
				}
				try {
					writeApiJson(res, 200, {
						ok: true,
						value: await runOp(deps, request)
					});
				} catch (error) {
					writeApiJson(res, 200, {
						ok: true,
						value: {
							ok: false,
							code: "internal",
							error: error instanceof Error ? error.message : String(error)
						}
					});
				}
			}
		});
	} catch (error) {
		console.warn("[dsh-free-model] api route registration skipped:", error instanceof Error ? error.message : String(error));
	}
}
//#endregion
export { apply, inject, name };
