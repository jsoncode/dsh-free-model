/**
 * dsh-free-model —— 「添加到模型列表」弹框：确认后由宿主创建模型配置。
 *
 * Token 规则：平台凭据（OPENROUTER_API_KEY）已配置时**不再要求输入**——直接沿用
 * 已存 Token，确认即添加；未配置时 Token 必填（免费模型同样需要 Key）。
 * 添加 = Token（可选）经 credentials 服务落 .credentials.yaml + 模型并入
 * settings.yaml 的 OpenRouter 路由（llm-pi-ai 命名空间）+ 可选设为新会话默认模型。
 */

import { useState } from 'react'
import { t, tErr } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import type { FreeModel, UseModelResult } from '../types.ts'
import { ModalPortal } from './ModalPortal.tsx'

/** Token 校验状态。 */
type CheckState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; label: string | null }
  | { kind: 'invalid'; reason: string }
  | { kind: 'failed'; message: string }

export interface AddModelModalProps {
  model: FreeModel
  run: RunFn
  /** 当前命中的 OpenRouter 路由名（null = 将新建 openrouter-free）。 */
  routeName: string | null
  /** 命中路由当前的模型数。 */
  routeModelCount: number
  /** 平台 Token（OPENROUTER_API_KEY）是否已配置；true 时隐藏 Token 输入。 */
  credentialConfigured: boolean
  onClose: () => void
  /** 保存成功后回调（列表刷新「已添加」徽标）。 */
  onSaved: () => void
}

