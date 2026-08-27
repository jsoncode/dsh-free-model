import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-free-model —— OpenRouter 平台面板：列表展示 + 二次本地搜索 + 「添加到模型列表」。
 *
 * 数据全部来自宿主 /dsh-free-model/api（platform: 'openrouter'）：models op
 * （宿主已按 created 倒序排序、已过滤免费模型，本组件保持顺序不再排序）；
 * status op（已添加徽标 + 弹框的「沿用已存 Token」提示）。
 */
import { useEffect, useMemo, useState } from 'react';
import { fmtDate, fmtDateTime, fmtPrice, fmtTokens, t, tErr } from "../i18n.js";
import { AddModelModal } from "./AddModelModal.js";
const INITIAL_STATUS = {
    loaded: false, routeName: null, routeModelCount: 0, configuredIds: new Set(), credentialConfigured: false,
};
const INITIAL_STATE = { status: 'loading', models: [], fetchedAt: 0, stale: false, error: null };
export function OpenRouterPanel({ run }) {
    const [state, setState] = useState(INITIAL_STATE);
    const [status, setStatus] = useState(INITIAL_STATUS);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(new Set());
    const [target, setTarget] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const loadStatus = () => {
        run({ op: 'status', platform: 'openrouter' }).then((res) => {
            const route = res.route;
            setStatus({
                loaded: res.ok === true,
                routeName: route?.name ?? null,
                routeModelCount: route?.modelCount ?? 0,
                configuredIds: new Set(route?.modelIds ?? []),
                credentialConfigured: res.credentialConfigured === true,
            });
        }).catch(() => { });
    };
    const load = (refresh) => {
        if (refresh)
            setRefreshing(true);
        run({ op: 'models', platform: 'openrouter', refresh })
            .then((res) => {
            const models = Array.isArray(res.models) ? res.models : [];
            if (res.ok === true) {
                setState({
                    status: 'ready', models, fetchedAt: Number(res.fetchedAt) || 0,
                    stale: res.stale === true, error: typeof res.error === 'string' ? res.error : null,
                });
            }
            else {
                setState((prev) => ({
                    status: 'error', models: prev.models, fetchedAt: prev.fetchedAt,
                    stale: false, error: tErr(res, t('loadFailed')),
                }));
            }
        })
            .catch((error) => {
            setState((prev) => ({
                status: 'error', models: prev.models, fetchedAt: prev.fetchedAt,
                stale: false, error: error instanceof Error ? error.message : String(error),
            }));
        })
            .finally(() => { setRefreshing(false); });
    };
    useEffect(() => {
        load(false);
        loadStatus();
    }, []);
    /** 二次本地搜索：id / 名称 / 描述 / 厂商（id 的 vendor 段）不区分大小写包含。 */
    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (needle.length === 0)
            return state.models;
        return state.models.filter((m) => {
            const vendor = m.id.includes('/') ? m.id.slice(0, m.id.indexOf('/')) : '';
            return m.id.toLowerCase().includes(needle)
                || m.name.toLowerCase().includes(needle)
                || vendor.toLowerCase().includes(needle)
                || m.description.toLowerCase().includes(needle);
        });
    }, [state.models, search]);
    const toggleExpanded = (id) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    };
    const copyId = (id) => {
        const done = () => {
            setCopiedId(id);
            setTimeout(() => { setCopiedId((current) => (current === id ? null : current)); }, 1200);
        };
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText !== undefined) {
            navigator.clipboard.writeText(id).then(done, done);
        }
        else {
            done();
        }
    };
    const onSaved = () => {
        setTarget(null);
        loadStatus();
    };
    return (_jsxs("div", { className: "dsfm-section", children: [_jsx("div", { className: "dsfm-subtitle", children: t('subtitle') }), _jsxs("div", { className: "dsfm-toolbar", children: [_jsx("input", { type: "text", className: "dsfm-input", placeholder: t('searchPlaceholder'), value: search, onChange: (e) => { setSearch(e.target.value); } }), _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-small", disabled: refreshing, onClick: () => { load(true); }, children: refreshing ? _jsxs(_Fragment, { children: [_jsx("span", { className: "dsfm-spin" }), t('refreshing')] }) : t('refresh') }), _jsx("span", { className: "dsfm-count", children: t('countLine', { total: state.models.length, n: filtered.length }) })] }), state.stale && state.error !== null ? (_jsx("div", { className: "dsfm-warn dsfm-stale", children: t('staleHint', { time: fmtDateTime(state.fetchedAt), error: state.error }) })) : null, !state.stale && state.fetchedAt > 0 ? (_jsx("div", { className: "dsfm-subtitle", children: t('cachedAt', { time: fmtDateTime(state.fetchedAt) }) })) : null, state.status === 'loading' ? _jsxs("div", { className: "dsfm-empty", children: [_jsx("span", { className: "dsfm-spin" }), t('loading')] })
                : state.status === 'error' ? _jsxs("div", { className: "dsfm-empty", children: [t('loadFailed'), "\uFF1A", state.error ?? ''] })
                    : state.models.length === 0 ? _jsx("div", { className: "dsfm-empty", children: t('empty') })
                        : filtered.length === 0 ? _jsx("div", { className: "dsfm-empty", children: t('noMatch') })
                            : (_jsx("div", { className: "dsfm-list", children: filtered.map((m) => (_jsx(ModelCard, { model: m, expanded: expanded.has(m.id), added: status.configuredIds.has(m.id), copied: copiedId === m.id, onToggle: () => { toggleExpanded(m.id); }, onCopy: () => { copyId(m.id); }, onUse: () => { setTarget(m); } }, m.id))) })), target !== null ? (_jsx(AddModelModal, { model: target, run: run, routeName: status.routeName, routeModelCount: status.routeModelCount, credentialConfigured: status.credentialConfigured, onClose: () => { setTarget(null); }, onSaved: onSaved })) : null] }));
}
/** 单张模型卡片（展开后显示完整信息）。 */
function ModelCard(props) {
    const { model: m, expanded, added, copied, onToggle, onCopy, onUse } = props;
    const vendor = m.id.includes('/') ? m.id.slice(0, m.id.indexOf('/')) : '';
    const params = m.supportedParameters;
    return (_jsx("div", { className: "dsfm-card", children: _jsxs("div", { className: "dsfm-card-top", children: [_jsxs("div", { className: "dsfm-card-main", children: [_jsxs("div", { className: "dsfm-name-row", children: [_jsx("span", { className: "dsfm-name", children: m.name }), _jsx("span", { className: "dsfm-badge dsfm-badge-free", children: m.freeSuffix ? ':free' : t('freeBadge') }), added ? _jsx("span", { className: "dsfm-badge dsfm-badge-brand", children: t('added') }) : null, m.moderated ? _jsx("span", { className: "dsfm-badge dsfm-badge-muted", children: t('moderatedLabel') }) : null, m.reasoningMandatory ? _jsx("span", { className: "dsfm-badge dsfm-badge-muted", children: t('forcedReasoningLabel') }) : null] }), _jsxs("button", { type: "button", className: "dsfm-id", title: copied ? t('copied') : t('clickCopy'), onClick: onCopy, children: [copied ? '✓ ' : '', m.id] }), _jsxs("div", { className: "dsfm-meta", children: [_jsxs("span", { children: [t('createdLabel'), " ", _jsx("b", { children: fmtDate(m.createdAt) })] }), _jsxs("span", { children: [t('contextLabel'), " ", _jsx("b", { children: fmtTokens(m.contextLength) })] }), _jsxs("span", { children: [t('maxOutLabel'), " ", _jsx("b", { children: fmtTokens(m.maxCompletionTokens) })] }), m.modality !== null ? _jsx("span", { children: m.modality }) : null, m.tokenizer !== null ? _jsxs("span", { children: [t('tokenizerLabel'), " ", _jsx("b", { children: m.tokenizer })] }) : null, _jsxs("span", { children: [t('promptLabel'), " ", _jsx("b", { children: fmtPrice(m.pricing.prompt) }), " \u00B7 ", t('completionLabel'), " ", _jsx("b", { children: fmtPrice(m.pricing.completion) })] }), vendor !== '' ? _jsx("span", { children: _jsx("b", { children: vendor }) }) : null] }), m.description !== '' ? (_jsx("div", { className: 'dsfm-desc' + (expanded ? ' dsfm-desc-open' : ''), children: m.description })) : null, _jsx("div", { children: _jsx("button", { type: "button", className: "dsfm-toggle", onClick: onToggle, children: expanded ? t('collapse') : t('expand') }) }), expanded ? (_jsxs("dl", { className: "dsfm-details", children: [_jsx("dt", { children: t('slugLabel') }), _jsx("dd", { children: m.canonicalSlug ?? '—' }), _jsx("dt", { children: t('hfLabel') }), _jsx("dd", { children: m.huggingFaceId ?? '—' }), _jsx("dt", { children: t('inputLabel') }), _jsx("dd", { children: m.inputModalities.length > 0 ? m.inputModalities.join(' + ') : '—' }), _jsx("dt", { children: t('outputLabel') }), _jsx("dd", { children: m.outputModalities.length > 0 ? m.outputModalities.join(' + ') : '—' }), _jsx("dt", { children: t('pricingLabel') }), _jsxs("dd", { children: [t('promptLabel'), " ", fmtPrice(m.pricing.prompt), " \u00B7 ", t('completionLabel'), " ", fmtPrice(m.pricing.completion), m.pricing.request !== null ? ` · request ${fmtPrice(m.pricing.request)}` : '', m.pricing.image !== null ? ` · image ${fmtPrice(m.pricing.image)}` : '', m.pricing.inputCacheRead !== null ? ` · cache-read ${fmtPrice(m.pricing.inputCacheRead)}` : ''] }), _jsx("dt", { children: t('paramsLabel') }), _jsx("dd", { children: params.length === 0 ? _jsx("span", { children: "\u2014" }) : (_jsx("span", { className: "dsfm-chips", children: params.map((p) => _jsx("span", { className: "dsfm-chip", children: p }, p)) })) }), _jsx("dt", { children: t('descLabel') }), _jsx("dd", { children: m.description !== '' ? m.description : '—' })] })) : null] }), _jsx("button", { type: "button", className: "dsfm-btn dsfm-btn-primary dsfm-btn-small", onClick: onUse, children: t('addToList') })] }) }));
}
