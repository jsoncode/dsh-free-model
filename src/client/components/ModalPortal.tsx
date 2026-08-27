/**
 * dsh-free-model —— 弹框统一挂载（React portal → document.body）。
 * 与 dsh-jenkins 的 ModalPortal 同一语义：蒙版 fixed 铺满视口，点击蒙版关闭
 * 最上层弹框，点击弹框本体不冒泡。
 */

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ModalPortalProps {
  /** 弹框本体附加类（尺寸 / 布局）。 */
  modalClass?: string
  /** 点击蒙版回调（缺省则点击蒙版不关闭）。 */
  onBackdropClose?: () => void
  children: ReactNode
}

export function ModalPortal({ modalClass, onBackdropClose, children }: ModalPortalProps) {
  return createPortal(
    <div
      className="dsfm-backdrop"
      onClick={onBackdropClose
        ? (e) => { e.stopPropagation(); onBackdropClose() }
        : undefined}
    >
      <div className={'dsfm-modal' + (modalClass ? ' ' + modalClass : '')} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
