/**
 * dsh-free-model —— OpenRouter 平台面板：列表展示 + 二次本地搜索 + 「添加到模型列表」。
 *
 * 数据全部来自宿主 /dsh-free-model/api（platform: 'openrouter'）：models op
 * （宿主已按 created 倒序排序、已过滤免费模型，本组件保持顺序不再排序）；
 * status op（已添加徽标 + 弹框的「沿用已存 Token」提示）。
 */

import { useEffect, useMemo, useState } from 'react'
import { fmtDate, fmtDateTime, fmtPrice, fmtTokens, t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import type { FreeModel, RouteStatus } from '../types.ts'
import { AddModelModal } from './AddModelModal.tsx'

/** status op 的本地视图（未加载前 route 为 null）。 */
interface StatusView {
  loaded: boolean
  routeName: string | null
  routeModelCount: number
  configuredIds: ReadonlySet<string>
  credentialConfigured: boolean
}

const INITIAL_STATUS: StatusView = {
  loaded: false, routeName: null, routeModelCount: 0, configuredIds: new Set(), credentialConfigured: false,
}

/** 一次 models op 的本地视图。 */
interface ModelState {
  status: 'loading' | 'ready' | 'error'
  models: FreeModel[]
  fetchedAt: number
  stale: boolean
  error: string | null
}

const INITIAL_STATE: ModelState = { status: 'loading', models: [], fetchedAt: 0, stale: false, error: null }

export interface OpenRouterPanelProps {
  run: RunFn
}

export function OpenRouterPanel({ run }: OpenRouterPanelProps) {
  const [state, setState] = useState<ModelState>(INITIAL_STATE)
  const [status, setStatus] = useState<StatusView>(INITIAL_STATUS)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const [target, setTarget] = useState<FreeModel | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadStatus = (): void => {
    run({ op: 'status', platform: 'openrouter' }).then((res) => {
      const route = (res as unknown as RouteStatus).route
      setStatus({
        loaded: res.ok === true,
        routeName: route?.name ?? null,
        routeModelCount: route?.modelCount ?? 0,
        configuredIds: new Set(route?.modelIds ?? []),
        credentialConfigured: (res as unknown as RouteStatus).credentialConfigured === true,
      })
    }).catch(() => { /* status 失败不打扰列表展示 */ })
  }

  const load = (refresh: boolean): void => {
    if (refresh) setRefreshing(true)
    run({ op: 'models', platform: 'openrouter', refresh })
      .then((res) => {
        const models = Array.isArray(res.models) ? (res.models as FreeModel[]) : []
        if (res.ok === true) {
          setState({
            status: 'ready', models, fetchedAt: Number(res.fetchedAt) || 0,
            stale: res.stale === true, error: typeof res.error === 'string' ? res.error : null,
          })
        } else {
          setState((prev) => ({
            status: 'error', models: prev.models, fetchedAt: prev.fetchedAt,
            stale: false, error: tErr(res, t('loadFailed')),
          }))
        }
      })
      .catch((error) => {
        setState((prev) => ({
          status: 'error', models: prev.models, fetchedAt: prev.fetchedAt,
          stale: false, error: error instanceof Error ? error.message : String(error),
        }))
      })
      .finally(() => { setRefreshing(false) })
  }

  useEffect(() => {
    load(false)
    loadStatus()
  }, [])

  /** 二次本地搜索：id / 名称 / 描述 / 厂商（id 的 vendor 段）不区分大小写包含。 */
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (needle.length === 0) return state.models
    return state.models.filter((m) => {
      const vendor = m.id.includes('/') ? m.id.slice(0, m.id.indexOf('/')) : ''
      return m.id.toLowerCase().includes(needle)
        || m.name.toLowerCase().includes(needle)
        || vendor.toLowerCase().includes(needle)
        || m.description.toLowerCase().includes(needle)
    })
  }, [state.models, search])

  const toggleExpanded = (id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyId = (id: string): void => {
    const done = (): void => {
      setCopiedId(id)
      setTimeout(() => { setCopiedId((current) => (current === id ? null : current)) }, 1200)
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText !== undefined) {
      navigator.clipboard.writeText(id).then(done, done)
    } else {
      done()
    }
  }

  const onSaved = (): void => {
    setTarget(null)
    loadStatus()
  }

  return (
    <div className="dsfm-section">
      <div className="dsfm-subtitle">{t('subtitle')}</div>

      <div className="dsfm-toolbar">
        <input
          type="text"
          className="dsfm-input"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        />
        <button
          type="button"
          className="dsfm-btn dsfm-btn-small"
          disabled={refreshing}
          onClick={() => { load(true) }}
        >
          {refreshing ? <><span className="dsfm-spin" />{t('refreshing')}</> : t('refresh')}
        </button>
        <span className="dsfm-count">
          {t('countLine', { total: state.models.length, n: filtered.length })}
        </span>
      </div>

      {state.stale && state.error !== null ? (
        <div className="dsfm-warn dsfm-stale">
          {t('staleHint', { time: fmtDateTime(state.fetchedAt), error: state.error })}
        </div>
      ) : null}
      {!state.stale && state.fetchedAt > 0 ? (
        <div className="dsfm-subtitle">{t('cachedAt', { time: fmtDateTime(state.fetchedAt) })}</div>
      ) : null}

      {state.status === 'loading' ? <div className="dsfm-empty"><span className="dsfm-spin" />{t('loading')}</div>
        : state.status === 'error' ? <div className="dsfm-empty">{t('loadFailed')}：{state.error ?? ''}</div>
        : state.models.length === 0 ? <div className="dsfm-empty">{t('empty')}</div>
        : filtered.length === 0 ? <div className="dsfm-empty">{t('noMatch')}</div>
        : (
          <div className="dsfm-list">
            {filtered.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                expanded={expanded.has(m.id)}
                added={status.configuredIds.has(m.id)}
                copied={copiedId === m.id}
                onToggle={() => { toggleExpanded(m.id) }}
                onCopy={() => { copyId(m.id) }}
                onUse={() => { setTarget(m) }}
              />
            ))}
          </div>
        )}

      {target !== null ? (
        <AddModelModal
          model={target}
          run={run}
          routeName={status.routeName}
          routeModelCount={status.routeModelCount}
          credentialConfigured={status.credentialConfigured}
          onClose={() => { setTarget(null) }}
          onSaved={onSaved}
        />
      ) : null}
    </div>
  )
}

