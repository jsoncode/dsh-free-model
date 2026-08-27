/**
 * dsh-free-model —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
 */
function resolveLang() {
    if (typeof document !== 'undefined') {
        const host = document.documentElement.lang || navigator.language || 'zh-CN';
        return /^zh/i.test(host) ? 'zh' : 'en';
    }
    return 'zh';
}
export const LANG = resolveLang();
const COPY = {
    zh: {
        nav: '免费模型',
        title: '免费模型',
        platformOpenrouter: 'OpenRouter',
        subtitle: 'OpenRouter · 按上架时间倒序 · 仅收录价格为 0 或带 :free 标记的模型',
        searchPlaceholder: '搜索模型（id / 名称 / 描述 / 厂商）',
        refresh: '刷新',
        refreshing: '刷新中…',
        loading: '加载中…',
        countLine: '共 {total} 个免费模型 · 匹配 {n}',
        noMatch: '没有匹配的模型',
        empty: '暂无免费模型数据',
        loadFailed: '加载失败',
        staleHint: 'OpenRouter 拉取失败，展示 {time} 的缓存：{error}',
        cachedAt: '缓存于 {time}',
        addToList: '添加',
        added: '已添加',
        freeBadge: '免费',
        contextLabel: '上下文',
        maxOutLabel: '最大输出',
        inputLabel: '输入',
        outputLabel: '输出',
        tokenizerLabel: '分词器',
        paramsLabel: '支持参数',
        pricingLabel: '价格（每 token）',
        promptLabel: '提示',
        completionLabel: '补全',
        moderatedLabel: '内容审核',
        forcedReasoningLabel: '强制推理',
        slugLabel: '规范 slug',
        hfLabel: 'HuggingFace',
        createdLabel: '上架时间',
        descLabel: '描述',
        expand: '展开',
        collapse: '收起',
        clickCopy: '点击复制',
        copied: '已复制',
        addTitle: '添加到模型列表',
        targetRoute: '目标路由',
        routeNew: '将新建 openrouter-free 路由（OpenAI 兼容协议）',
        routeExisting: '将并入已有路由 {route}（现有 {n} 个模型）',
        tokenLabel: 'API Token',
        tokenHint: '在 openrouter.ai/keys 创建；免费模型同样需要 Token（有每日请求限额）',
        tokenExistingNote: '该平台已在模型列表配置过 Token（OPENROUTER_API_KEY）：将直接沿用，无需重新输入；可在「设置 → 模型」中更换。',
        tokenPlaceholder: 'sk-or-v1-…',
        showToken: '显示',
        hideToken: '隐藏',
        checkBtn: '校验',
        checking: '校验中…',
        checkOk: 'Token 有效',
        checkOkWithLabel: 'Token 有效（{label}）',
        checkInvalid: 'Token 无效（{reason}）',
        checkFailed: '校验失败：{error}',
        setDefault: '设为新会话的默认模型',
        cancel: '取消',
        confirm: '确定添加',
        creating: '添加中…',
        successTitle: '已添加到模型列表',
        successRoute: '路由',
        successModel: '模型',
        successModelsInRoute: '路由模型总数',
        successCredentialSet: 'Token 已保存到凭据 OPENROUTER_API_KEY',
        successCredentialKept: '沿用已保存的凭据 OPENROUTER_API_KEY',
        successCredentialMissing: '未提供 Token：请在模型页补配 OPENROUTER_API_KEY 后使用',
        successDefault: '已设为新会话的默认模型',
        successHint: '在对话框底部模型选择器中选择 {route} / {model} 即可使用',
        done: '完成',
        routeUnavailable: '无法连接宿主（/dsh-free-model/api 不可达），请确认插件已安装并重启宿主',
        unknown: '未知',
        none: '无',
        free: '免费',
    },
    en: {
        nav: 'Free Models',
        title: 'Free Models',
        platformOpenrouter: 'OpenRouter',
        subtitle: 'OpenRouter · newest first · price 0 or :free flagged only',
        searchPlaceholder: 'Search models (id / name / description / vendor)',
        refresh: 'Refresh',
        refreshing: 'Refreshing…',
        loading: 'Loading…',
        countLine: '{total} free models · {n} shown',
        noMatch: 'No models match',
        empty: 'No free-model data yet',
        loadFailed: 'Load failed',
        staleHint: 'OpenRouter fetch failed; showing cache from {time}: {error}',
        cachedAt: 'cached {time}',
        addToList: 'Add',
        added: 'Added',
        freeBadge: 'FREE',
        contextLabel: 'Context',
        maxOutLabel: 'Max output',
        inputLabel: 'Input',
        outputLabel: 'Output',
        tokenizerLabel: 'Tokenizer',
        paramsLabel: 'Parameters',
        pricingLabel: 'Pricing (per token)',
        promptLabel: 'prompt',
        completionLabel: 'completion',
        moderatedLabel: 'Moderated',
        forcedReasoningLabel: 'Forced reasoning',
        slugLabel: 'Canonical slug',
        hfLabel: 'HuggingFace',
        createdLabel: 'Added',
        descLabel: 'Description',
        expand: 'More',
        collapse: 'Less',
        clickCopy: 'Click to copy',
        copied: 'Copied',
        addTitle: 'Add to model list',
        targetRoute: 'Target route',
        routeNew: 'Creates the openrouter-free route (OpenAI-compatible protocol)',
        routeExisting: 'Merges into the existing {route} route ({n} models)',
        tokenLabel: 'API Token',
        tokenHint: 'Create one at openrouter.ai/keys; free models still need a key (daily limits apply)',
        tokenExistingNote: 'This platform already has a token stored (OPENROUTER_API_KEY): it will be reused, no need to re-enter it. Change it on the Models settings page.',
        tokenPlaceholder: 'sk-or-v1-…',
        showToken: 'Show',
        hideToken: 'Hide',
        checkBtn: 'Check',
        checking: 'Checking…',
        checkOk: 'Token valid',
        checkOkWithLabel: 'Token valid ({label})',
        checkInvalid: 'Token invalid ({reason})',
        checkFailed: 'Check failed: {error}',
        setDefault: 'Set as the default model for new sessions',
        cancel: 'Cancel',
        confirm: 'Add',
        creating: 'Adding…',
        successTitle: 'Added to the model list',
        successRoute: 'Route',
        successModel: 'Model',
        successModelsInRoute: 'Models in route',
        successCredentialSet: 'Token saved to credential OPENROUTER_API_KEY',
        successCredentialKept: 'Using the stored credential OPENROUTER_API_KEY',
        successCredentialMissing: 'No token given: configure OPENROUTER_API_KEY on the Models page before use',
        successDefault: 'Set as the default model for new sessions',
        successHint: 'Pick {route} / {model} in the model selector at the bottom of the composer',
        done: 'Done',
        routeUnavailable: 'Host unreachable (/dsh-free-model/api). Make sure the plugin is installed and the host restarted',
        unknown: 'unknown',
        none: 'none',
        free: 'free',
    },
};
const dict = COPY[LANG] || COPY.zh;
/** 宿主错误 code → 本地化文案（与 COPY 同语言的独立字典）。 */
const ERRORS = {
    zh: {
        'settings-missing': '宿主 settings 服务不可用',
        'credentials-missing': '宿主 credentials 服务不可用',
        'model-missing': '缺少模型 id',
        'model-not-found': '模型不在缓存列表中，请刷新后重试',
        'settings-rejected': '配置写入被拒绝',
        'token-required': '请输入 Token',
        'network-failed': '网络请求失败',
        'fetch-failed': 'OpenRouter 请求失败',
        'route-unreachable': '无法连接宿主 API 路由',
        'forbidden': '请求被拒绝（信任围栏）',
        'params-invalid': '参数必须是 JSON',
        'internal': '宿主内部错误',
        'unknown-op': '未知操作',
        'unknown-platform': '未知平台',
    },
    en: {
        'settings-missing': 'Host settings service unavailable',
        'credentials-missing': 'Host credentials service unavailable',
        'model-missing': 'model id is required',
        'model-not-found': 'Model not in the cached list; refresh and retry',
        'settings-rejected': 'Config write rejected',
        'token-required': 'Token is required',
        'network-failed': 'Network request failed',
        'fetch-failed': 'OpenRouter request failed',
        'route-unreachable': 'Host API route unreachable',
        'forbidden': 'Request rejected (trust fence)',
        'params-invalid': 'Parameters must be JSON',
        'internal': 'Host internal error',
        'unknown-op': 'Unknown operation',
        'unknown-platform': 'Unknown platform',
    },
};
const errDict = ERRORS[LANG] || ERRORS.zh;
/** 取文案并替换 {var} 占位符。 */
export const t = (key, vars) => {
    let s = dict[key] !== undefined ? dict[key] : String(key);
    if (vars) {
        for (const k of Object.keys(vars)) {
            s = s.split('{' + k + '}').join(String(vars[k]));
        }
    }
    return s;
};
/** 宿主错误 code → 本地化文本；未知 code 回退原文。 */
export const tErr = (res, fallback) => {
    if (res && res.code) {
        const local = errDict[res.code];
        if (local !== undefined)
            return local;
    }
    return (res && res.error) || fallback;
};
/**
 * 时间格式化（Unix 秒 → 本地日期）。
 * @param unixSeconds - Unix 秒时间戳；0/无效返回 '—'。
 */