export function AddModelModal(props: AddModelModalProps) {
  const { model, run, routeName, routeModelCount, credentialConfigured, onClose, onSaved } = props
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [setDefault, setSetDefault] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UseModelResult | null>(null)
  const [check, setCheck] = useState<CheckState>({ kind: 'idle' })

  const doCheck = (): void => {
    if (token.trim().length === 0 || check.kind === 'checking') return
    setCheck({ kind: 'checking' })
    run({ op: 'checkToken', platform: 'openrouter', token: token.trim() })
      .then((res) => {
        if (res.ok !== true) {
          setCheck({ kind: 'failed', message: tErr(res, t('checkFailed', { error: res.error ?? '' })) })
          return
        }
        if (res.valid === true) {
          setCheck({ kind: 'ok', label: typeof res.label === 'string' && res.label.length > 0 ? res.label : null })
        } else {
          setCheck({ kind: 'invalid', reason: typeof res.error === 'string' ? res.error : 'unknown' })
        }
      })
      .catch((err) => { setCheck({ kind: 'failed', message: err instanceof Error ? err.message : String(err) }) })
  }

  const doConfirm = (): void => {
    if (creating) return
    // 凭据未配置时 Token 必填（按钮已禁用；此处兜底）。
    if (!credentialConfigured && token.trim().length === 0) {
      setError(tErr({ code: 'token-required' }, 'token is required'))
      return
    }
    setCreating(true)
    setError(null)
    run({
      op: 'useModel', platform: 'openrouter', modelId: model.id, setDefault,
      token: token.trim().length > 0 ? token.trim() : undefined,
    })
      .then((res) => {
        const payload = res as unknown as UseModelResult
        if (payload.ok === true) {
          setResult(payload)
        } else {
          setError(tErr(payload, payload.error ?? 'failed'))
        }
      })
      .catch((err) => { setError(err instanceof Error ? err.message : String(err)) })
      .finally(() => { setCreating(false) })
  }

  const confirmDisabled = creating || (!credentialConfigured && token.trim().length === 0)

  return (
    <ModalPortal modalClass="dsfm-use-modal" onBackdropClose={onClose}>
      {result === null ? (
        <>
          <div>
            <div className="dsfm-modal-title">{t('addTitle')}</div>
            <div className="dsfm-modal-sub">{model.name} · {model.id}</div>
          </div>

          <dl className="dsfm-summary">
            <dt>{t('targetRoute')}</dt>
            <dd>
              {routeName !== null
                ? t('routeExisting', { route: routeName, n: routeModelCount })
                : t('routeNew')}
            </dd>
          </dl>

          {credentialConfigured ? (
            <div className="dsfm-hint dsfm-token-note">✓ {t('tokenExistingNote')}</div>
          ) : (
            <div className="dsfm-field">
              <label htmlFor="dsfm-token">{t('tokenLabel')}</label>
              <div className="dsfm-token-row">
                <input
                  id="dsfm-token"
                  type={showToken ? 'text' : 'password'}
                  className="dsfm-input"
                  placeholder={t('tokenPlaceholder')}
                  value={token}
                  autoComplete="off"
                  onChange={(e) => { setToken(e.target.value); if (check.kind !== 'idle') setCheck({ kind: 'idle' }) }}
                />
                <button type="button" className="dsfm-btn dsfm-btn-small" onClick={() => { setShowToken((v) => !v) }}>
                  {showToken ? t('hideToken') : t('showToken')}
                </button>
                <button
                  type="button"
                  className="dsfm-btn dsfm-btn-small"
                  disabled={token.trim().length === 0 || check.kind === 'checking'}
                  onClick={doCheck}
                >
                  {check.kind === 'checking' ? <><span className="dsfm-spin" />{t('checking')}</> : t('checkBtn')}
                </button>
              </div>
              <div className="dsfm-hint">{t('tokenHint')}</div>
              {check.kind === 'ok' ? <div className="dsfm-ok">✓ {check.label !== null ? t('checkOkWithLabel', { label: check.label }) : t('checkOk')}</div> : null}
              {check.kind === 'invalid' ? <div className="dsfm-err">✗ {t('checkInvalid', { reason: check.reason })}</div> : null}
              {check.kind === 'failed' ? <div className="dsfm-warn">{t('checkFailed', { error: check.message })}</div> : null}
            </div>
          )}

          <label className="dsfm-check">
            <input type="checkbox" checked={setDefault} onChange={(e) => { setSetDefault(e.target.checked) }} />
            {t('setDefault')}
          </label>

          {error !== null ? <div className="dsfm-err">{error}</div> : null}

          <div className="dsfm-modal-ops">
            <button type="button" className="dsfm-btn" onClick={onClose}>{t('cancel')}</button>
            <button type="button" className="dsfm-btn dsfm-btn-primary" disabled={confirmDisabled} onClick={doConfirm}>
              {creating ? <><span className="dsfm-spin" />{t('creating')}</> : t('confirm')}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="dsfm-success">
            <div className="dsfm-success-title"><span className="dsfm-success-icon">✓</span>{t('successTitle')}</div>
            <dl className="dsfm-summary">
              <dt>{t('successRoute')}</dt>
              <dd>{result.routeName ?? '—'}{result.routeExisted === false ? '（new）' : ''}</dd>
              <dt>{t('successModel')}</dt>
              <dd>{result.modelId ?? model.id}</dd>
              <dt>{t('successModelsInRoute')}</dt>
              <dd>{result.modelCount ?? '—'}</dd>
            </dl>
            <div className="dsfm-hint">
              {result.credentialAction === 'set' ? t('successCredentialSet')
                : result.credentialAction === 'missing' ? t('successCredentialMissing')
                : t('successCredentialKept')}
            </div>
            {result.defaultModelSet === true ? <div className="dsfm-ok">✓ {t('successDefault')}</div> : null}
            <div className="dsfm-hint">
              {t('successHint', { route: result.routeName ?? 'openrouter-free', model: result.modelId ?? model.id })}
            </div>
          </div>
          <div className="dsfm-modal-ops">
            <button type="button" className="dsfm-btn dsfm-btn-primary" onClick={onSaved}>{t('done')}</button>
          </div>
        </>
      )}
    </ModalPortal>
  )
}
