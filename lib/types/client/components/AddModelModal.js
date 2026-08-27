import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-free-model —— 「添加到模型列表」弹框：确认后由宿主创建模型配置。
 *
 * Token 规则：平台凭据（OPENROUTER_API_KEY）已配置时**不再要求输入**——直接沿用
 * 已存 Token，确认即添加；未配置时 Token 必填（免费模型同样需要 Key）。
 * 添加 = Token（可选）经 credentials 服务落 .credentials.yaml + 模型并入
 * settings.yaml 的 OpenRouter 路由（llm-pi-ai 命名空间）+ 可选设为新会话默认模型。
 */
import { useState } from 'react';
import { t, tErr } from "../i18n.js";
import { ModalPortal } from "./ModalPortal.js";
export function AddModelModal(props) {
    const { model, run, routeName, routeModelCount, credentialConfigured, onClose, onSaved } = props;
    const [token, setToken] = useState('');
    const [showToken, setShowToken] = useState(false);
    const [setDefault, setSetDefault] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [check, setCheck] = useState({ kind: 'idle' });
    const doCheck = () => {
        if (token.trim().length === 0 || check.kind === 'checking')
            return;
        setCheck({ kind: 'checking' });
        run({ op: 'checkToken', platform: 'openrouter', token: token.trim() })
            .then((res) => {
            if (res.ok !== true) {
                setCheck({ kind: 'failed', message: tErr(res, t('checkFailed', { error: res.error ?? '' })) });
                return;
            }
            if (res.valid === true) {
                setCheck({ kind: 'ok', label: typeof res.label === 'string' && res.label.length > 0 ? res.label : null });
            }
            else {
                setCheck({ kind: 'invalid', reason: typeof res.error === 'string' ? res.error : 'unknown' });
            }
        })
            .catch((err) => { setCheck({ kind: 'failed', message: err instanceof Error ? err.message : String(err) }); });
    };
    const doConfirm = () => {
        if (creating)
            return;
        // 凭据未配置时 Token 必填（按钮已禁用；此处兜底）。
        if (!credentialConfigured && token.trim().length === 0) {
            setError(tErr({ code: 'token-required' }, 'token is required'));
            return;
        }
        setCreating(true);
        setError(null);
        run({
            op: 'useModel', platform: 'openrouter', modelId: model.id, setDefault,
            token: token.trim().length > 0 ? token.trim() : undefined,
        })
            .then((res) => {
            const payload = res;
            if (payload.ok === true) {
                setResult(payload);
            }
            else {
                setError(tErr(payload, payload.error ?? 'failed'));
            }
        })
            .catch((err) => { setError(err instanceof Error ? err.message : String(err)); })
            .finally(() => { setCreating(false); });
    };
    const confirmDisabled = creating || (!credentialConfigured && token.trim().length === 0);
    return (_jsx(ModalPortal, { modalClass: "dsfm-use-modal", onBackdropClose: onClose, children: result === null ? (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("div", { className: "dsfm-modal-title", children: t('addTitle') }), _jsxs("div", { className: "dsfm-modal-sub", children: [model.name, " \u00B7 ", model.id] })] }), _jsxs("dl", { className: "dsfm-summary", children: [_jsx("dt", { children: t('targetRoute') }), _jsx("dd", { children: routeName !== null
                                ? t('routeExisting', { route: routeName, n: routeModelCount })
                                : t('routeNew') })] }), credentialConfigured ? (_jsxs("div", { className: "dsfm-hint dsfm-token-note", children: ["\u2713 ", t('tokenExistingNote')] })) : (_jsxs("div", { className: "dsfm-field", children: [_jsx("label", { htmlFor: "dsfm-token", children: t('tokenLabel') }), _jsxs("div", { className: "dsfm-token-row", children: [_jsx("input", { id: "dsfm-token", type: showToken ? 'text' : 'password', className: "dsfm-input", placeholder: t('tokenPlaceholder'), value: token, autoComplete: "off", onChange: (e) => { setToken(e.target.value); if (check.kind !== 'idle')
                                        setCheck({ kind: 'idle' }); } }), _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-small", onClick: () => { setShowToken((v) => !v); }, children: showToken ? t('hideToken') : t('showToken') }), _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-small", disabled: token.trim().length === 0 || check.kind === 'checking', onClick: doCheck, children: check.kind === 'checking' ? _jsxs(_Fragment, { children: [_jsx("span", { className: "dsfm-spin" }), t('checking')] }) : t('checkBtn') })] }), _jsx("div", { className: "dsfm-hint", children: t('tokenHint') }), check.kind === 'ok' ? _jsxs("div", { className: "dsfm-ok", children: ["\u2713 ", check.label !== null ? t('checkOkWithLabel', { label: check.label }) : t('checkOk')] }) : null, check.kind === 'invalid' ? _jsxs("div", { className: "dsfm-err", children: ["\u2717 ", t('checkInvalid', { reason: check.reason })] }) : null, check.kind === 'failed' ? _jsx("div", { className: "dsfm-warn", children: t('checkFailed', { error: check.message }) }) : null] })), _jsxs("label", { className: "dsfm-check", children: [_jsx("input", { type: "checkbox", checked: setDefault, onChange: (e) => { setSetDefault(e.target.checked); } }), t('setDefault')] }), error !== null ? _jsx("div", { className: "dsfm-err", children: error }) : null, _jsxs("div", { className: "dsfm-modal-ops", children: [_jsx("button", { type: "button", className: "dsfm-btn", onClick: onClose, children: t('cancel') }), _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-primary", disabled: confirmDisabled, onClick: doConfirm, children: creating ? _jsxs(_Fragment, { children: [_jsx("span", { className: "dsfm-spin" }), t('creating')] }) : t('confirm') })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dsfm-success", children: [_jsxs("div", { className: "dsfm-success-title", children: [_jsx("span", { className: "dsfm-success-icon", children: "\u2713" }), t('successTitle')] }), _jsxs("dl", { className: "dsfm-summary", children: [_jsx("dt", { children: t('successRoute') }), _jsxs("dd", { children: [result.routeName ?? '—', result.routeExisted === false ? '（new）' : ''] }), _jsx("dt", { children: t('successModel') }), _jsx("dd", { children: result.modelId ?? model.id }), _jsx("dt", { children: t('successModelsInRoute') }), _jsx("dd", { children: result.modelCount ?? '—' })] }), _jsx("div", { className: "dsfm-hint", children: result.credentialAction === 'set' ? t('successCredentialSet')
                                : result.credentialAction === 'missing' ? t('successCredentialMissing')
                                    : t('successCredentialKept') }), result.defaultModelSet === true ? _jsxs("div", { className: "dsfm-ok", children: ["\u2713 ", t('successDefault')] }) : null, _jsx("div", { className: "dsfm-hint", children: t('successHint', { route: result.routeName ?? 'openrouter-free', model: result.modelId ?? model.id }) })] }), _jsx("div", { className: "dsfm-modal-ops", children: _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-primary", onClick: onSaved, children: t('done') }) })] })) }));
}