export const fmtDate = (unixSeconds) => {
    if (!unixSeconds || unixSeconds <= 0)
        return '—';
    try {
        return new Date(unixSeconds * 1000).toLocaleDateString(LANG === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    }
    catch {
        return '—';
    }
};
/** 缓存时间格式化（epoch 毫秒 → 本地日期时间）。 */
export const fmtDateTime = (epochMs) => {
    if (!epochMs || epochMs <= 0)
        return '—';
    try {
        return new Date(epochMs).toLocaleString(LANG === 'zh' ? 'zh-CN' : 'en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    }
    catch {
        return '—';
    }
};
/**
 * Token 数量紧凑格式化：1_000_000 → 1M，131072 → 131K，4096 → 4096。
 * @param n - token 数；null/0 返回 '—'。
 */
export const fmtTokens = (n) => {
    if (n === null || n === undefined || n <= 0)
        return '—';
    if (n >= 1_000_000) {
        const m = n / 1_000_000;
        return (Number.isInteger(m) ? String(m) : m.toFixed(1)) + 'M';
    }
    if (n >= 10_000) {
        const k = n / 1000;
        return (Number.isInteger(k) ? String(k) : k.toFixed(1)) + 'K';
    }
    return String(n);
};
/**
 * 价格格式化（USD / token）：0 → '$0'；非零保留 3 位有效数字。
 * @param n - 价格数字；null 返回 '—'。
 */
export const fmtPrice = (n) => {
    if (n === null || n === undefined)
        return '—';
    if (n === 0)
        return '$0';
    const trimmed = Number(n.toPrecision(3));
    return '$' + String(trimmed);
};
