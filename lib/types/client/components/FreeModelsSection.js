import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-free-model —— 设置 → 免费模型：平台 tab 外壳。
 *
 * 目前内置 OpenRouter 一个平台。新增平台时：
 * 1. 在 PLATFORMS 追加一项（id 同时是宿主 op 协议里的 platform 字段）；
 * 2. 实现对应的面板组件（参考 OpenRouterPanel），并在下方按 id 挂载；
 * 3. 宿主 ops.ts 的 runOp 里扩展同名平台分发。
 */
import { useState } from 'react';
import { t } from "../i18n.js";
import { OpenRouterPanel } from "./OpenRouterPanel.js";
/** 平台注册表：新平台在此追加一行即可出现在 tab 栏。 */
const PLATFORMS = [
    { id: 'openrouter', labelKey: 'platformOpenrouter' },
];
export function FreeModelsSection({ run }) {
    const [active, setActive] = useState(PLATFORMS[0]?.id ?? '');
    return (_jsxs("div", { className: "dsfm-section", children: [_jsx("div", { className: "dsfm-head", children: _jsx("div", { className: "dsfm-title", children: t('title') }) }), _jsx("div", { className: "dsfm-tabs", role: "tablist", children: PLATFORMS.map((p) => (_jsx("button", { type: "button", role: "tab", "aria-selected": p.id === active, className: 'dsfm-tab' + (p.id === active ? ' dsfm-tab-active' : ''), onClick: () => { setActive(p.id); }, children: t(p.labelKey) }, p.id))) }), active === 'openrouter' ? _jsx(OpenRouterPanel, { run: run }) : null] }));
}
