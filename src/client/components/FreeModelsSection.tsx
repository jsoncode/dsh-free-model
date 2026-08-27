/**
 * dsh-free-model —— 设置 → 免费模型：平台 tab 外壳。
 *
 * 目前内置 OpenRouter 一个平台。新增平台时：
 * 1. 在 PLATFORMS 追加一项（id 同时是宿主 op 协议里的 platform 字段）；
 * 2. 实现对应的面板组件（参考 OpenRouterPanel），并在下方按 id 挂载；
 * 3. 宿主 ops.ts 的 runOp 里扩展同名平台分发。
 */

import { useState } from 'react'
import { t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'
import { OpenRouterPanel } from './OpenRouterPanel.tsx'

/** 平台 tab：id 同时是宿主 op 协议里的 platform 字段。 */
interface PlatformTab {
  id: string
  labelKey: string
}

/** 平台注册表：新平台在此追加一行即可出现在 tab 栏。 */
const PLATFORMS: PlatformTab[] = [
  { id: 'openrouter', labelKey: 'platformOpenrouter' },
]

export interface FreeModelsSectionProps {
  run: RunFn
}

export function FreeModelsSection({ run }: FreeModelsSectionProps) {
  const [active, setActive] = useState<string>(PLATFORMS[0]?.id ?? '')
  return (
    <div className="dsfm-section">
      <div className="dsfm-head">
        <div className="dsfm-title">{t('title')}</div>
      </div>
      <div className="dsfm-tabs" role="tablist">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === active}
            className={'dsfm-tab' + (p.id === active ? ' dsfm-tab-active' : '')}
            onClick={() => { setActive(p.id) }}
          >
            {t(p.labelKey)}
          </button>
        ))}
      </div>
      {active === 'openrouter' ? <OpenRouterPanel run={run} /> : null}
    </div>
  )
}
