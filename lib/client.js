window.__ModuleLoader__.load({ id: 'dsh-free-model', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_dom = require("react-dom");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/client/styles.ts
/**
* dsh-free-model —— 浏览器半边：样式注入（与 dsh-jenkins 相同的 bundle CSS 注入模式）。
* 只消费宿主 --dsw-* 语义令牌（带回退值），不写死颜色。
*/
const CSS_ID = "dsh-free-model/settings.css";
const css = [
	".dsfm-btn{border:1px solid var(--dsw-alias-border-l2,#ccc);background:transparent;color:var(--dsw-alias-label-primary,#222);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer;font-family:inherit}",
	".dsfm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dsfm-btn:disabled{opacity:.5;cursor:not-allowed}",
	".dsfm-btn-primary{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 88%,transparent);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}",
	".dsfm-btn-primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary,#1668e3)}",
	".dsfm-btn-small{padding:3px 10px;font-size:12px}",
	".dsfm-input{width:100%;box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 86%,transparent);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s}",
	".dsfm-input:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dsfm-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dsfm-input::placeholder{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dsfm-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0;word-break:break-word}",
	".dsfm-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}",
	".dsfm-warn{color:var(--dsw-alias-state-warn-primary,#b8860b);font-size:12px;word-break:break-word}",
	".dsfm-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}",
	".dsfm-spin{display:inline-block;width:12px;height:12px;border:2px solid color-mix(in srgb,var(--dsw-alias-label-secondary,#888) 35%,transparent);border-top-color:var(--dsw-alias-label-secondary,#888);border-radius:50%;animation:dsfm-rotate .8s linear infinite;vertical-align:-2px;margin-right:6px}",
	"@keyframes dsfm-rotate{to{transform:rotate(360deg)}}",
	".dsfm-section{display:flex;flex-direction:column;gap:12px}",
	".dsfm-head{display:flex;flex-direction:column;gap:2px}",
	".dsfm-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary,#222)}",
	".dsfm-subtitle{font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dsfm-toolbar{display:flex;align-items:center;gap:8px}",
	".dsfm-toolbar .dsfm-input{flex:1;min-width:0}",
	".dsfm-count{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dsfm-stale{font-size:12px}",
	".dsfm-list{display:flex;flex-direction:column;gap:10px;max-height:min(56vh,640px);overflow-y:auto;padding:2px;margin:-2px}",
	".dsfm-tabs{display:flex;gap:6px;flex-wrap:wrap}",
	".dsfm-tab{border:1px solid var(--dsw-alias-border-l2,#ccc);background:transparent;color:var(--dsw-alias-label-secondary,#888);border-radius:999px;padding:4px 16px;font-size:13px;cursor:pointer;font-family:inherit}",
	".dsfm-tab:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8);color:var(--dsw-alias-label-primary,#222)}",
	".dsfm-tab-active{border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 10%,transparent)}",
	".dsfm-card{border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:10px;padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 60%,transparent)}",
	".dsfm-card:hover{border-color:var(--dsw-alias-border-l3,#bbb)}",
	".dsfm-card-top{display:flex;align-items:flex-start;gap:10px}",
	".dsfm-card-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}",
	".dsfm-name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
	".dsfm-name{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#222)}",
	".dsfm-id{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-label-secondary,#888);cursor:pointer;word-break:break-all;background:none;border:none;padding:0;text-align:left;font-weight:400}",
	".dsfm-id:hover{color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dsfm-badge{display:inline-flex;align-items:center;font-size:11px;line-height:16px;padding:0 8px;border-radius:999px;white-space:nowrap}",
	".dsfm-badge-free{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 14%,transparent);color:var(--dsw-alias-state-success-primary,#2a7d3c)}",
	".dsfm-badge-muted{background:color-mix(in srgb,var(--dsw-alias-label-secondary,#888) 14%,transparent);color:var(--dsw-alias-label-secondary,#888)}",
	".dsfm-badge-brand{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 14%,transparent);color:var(--dsw-alias-brand-primary,#1668e3)}",
	".dsfm-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dsfm-meta b{font-weight:500;color:var(--dsw-alias-label-primary,#222)}",
	".dsfm-desc{font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary,#888);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}",
	".dsfm-desc-open{display:block;-webkit-line-clamp:unset;overflow:visible}",
	".dsfm-toggle{border:none;background:none;color:var(--dsw-alias-brand-primary,#1668e3);font-size:12px;cursor:pointer;padding:0;font-family:inherit}",
	".dsfm-toggle:hover{text-decoration:underline}",
	".dsfm-details{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l2,#ddd)}",
	".dsfm-details>dt{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dsfm-details>dd{font-size:12px;color:var(--dsw-alias-label-primary,#222);margin:0;word-break:break-word}",
	".dsfm-chips{display:flex;flex-wrap:wrap;gap:4px}",
	".dsfm-chip{font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:6px;padding:0 6px;color:var(--dsw-alias-label-secondary,#888)}",
	".dsfm-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}",
	".dsfm-modal{background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,.25);box-sizing:border-box;max-height:86vh;overflow-y:auto}",
	".dsfm-use-modal{width:min(560px,94vw);padding:18px 20px;display:flex;flex-direction:column;gap:12px}",
	".dsfm-modal-title{font-size:15px;font-weight:600}",
	".dsfm-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dsfm-field{display:flex;flex-direction:column;gap:4px}",
	".dsfm-field>label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666)}",
	".dsfm-token-row{display:flex;gap:8px;align-items:center}",
	".dsfm-token-row .dsfm-input{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}",
	".dsfm-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);line-height:1.5;word-break:break-word}",
	".dsfm-token-note{color:var(--dsw-alias-state-success-primary,#2a7d3c)}",
	".dsfm-modal-ops{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}",
	".dsfm-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-primary,#222);cursor:pointer;user-select:none}",
	".dsfm-check input[type=checkbox]{width:15px;height:15px;margin:0;accent-color:var(--dsw-alias-brand-primary,#1668e3);cursor:pointer}",
	".dsfm-summary{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 5%,transparent)}",
	".dsfm-summary>dt{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}",
	".dsfm-summary>dd{font-size:12px;color:var(--dsw-alias-label-primary,#222);margin:0;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}",
	".dsfm-success{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:4px 0}",
	".dsfm-success-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--dsw-alias-state-success-primary,#2a7d3c)}",
	".dsfm-success-icon{width:20px;height:20px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#2a7d3c);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;flex:none}",
	"@media (max-width: 640px){",
	"  .dsfm-list{max-height:none;overflow:visible}",
	"  .dsfm-toolbar{flex-wrap:wrap}",
	"  .dsfm-toolbar .dsfm-input{flex:1 1 100%;min-width:0}",
	"  .dsfm-count{white-space:normal}",
	"  .dsfm-tabs{gap:5px}",
	"  .dsfm-tab{padding:3px 12px;font-size:12px}",
	"  .dsfm-card{padding:9px 10px;border-radius:8px}",
	"  .dsfm-card-top{flex-direction:column;align-items:stretch;gap:8px}",
	"  .dsfm-card-top .dsfm-btn-primary{width:100%;padding:8px 14px;font-size:13px}",
	"  .dsfm-name-row{gap:6px}",
	"  .dsfm-details{grid-template-columns:minmax(0,1fr);gap:2px 0}",
	"  .dsfm-details>dt{margin-top:6px;white-space:normal}",
	"  .dsfm-summary{grid-template-columns:minmax(0,1fr);gap:2px 0;padding:8px 10px}",
	"  .dsfm-summary>dt{white-space:normal;margin-top:5px}",
	"  .dsfm-token-row{flex-wrap:wrap}",
	"  .dsfm-token-row .dsfm-input{flex:1 1 100%}",
	"  .dsfm-token-row .dsfm-btn{flex:1 1 auto}",
	"  .dsfm-use-modal{width:100vw;max-width:100vw;min-height:100%;border-radius:0;max-height:100vh;overflow-y:auto;padding:14px 14px 18px}",
	"  .dsfm-backdrop{align-items:stretch;padding:0}",
	"  .dsfm-modal-ops{position:sticky;bottom:0;background:var(--dsw-alias-bg-base,#fff);padding:10px 0 2px}",
	"  .dsfm-modal-ops .dsfm-btn{flex:1}",
	"  .dsfm-check{font-size:12px;line-height:1.4;align-items:flex-start}",
	"}",
	"@media (min-width: 641px) and (max-width: 860px){",
	"  .dsfm-card{padding:9px 11px}",
	"  .dsfm-toolbar .dsfm-count{display:none}",
	"}"
];
/** 注入样式表（幂等；bundle 可能被宿主重新加载）。 */
function injectStyles() {
	if (typeof document === "undefined") return;
	if (document.getElementById(CSS_ID) !== null) return;
	const style = document.createElement("style");
	style.id = CSS_ID;
	style.textContent = css.join("\n");
	document.head.appendChild(style);
}
//#endregion
//#region src/client/rpc.ts
/** 请求超时（毫秒）：宿主侧拉取 OpenRouter 自带 10 次重试，这里给足余量。 */
const REQUEST_TIMEOUT_MS = 15e4;
/**
* 构造与宿主的 RPC 函数。
* @returns run(op) → 宿主 op 结果（恒为 { ok, ... } 形态）。
*/
function makeRun() {
	return async (op) => {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			controller.abort();
		}, REQUEST_TIMEOUT_MS);
		try {
			const response = await fetch("/dsh-free-model/api", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(op),
				signal: controller.signal
			});
			if (!response.ok) return {
				ok: false,
				code: "route-unreachable",
				error: `HTTP ${String(response.status)}`
			};
			const parsed = await response.json().catch(() => null);
			if (parsed === null || parsed.ok !== true || parsed.value === void 0) {
				const message = parsed?.error?.message;
				return {
					ok: false,
					code: parsed?.error?.code ?? "route-unreachable",
					error: message ?? "bad envelope"
				};
			}
			const value = parsed.value;
			return value !== null && typeof value === "object" ? value : {
				ok: false,
				error: String(value)
			};
		} catch (error) {
			return {
				ok: false,
				code: "route-unreachable",
				error: error instanceof Error ? error.message : String(error)
			};
		} finally {
			clearTimeout(timer);
		}
	};
}
//#endregion
//#region src/client/i18n.ts
/**
* dsh-free-model —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
*/
function resolveLang() {
	if (typeof document !== "undefined") {
		const host = document.documentElement.lang || navigator.language || "zh-CN";
		return /^zh/i.test(host) ? "zh" : "en";
	}
	return "zh";
}
const LANG = resolveLang();
const COPY = {
	zh: {
		nav: "免费模型",
		title: "免费模型",
		platformOpenrouter: "OpenRouter",
		subtitle: "OpenRouter · 按上架时间倒序 · 仅收录价格为 0 或带 :free 标记的模型",
		searchPlaceholder: "搜索模型（id / 名称 / 描述 / 厂商）",
		refresh: "刷新",
		refreshing: "刷新中…",
		loading: "加载中…",
		countLine: "共 {total} 个免费模型 · 匹配 {n}",
		noMatch: "没有匹配的模型",
		empty: "暂无免费模型数据",
		loadFailed: "加载失败",
		staleHint: "OpenRouter 拉取失败，展示 {time} 的缓存：{error}",
		cachedAt: "缓存于 {time}",
		addToList: "添加",
		added: "已添加",
		freeBadge: "免费",
		contextLabel: "上下文",
		maxOutLabel: "最大输出",
		inputLabel: "输入",
		outputLabel: "输出",
		tokenizerLabel: "分词器",
		paramsLabel: "支持参数",
		pricingLabel: "价格（每 token）",
		promptLabel: "提示",
		completionLabel: "补全",
		moderatedLabel: "内容审核",
		forcedReasoningLabel: "强制推理",
		slugLabel: "规范 slug",
		hfLabel: "HuggingFace",
		createdLabel: "上架时间",
		descLabel: "描述",
		expand: "展开",
		collapse: "收起",
		clickCopy: "点击复制",
		copied: "已复制",
		addTitle: "添加到模型列表",
		targetRoute: "目标路由",
		routeNew: "将新建 openrouter-free 路由（OpenAI 兼容协议）",
		routeExisting: "将并入已有路由 {route}（现有 {n} 个模型）",
		tokenLabel: "API Token",
		tokenHint: "在 openrouter.ai/keys 创建；免费模型同样需要 Token（有每日请求限额）",
		tokenExistingNote: "该平台已在模型列表配置过 Token（OPENROUTER_API_KEY）：将直接沿用，无需重新输入；可在「设置 → 模型」中更换。",
		tokenPlaceholder: "sk-or-v1-…",
		showToken: "显示",
		hideToken: "隐藏",
		checkBtn: "校验",
		checking: "校验中…",
		checkOk: "Token 有效",
		checkOkWithLabel: "Token 有效（{label}）",
		checkInvalid: "Token 无效（{reason}）",
		checkFailed: "校验失败：{error}",
		setDefault: "设为新会话的默认模型",
		cancel: "取消",
		confirm: "确定添加",
		creating: "添加中…",
		successTitle: "已添加到模型列表",
		successRoute: "路由",
		successModel: "模型",
		successModelsInRoute: "路由模型总数",
		successCredentialSet: "Token 已保存到凭据 OPENROUTER_API_KEY",
		successCredentialKept: "沿用已保存的凭据 OPENROUTER_API_KEY",
		successCredentialMissing: "未提供 Token：请在模型页补配 OPENROUTER_API_KEY 后使用",
		successDefault: "已设为新会话的默认模型",
		successHint: "在对话框底部模型选择器中选择 {route} / {model} 即可使用",
		done: "完成",
		routeUnavailable: "无法连接宿主（/dsh-free-model/api 不可达），请确认插件已安装并重启宿主",
		unknown: "未知",
		none: "无",
		free: "免费"
	},
	en: {
		nav: "Free Models",
		title: "Free Models",
		platformOpenrouter: "OpenRouter",
		subtitle: "OpenRouter · newest first · price 0 or :free flagged only",
		searchPlaceholder: "Search models (id / name / description / vendor)",
		refresh: "Refresh",
		refreshing: "Refreshing…",
		loading: "Loading…",
		countLine: "{total} free models · {n} shown",
		noMatch: "No models match",
		empty: "No free-model data yet",
		loadFailed: "Load failed",
		staleHint: "OpenRouter fetch failed; showing cache from {time}: {error}",
		cachedAt: "cached {time}",
		addToList: "Add",
		added: "Added",
		freeBadge: "FREE",
		contextLabel: "Context",
		maxOutLabel: "Max output",
		inputLabel: "Input",
		outputLabel: "Output",
		tokenizerLabel: "Tokenizer",
		paramsLabel: "Parameters",
		pricingLabel: "Pricing (per token)",
		promptLabel: "prompt",
		completionLabel: "completion",
		moderatedLabel: "Moderated",
		forcedReasoningLabel: "Forced reasoning",
		slugLabel: "Canonical slug",
		hfLabel: "HuggingFace",
		createdLabel: "Added",
		descLabel: "Description",
		expand: "More",
		collapse: "Less",
		clickCopy: "Click to copy",
		copied: "Copied",
		addTitle: "Add to model list",
		targetRoute: "Target route",
		routeNew: "Creates the openrouter-free route (OpenAI-compatible protocol)",
		routeExisting: "Merges into the existing {route} route ({n} models)",
		tokenLabel: "API Token",
		tokenHint: "Create one at openrouter.ai/keys; free models still need a key (daily limits apply)",
		tokenExistingNote: "This platform already has a token stored (OPENROUTER_API_KEY): it will be reused, no need to re-enter it. Change it on the Models settings page.",
		tokenPlaceholder: "sk-or-v1-…",
		showToken: "Show",
		hideToken: "Hide",
		checkBtn: "Check",
		checking: "Checking…",
		checkOk: "Token valid",
		checkOkWithLabel: "Token valid ({label})",
		checkInvalid: "Token invalid ({reason})",
		checkFailed: "Check failed: {error}",
		setDefault: "Set as the default model for new sessions",
		cancel: "Cancel",
		confirm: "Add",
		creating: "Adding…",
		successTitle: "Added to the model list",
		successRoute: "Route",
		successModel: "Model",
		successModelsInRoute: "Models in route",
		successCredentialSet: "Token saved to credential OPENROUTER_API_KEY",
		successCredentialKept: "Using the stored credential OPENROUTER_API_KEY",
		successCredentialMissing: "No token given: configure OPENROUTER_API_KEY on the Models page before use",
		successDefault: "Set as the default model for new sessions",
		successHint: "Pick {route} / {model} in the model selector at the bottom of the composer",
		done: "Done",
		routeUnavailable: "Host unreachable (/dsh-free-model/api). Make sure the plugin is installed and the host restarted",
		unknown: "unknown",
		none: "none",
		free: "free"
	}
};
const dict = COPY[LANG] || COPY.zh;
/** 宿主错误 code → 本地化文案（与 COPY 同语言的独立字典）。 */
const ERRORS = {
	zh: {
		"settings-missing": "宿主 settings 服务不可用",
		"credentials-missing": "宿主 credentials 服务不可用",
		"model-missing": "缺少模型 id",
		"model-not-found": "模型不在缓存列表中，请刷新后重试",
		"settings-rejected": "配置写入被拒绝",
		"token-required": "请输入 Token",
		"network-failed": "网络请求失败",
		"fetch-failed": "OpenRouter 请求失败",
		"route-unreachable": "无法连接宿主 API 路由",
		"forbidden": "请求被拒绝（信任围栏）",
		"params-invalid": "参数必须是 JSON",
		"internal": "宿主内部错误",
		"unknown-op": "未知操作",
		"unknown-platform": "未知平台"
	},
	en: {
		"settings-missing": "Host settings service unavailable",
		"credentials-missing": "Host credentials service unavailable",
		"model-missing": "model id is required",
		"model-not-found": "Model not in the cached list; refresh and retry",
		"settings-rejected": "Config write rejected",
		"token-required": "Token is required",
		"network-failed": "Network request failed",
		"fetch-failed": "OpenRouter request failed",
		"route-unreachable": "Host API route unreachable",
		"forbidden": "Request rejected (trust fence)",
		"params-invalid": "Parameters must be JSON",
		"internal": "Host internal error",
		"unknown-op": "Unknown operation",
		"unknown-platform": "Unknown platform"
	}
};
const errDict = ERRORS[LANG] || ERRORS.zh;
/** 取文案并替换 {var} 占位符。 */
const t = (key, vars) => {
	let s = dict[key] !== void 0 ? dict[key] : String(key);
	if (vars) for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
	return s;
};
/** 宿主错误 code → 本地化文本；未知 code 回退原文。 */
const tErr = (res, fallback) => {
	if (res && res.code) {
		const local = errDict[res.code];
		if (local !== void 0) return local;
	}
	return res && res.error || fallback;
};
/**
* 时间格式化（Unix 秒 → 本地日期）。
* @param unixSeconds - Unix 秒时间戳；0/无效返回 '—'。
*/
const fmtDate = (unixSeconds) => {
	if (!unixSeconds || unixSeconds <= 0) return "—";
	try {
		return (/* @__PURE__ */ new Date(unixSeconds * 1e3)).toLocaleDateString(LANG === "zh" ? "zh-CN" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	} catch {
		return "—";
	}
};
/** 缓存时间格式化（epoch 毫秒 → 本地日期时间）。 */
const fmtDateTime = (epochMs) => {
	if (!epochMs || epochMs <= 0) return "—";
	try {
		return new Date(epochMs).toLocaleString(LANG === "zh" ? "zh-CN" : "en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	} catch {
		return "—";
	}
};
/**
* Token 数量紧凑格式化：1_000_000 → 1M，131072 → 131K，4096 → 4096。
* @param n - token 数；null/0 返回 '—'。
*/
const fmtTokens = (n) => {
	if (n === null || n === void 0 || n <= 0) return "—";
	if (n >= 1e6) {
		const m = n / 1e6;
		return (Number.isInteger(m) ? String(m) : m.toFixed(1)) + "M";
	}
	if (n >= 1e4) {
		const k = n / 1e3;
		return (Number.isInteger(k) ? String(k) : k.toFixed(1)) + "K";
	}
	return String(n);
};
/**
* 价格格式化（USD / token）：0 → '$0'；非零保留 3 位有效数字。
* @param n - 价格数字；null 返回 '—'。
*/
const fmtPrice = (n) => {
	if (n === null || n === void 0) return "—";
	if (n === 0) return "$0";
	const trimmed = Number(n.toPrecision(3));
	return "$" + String(trimmed);
};
//#endregion
//#region src/client/components/ModalPortal.tsx
function ModalPortal({ modalClass, onBackdropClose, children }) {
	return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dsfm-backdrop",
		onClick: onBackdropClose ? (e) => {
			e.stopPropagation();
			onBackdropClose();
		} : void 0,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dsfm-modal" + (modalClass ? " " + modalClass : ""),
			onClick: (e) => e.stopPropagation(),
			children
		})
	}), document.body);
}
//#endregion
//#region src/client/components/AddModelModal.tsx
/**
* dsh-free-model —— 「添加到模型列表」弹框：确认后由宿主创建模型配置。
*
* Token 规则：平台凭据（OPENROUTER_API_KEY）已配置时**不再要求输入**——直接沿用
* 已存 Token，确认即添加；未配置时 Token 必填（免费模型同样需要 Key）。
* 添加 = Token（可选）经 credentials 服务落 .credentials.yaml + 模型并入
* settings.yaml 的 OpenRouter 路由（llm-pi-ai 命名空间）+ 可选设为新会话默认模型。
*/
function AddModelModal(props) {
	const { model, run, routeName, routeModelCount, credentialConfigured, onClose, onSaved } = props;
	const [token, setToken] = (0, react.useState)("");
	const [showToken, setShowToken] = (0, react.useState)(false);
	const [setDefault, setSetDefault] = (0, react.useState)(false);
	const [creating, setCreating] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)(null);
	const [result, setResult] = (0, react.useState)(null);
	const [check, setCheck] = (0, react.useState)({ kind: "idle" });
	const doCheck = () => {
		if (token.trim().length === 0 || check.kind === "checking") return;
		setCheck({ kind: "checking" });
		run({
			op: "checkToken",
			platform: "openrouter",
			token: token.trim()
		}).then((res) => {
			if (res.ok !== true) {
				setCheck({
					kind: "failed",
					message: tErr(res, t("checkFailed", { error: res.error ?? "" }))
				});
				return;
			}
			if (res.valid === true) setCheck({
				kind: "ok",
				label: typeof res.label === "string" && res.label.length > 0 ? res.label : null
			});
			else setCheck({
				kind: "invalid",
				reason: typeof res.error === "string" ? res.error : "unknown"
			});
		}).catch((err) => {
			setCheck({
				kind: "failed",
				message: err instanceof Error ? err.message : String(err)
			});
		});
	};
	const doConfirm = () => {
		if (creating) return;
		if (!credentialConfigured && token.trim().length === 0) {
			setError(tErr({ code: "token-required" }, "token is required"));
			return;
		}
		setCreating(true);
		setError(null);
		run({
			op: "useModel",
			platform: "openrouter",
			modelId: model.id,
			setDefault,
			token: token.trim().length > 0 ? token.trim() : void 0
		}).then((res) => {
			const payload = res;
			if (payload.ok === true) setResult(payload);
			else setError(tErr(payload, payload.error ?? "failed"));
		}).catch((err) => {
			setError(err instanceof Error ? err.message : String(err));
		}).finally(() => {
			setCreating(false);
		});
	};
	const confirmDisabled = creating || !credentialConfigured && token.trim().length === 0;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModalPortal, {
		modalClass: "dsfm-use-modal",
		onBackdropClose: onClose,
		children: result === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-modal-title",
				children: t("addTitle")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-modal-sub",
				children: [
					model.name,
					" · ",
					model.id
				]
			})] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
				className: "dsfm-summary",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("targetRoute") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: routeName !== null ? t("routeExisting", {
					route: routeName,
					n: routeModelCount
				}) : t("routeNew") })]
			}),
			credentialConfigured ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-hint dsfm-token-note",
				children: ["✓ ", t("tokenExistingNote")]
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: "dsfm-token",
						children: t("tokenLabel")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsfm-token-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: "dsfm-token",
								type: showToken ? "text" : "password",
								className: "dsfm-input",
								placeholder: t("tokenPlaceholder"),
								value: token,
								autoComplete: "off",
								onChange: (e) => {
									setToken(e.target.value);
									if (check.kind !== "idle") setCheck({ kind: "idle" });
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsfm-btn dsfm-btn-small",
								onClick: () => {
									setShowToken((v) => !v);
								},
								children: showToken ? t("hideToken") : t("showToken")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsfm-btn dsfm-btn-small",
								disabled: token.trim().length === 0 || check.kind === "checking",
								onClick: doCheck,
								children: check.kind === "checking" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsfm-spin" }), t("checking")] }) : t("checkBtn")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsfm-hint",
						children: t("tokenHint")
					}),
					check.kind === "ok" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsfm-ok",
						children: ["✓ ", check.label !== null ? t("checkOkWithLabel", { label: check.label }) : t("checkOk")]
					}) : null,
					check.kind === "invalid" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsfm-err",
						children: ["✗ ", t("checkInvalid", { reason: check.reason })]
					}) : null,
					check.kind === "failed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsfm-warn",
						children: t("checkFailed", { error: check.message })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dsfm-check",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: setDefault,
					onChange: (e) => {
						setSetDefault(e.target.checked);
					}
				}), t("setDefault")]
			}),
			error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-err",
				children: error
			}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-modal-ops",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dsfm-btn",
					onClick: onClose,
					children: t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "dsfm-btn dsfm-btn-primary",
					disabled: confirmDisabled,
					onClick: doConfirm,
					children: creating ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsfm-spin" }), t("creating")] }) : t("confirm")
				})]
			})
		] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dsfm-success",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsfm-success-title",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsfm-success-icon",
						children: "✓"
					}), t("successTitle")]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
					className: "dsfm-summary",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("successRoute") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [result.routeName ?? "—", result.routeExisted === false ? "（new）" : ""] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("successModel") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: result.modelId ?? model.id }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("successModelsInRoute") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: result.modelCount ?? "—" })
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsfm-hint",
					children: result.credentialAction === "set" ? t("successCredentialSet") : result.credentialAction === "missing" ? t("successCredentialMissing") : t("successCredentialKept")
				}),
				result.defaultModelSet === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsfm-ok",
					children: ["✓ ", t("successDefault")]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsfm-hint",
					children: t("successHint", {
						route: result.routeName ?? "openrouter-free",
						model: result.modelId ?? model.id
					})
				})
			]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dsfm-modal-ops",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dsfm-btn dsfm-btn-primary",
				onClick: onSaved,
				children: t("done")
			})
		})] })
	});
}
//#endregion
//#region src/client/components/OpenRouterPanel.tsx
/**
* dsh-free-model —— OpenRouter 平台面板：列表展示 + 二次本地搜索 + 「添加到模型列表」。
*
* 数据全部来自宿主 /dsh-free-model/api（platform: 'openrouter'）：models op
* （宿主已按 created 倒序排序、已过滤免费模型，本组件保持顺序不再排序）；
* status op（已添加徽标 + 弹框的「沿用已存 Token」提示）。
*/
const INITIAL_STATUS = {
	loaded: false,
	routeName: null,
	routeModelCount: 0,
	configuredIds: /* @__PURE__ */ new Set(),
	credentialConfigured: false
};
const INITIAL_STATE = {
	status: "loading",
	models: [],
	fetchedAt: 0,
	stale: false,
	error: null
};
function OpenRouterPanel({ run }) {
	const [state, setState] = (0, react.useState)(INITIAL_STATE);
	const [status, setStatus] = (0, react.useState)(INITIAL_STATUS);
	const [search, setSearch] = (0, react.useState)("");
	const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set());
	const [target, setTarget] = (0, react.useState)(null);
	const [refreshing, setRefreshing] = (0, react.useState)(false);
	const [copiedId, setCopiedId] = (0, react.useState)(null);
	const loadStatus = () => {
		run({
			op: "status",
			platform: "openrouter"
		}).then((res) => {
			const route = res.route;
			setStatus({
				loaded: res.ok === true,
				routeName: route?.name ?? null,
				routeModelCount: route?.modelCount ?? 0,
				configuredIds: new Set(route?.modelIds ?? []),
				credentialConfigured: res.credentialConfigured === true
			});
		}).catch(() => {});
	};
	const load = (refresh) => {
		if (refresh) setRefreshing(true);
		run({
			op: "models",
			platform: "openrouter",
			refresh
		}).then((res) => {
			const models = Array.isArray(res.models) ? res.models : [];
			if (res.ok === true) setState({
				status: "ready",
				models,
				fetchedAt: Number(res.fetchedAt) || 0,
				stale: res.stale === true,
				error: typeof res.error === "string" ? res.error : null
			});
			else setState((prev) => ({
				status: "error",
				models: prev.models,
				fetchedAt: prev.fetchedAt,
				stale: false,
				error: tErr(res, t("loadFailed"))
			}));
		}).catch((error) => {
			setState((prev) => ({
				status: "error",
				models: prev.models,
				fetchedAt: prev.fetchedAt,
				stale: false,
				error: error instanceof Error ? error.message : String(error)
			}));
		}).finally(() => {
			setRefreshing(false);
		});
	};
	(0, react.useEffect)(() => {
		load(false);
		loadStatus();
	}, []);
	/** 二次本地搜索：id / 名称 / 描述 / 厂商（id 的 vendor 段）不区分大小写包含。 */
	const filtered = (0, react.useMemo)(() => {
		const needle = search.trim().toLowerCase();
		if (needle.length === 0) return state.models;
		return state.models.filter((m) => {
			const vendor = m.id.includes("/") ? m.id.slice(0, m.id.indexOf("/")) : "";
			return m.id.toLowerCase().includes(needle) || m.name.toLowerCase().includes(needle) || vendor.toLowerCase().includes(needle) || m.description.toLowerCase().includes(needle);
		});
	}, [state.models, search]);
	const toggleExpanded = (id) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const copyId = (id) => {
		const done = () => {
			setCopiedId(id);
			setTimeout(() => {
				setCopiedId((current) => current === id ? null : current);
			}, 1200);
		};
		if (typeof navigator !== "undefined" && navigator.clipboard?.writeText !== void 0) navigator.clipboard.writeText(id).then(done, done);
		else done();
	};
	const onSaved = () => {
		setTarget(null);
		loadStatus();
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dsfm-section",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-subtitle",
				children: t("subtitle")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-toolbar",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "text",
						className: "dsfm-input",
						placeholder: t("searchPlaceholder"),
						value: search,
						onChange: (e) => {
							setSearch(e.target.value);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsfm-btn dsfm-btn-small",
						disabled: refreshing,
						onClick: () => {
							load(true);
						},
						children: refreshing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsfm-spin" }), t("refreshing")] }) : t("refresh")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsfm-count",
						children: t("countLine", {
							total: state.models.length,
							n: filtered.length
						})
					})
				]
			}),
			state.stale && state.error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-warn dsfm-stale",
				children: t("staleHint", {
					time: fmtDateTime(state.fetchedAt),
					error: state.error
				})
			}) : null,
			!state.stale && state.fetchedAt > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-subtitle",
				children: t("cachedAt", { time: fmtDateTime(state.fetchedAt) })
			}) : null,
			state.status === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-empty",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsfm-spin" }), t("loading")]
			}) : state.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-empty",
				children: [
					t("loadFailed"),
					"：",
					state.error ?? ""
				]
			}) : state.models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-empty",
				children: t("empty")
			}) : filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-empty",
				children: t("noMatch")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-list",
				children: filtered.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelCard, {
					model: m,
					expanded: expanded.has(m.id),
					added: status.configuredIds.has(m.id),
					copied: copiedId === m.id,
					onToggle: () => {
						toggleExpanded(m.id);
					},
					onCopy: () => {
						copyId(m.id);
					},
					onUse: () => {
						setTarget(m);
					}
				}, m.id))
			}),
			target !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AddModelModal, {
				model: target,
				run,
				routeName: status.routeName,
				routeModelCount: status.routeModelCount,
				credentialConfigured: status.credentialConfigured,
				onClose: () => {
					setTarget(null);
				},
				onSaved
			}) : null
		]
	});
}
/** 单张模型卡片（展开后显示完整信息）。 */
function ModelCard(props) {
	const { model: m, expanded, added, copied, onToggle, onCopy, onUse } = props;
	const vendor = m.id.includes("/") ? m.id.slice(0, m.id.indexOf("/")) : "";
	const params = m.supportedParameters;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dsfm-card",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dsfm-card-top",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsfm-card-main",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsfm-name-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-name",
								children: m.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-badge dsfm-badge-free",
								children: m.freeSuffix ? ":free" : t("freeBadge")
							}),
							added ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-badge dsfm-badge-brand",
								children: t("added")
							}) : null,
							m.moderated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-badge dsfm-badge-muted",
								children: t("moderatedLabel")
							}) : null,
							m.reasoningMandatory ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-badge dsfm-badge-muted",
								children: t("forcedReasoningLabel")
							}) : null
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsfm-id",
						title: copied ? t("copied") : t("clickCopy"),
						onClick: onCopy,
						children: [copied ? "✓ " : "", m.id]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsfm-meta",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("createdLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtDate(m.createdAt) })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("contextLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtTokens(m.contextLength) })
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("maxOutLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtTokens(m.maxCompletionTokens) })
							] }),
							m.modality !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: m.modality }) : null,
							m.tokenizer !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("tokenizerLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: m.tokenizer })
							] }) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								t("promptLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtPrice(m.pricing.prompt) }),
								" · ",
								t("completionLabel"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtPrice(m.pricing.completion) })
							] }),
							vendor !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: vendor }) }) : null
						]
					}),
					m.description !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsfm-desc" + (expanded ? " dsfm-desc-open" : ""),
						children: m.description
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsfm-toggle",
						onClick: onToggle,
						children: expanded ? t("collapse") : t("expand")
					}) }),
					expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "dsfm-details",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("slugLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: m.canonicalSlug ?? "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("hfLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: m.huggingFaceId ?? "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("inputLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: m.inputModalities.length > 0 ? m.inputModalities.join(" + ") : "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("outputLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: m.outputModalities.length > 0 ? m.outputModalities.join(" + ") : "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("pricingLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [
								t("promptLabel"),
								" ",
								fmtPrice(m.pricing.prompt),
								" · ",
								t("completionLabel"),
								" ",
								fmtPrice(m.pricing.completion),
								m.pricing.request !== null ? ` · request ${fmtPrice(m.pricing.request)}` : "",
								m.pricing.image !== null ? ` · image ${fmtPrice(m.pricing.image)}` : "",
								m.pricing.inputCacheRead !== null ? ` · cache-read ${fmtPrice(m.pricing.inputCacheRead)}` : ""
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("paramsLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: params.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "—" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsfm-chips",
								children: params.map((p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsfm-chip",
									children: p
								}, p))
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("descLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: m.description !== "" ? m.description : "—" })
						]
					}) : null
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dsfm-btn dsfm-btn-primary dsfm-btn-small",
				onClick: onUse,
				children: t("addToList")
			})]
		})
	});
}
//#endregion
//#region src/client/components/FreeModelsSection.tsx
/**
* dsh-free-model —— 设置 → 免费模型：平台 tab 外壳。
*
* 目前内置 OpenRouter 一个平台。新增平台时：
* 1. 在 PLATFORMS 追加一项（id 同时是宿主 op 协议里的 platform 字段）；
* 2. 实现对应的面板组件（参考 OpenRouterPanel），并在下方按 id 挂载；
* 3. 宿主 ops.ts 的 runOp 里扩展同名平台分发。
*/
/** 平台注册表：新平台在此追加一行即可出现在 tab 栏。 */
const PLATFORMS = [{
	id: "openrouter",
	labelKey: "platformOpenrouter"
}];
function FreeModelsSection({ run }) {
	const [active, setActive] = (0, react.useState)(PLATFORMS[0]?.id ?? "");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dsfm-section",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-head",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dsfm-title",
					children: t("title")
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsfm-tabs",
				role: "tablist",
				children: PLATFORMS.map((p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": p.id === active,
					className: "dsfm-tab" + (p.id === active ? " dsfm-tab-active" : ""),
					onClick: () => {
						setActive(p.id);
					},
					children: t(p.labelKey)
				}, p.id))
			}),
			active === "openrouter" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OpenRouterPanel, { run }) : null
		]
	});
}
//#endregion
//#region src/client/plugin.tsx
/**
* dsh-free-model —— 浏览器半边插件主体（settings.section 注册）。
*
* 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由 tsdown 的
* banner/footer 包装成宿主工厂格式。外部依赖（react 等）在打包时 external，
* 运行时经 factory 的 require 解析到宿主模块表（seed）。
*
* 入口结构：设置弹框新增一个「免费模型」入口（settings.section，root 作用域 list
* 插槽），内部按平台分 tab（当前内置 OpenRouter）——列表 + 本地搜索 +
* 「添加到模型列表」弹框。不注册任何独立 overlay。
*/
/** 设置弹框里本插件 tab 的注册 id（settings.section 的 only 过滤键）。 */
const SECTION_ID = "dsh-free-model";
function createPlugin() {
	return {
		name: "dsh-free-model",
		inject: ["slots"],
		apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectStyles();
			const run = makeRun();
			slots.inject("settings.section", () => slots.register({
				name: "settings.section",
				id: SECTION_ID,
				order: 40,
				label: () => t("nav")
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FreeModelsSection, { run })));
		}
	};
}
//#endregion
//#region src/client/index.ts
/**
* dsh-free-model —— 浏览器半边入口（tsdown 打包，对齐 dsh-jenkins）。
*
* 本文件为纯 ESM 模块，直接导出插件形状 { name, inject, apply }；
* window.__ModuleLoader__.load 工厂包装由 tsdown 的 banner/footer 在构建时生成
* （见 tsdown.config.ts）。外部依赖（react / react/jsx-runtime / react-dom）
* 构建时保持 external，运行时经 factory 的 require 解析宿主模块表（seed）。
*/
const plugin = createPlugin();
const name = plugin.name;
const inject = plugin.inject;
const apply = plugin.apply;
//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;

return module.exports; } });
//# sourceMappingURL=client.js.map