/** 单张模型卡片（展开后显示完整信息）。 */
function ModelCard(props: {
  model: FreeModel
  expanded: boolean
  added: boolean
  copied: boolean
  onToggle: () => void
  onCopy: () => void
  onUse: () => void
}) {
  const { model: m, expanded, added, copied, onToggle, onCopy, onUse } = props
  const vendor = m.id.includes('/') ? m.id.slice(0, m.id.indexOf('/')) : ''
  const params = m.supportedParameters
  return (
    <div className="dsfm-card">
      <div className="dsfm-card-top">
        <div className="dsfm-card-main">
          <div className="dsfm-name-row">
            <span className="dsfm-name">{m.name}</span>
            <span className="dsfm-badge dsfm-badge-free">{m.freeSuffix ? ':free' : t('freeBadge')}</span>
            {added ? <span className="dsfm-badge dsfm-badge-brand">{t('added')}</span> : null}
            {m.moderated ? <span className="dsfm-badge dsfm-badge-muted">{t('moderatedLabel')}</span> : null}
            {m.reasoningMandatory ? <span className="dsfm-badge dsfm-badge-muted">{t('forcedReasoningLabel')}</span> : null}
          </div>
          <button
            type="button"
            className="dsfm-id"
            title={copied ? t('copied') : t('clickCopy')}
            onClick={onCopy}
          >
            {copied ? '✓ ' : ''}{m.id}
          </button>
          <div className="dsfm-meta">
            <span>{t('createdLabel')} <b>{fmtDate(m.createdAt)}</b></span>
            <span>{t('contextLabel')} <b>{fmtTokens(m.contextLength)}</b></span>
            <span>{t('maxOutLabel')} <b>{fmtTokens(m.maxCompletionTokens)}</b></span>
            {m.modality !== null ? <span>{m.modality}</span> : null}
            {m.tokenizer !== null ? <span>{t('tokenizerLabel')} <b>{m.tokenizer}</b></span> : null}
            <span>{t('promptLabel')} <b>{fmtPrice(m.pricing.prompt)}</b> · {t('completionLabel')} <b>{fmtPrice(m.pricing.completion)}</b></span>
            {vendor !== '' ? <span><b>{vendor}</b></span> : null}
          </div>
          {m.description !== '' ? (
            <div className={'dsfm-desc' + (expanded ? ' dsfm-desc-open' : '')}>{m.description}</div>
          ) : null}
          <div>
            <button type="button" className="dsfm-toggle" onClick={onToggle}>
              {expanded ? t('collapse') : t('expand')}
            </button>
          </div>
          {expanded ? (
            <dl className="dsfm-details">
              <dt>{t('slugLabel')}</dt>
              <dd>{m.canonicalSlug ?? '—'}</dd>
              <dt>{t('hfLabel')}</dt>
              <dd>{m.huggingFaceId ?? '—'}</dd>
              <dt>{t('inputLabel')}</dt>
              <dd>{m.inputModalities.length > 0 ? m.inputModalities.join(' + ') : '—'}</dd>
              <dt>{t('outputLabel')}</dt>
              <dd>{m.outputModalities.length > 0 ? m.outputModalities.join(' + ') : '—'}</dd>
              <dt>{t('pricingLabel')}</dt>
              <dd>
                {t('promptLabel')} {fmtPrice(m.pricing.prompt)} · {t('completionLabel')} {fmtPrice(m.pricing.completion)}
                {m.pricing.request !== null ? ` · request ${fmtPrice(m.pricing.request)}` : ''}
                {m.pricing.image !== null ? ` · image ${fmtPrice(m.pricing.image)}` : ''}
                {m.pricing.inputCacheRead !== null ? ` · cache-read ${fmtPrice(m.pricing.inputCacheRead)}` : ''}
              </dd>
              <dt>{t('paramsLabel')}</dt>
              <dd>
                {params.length === 0 ? <span>—</span> : (
                  <span className="dsfm-chips">{params.map((p) => <span key={p} className="dsfm-chip">{p}</span>)}</span>
                )}
              </dd>
              <dt>{t('descLabel')}</dt>
              <dd>{m.description !== '' ? m.description : '—'}</dd>
            </dl>
          ) : null}
        </div>
        <button type="button" className="dsfm-btn dsfm-btn-primary dsfm-btn-small" onClick={onUse}>
          {t('addToList')}
        </button>
      </div>
    </div>
  )
}
