/**
 * dsh-free-model —— 浏览器半边：样式注入（与 dsh-jenkins 相同的 bundle CSS 注入模式）。
 * 只消费宿主 --dsw-* 语义令牌（带回退值），不写死颜色。
 */

const CSS_ID = 'dsh-free-model/settings.css'

export const css = [
  // ── 通用控件 ──────────────────────────────────────────────────
  '.dsfm-btn{border:1px solid var(--dsw-alias-border-l2,#ccc);background:transparent;color:var(--dsw-alias-label-primary,#222);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer;font-family:inherit}',
  '.dsfm-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}',
  '.dsfm-btn:disabled{opacity:.5;cursor:not-allowed}',
  '.dsfm-btn-primary{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 88%,transparent);border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}',
  '.dsfm-btn-primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary,#1668e3)}',
  '.dsfm-btn-small{padding:3px 10px;font-size:12px}',
  '.dsfm-input{width:100%;box-sizing:border-box;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 86%,transparent);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s}',
  '.dsfm-input:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8)}',
  '.dsfm-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}',
  '.dsfm-input::placeholder{color:var(--dsw-alias-label-tertiary,#aaa)}',
  '.dsfm-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:13px;margin:8px 0;word-break:break-word}',
  '.dsfm-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:13px;margin:8px 0}',
  '.dsfm-warn{color:var(--dsw-alias-state-warn-primary,#b8860b);font-size:12px;word-break:break-word}',
  '.dsfm-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}',
  '.dsfm-spin{display:inline-block;width:12px;height:12px;border:2px solid color-mix(in srgb,var(--dsw-alias-label-secondary,#888) 35%,transparent);border-top-color:var(--dsw-alias-label-secondary,#888);border-radius:50%;animation:dsfm-rotate .8s linear infinite;vertical-align:-2px;margin-right:6px}',
  '@keyframes dsfm-rotate{to{transform:rotate(360deg)}}',

  // ── 设置页主体 ────────────────────────────────────────────────
  '.dsfm-section{display:flex;flex-direction:column;gap:12px}',
  '.dsfm-head{display:flex;flex-direction:column;gap:2px}',
  '.dsfm-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary,#222)}',
  '.dsfm-subtitle{font-size:12px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dsfm-toolbar{display:flex;align-items:center;gap:8px}',
  '.dsfm-toolbar .dsfm-input{flex:1;min-width:0}',
  '.dsfm-count{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}',
  '.dsfm-stale{font-size:12px}',
  '.dsfm-list{display:flex;flex-direction:column;gap:10px;max-height:min(56vh,640px);overflow-y:auto;padding:2px;margin:-2px}',

  // ── 平台 tab ──────────────────────────────────────────────────
  '.dsfm-tabs{display:flex;gap:6px;flex-wrap:wrap}',
  '.dsfm-tab{border:1px solid var(--dsw-alias-border-l2,#ccc);background:transparent;color:var(--dsw-alias-label-secondary,#888);border-radius:999px;padding:4px 16px;font-size:13px;cursor:pointer;font-family:inherit}',
  '.dsfm-tab:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8);color:var(--dsw-alias-label-primary,#222)}',
  '.dsfm-tab-active{border-color:var(--dsw-alias-brand-primary,#1668e3);color:var(--dsw-alias-brand-primary,#1668e3);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 10%,transparent)}',

  // ── 模型卡片 ──────────────────────────────────────────────────
  '.dsfm-card{border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:10px;padding:10px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 60%,transparent)}',
  '.dsfm-card:hover{border-color:var(--dsw-alias-border-l3,#bbb)}',
  '.dsfm-card-top{display:flex;align-items:flex-start;gap:10px}',
  '.dsfm-card-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}',
  '.dsfm-name-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '.dsfm-name{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,#222)}',
  '.dsfm-id{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--dsw-alias-label-secondary,#888);cursor:pointer;word-break:break-all;background:none;border:none;padding:0;text-align:left;font-weight:400}',
  '.dsfm-id:hover{color:var(--dsw-alias-brand-primary,#1668e3)}',
  '.dsfm-badge{display:inline-flex;align-items:center;font-size:11px;line-height:16px;padding:0 8px;border-radius:999px;white-space:nowrap}',
  '.dsfm-badge-free{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2a7d3c) 14%,transparent);color:var(--dsw-alias-state-success-primary,#2a7d3c)}',
  '.dsfm-badge-muted{background:color-mix(in srgb,var(--dsw-alias-label-secondary,#888) 14%,transparent);color:var(--dsw-alias-label-secondary,#888)}',
  '.dsfm-badge-brand{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 14%,transparent);color:var(--dsw-alias-brand-primary,#1668e3)}',
  '.dsfm-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dsfm-meta b{font-weight:500;color:var(--dsw-alias-label-primary,#222)}',
  '.dsfm-desc{font-size:12px;line-height:1.55;color:var(--dsw-alias-label-secondary,#888);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}',
  '.dsfm-desc-open{display:block;-webkit-line-clamp:unset;overflow:visible}',
  '.dsfm-toggle{border:none;background:none;color:var(--dsw-alias-brand-primary,#1668e3);font-size:12px;cursor:pointer;padding:0;font-family:inherit}',
  '.dsfm-toggle:hover{text-decoration:underline}',
  '.dsfm-details{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--dsw-alias-border-l2,#ddd)}',
  '.dsfm-details>dt{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}',
  '.dsfm-details>dd{font-size:12px;color:var(--dsw-alias-label-primary,#222);margin:0;word-break:break-word}',
  '.dsfm-chips{display:flex;flex-wrap:wrap;gap:4px}',
  '.dsfm-chip{font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:6px;padding:0 6px;color:var(--dsw-alias-label-secondary,#888)}',

  // ── 弹框 ──────────────────────────────────────────────────────
  '.dsfm-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}',
  '.dsfm-modal{background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);border-radius:14px;box-shadow:0 12px 48px rgba(0,0,0,.25);box-sizing:border-box;max-height:86vh;overflow-y:auto}',
  '.dsfm-use-modal{width:min(560px,94vw);padding:18px 20px;display:flex;flex-direction:column;gap:12px}',
  '.dsfm-modal-title{font-size:15px;font-weight:600}',
  '.dsfm-modal-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888)}',
  '.dsfm-field{display:flex;flex-direction:column;gap:4px}',
  '.dsfm-field>label{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666)}',
  '.dsfm-token-row{display:flex;gap:8px;align-items:center}',
  '.dsfm-token-row .dsfm-input{flex:1;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
  '.dsfm-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);line-height:1.5;word-break:break-word}',
  '.dsfm-token-note{color:var(--dsw-alias-state-success-primary,#2a7d3c)}',
  '.dsfm-modal-ops{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}',
  '.dsfm-check{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-primary,#222);cursor:pointer;user-select:none}',
  '.dsfm-check input[type=checkbox]{width:15px;height:15px;margin:0;accent-color:var(--dsw-alias-brand-primary,#1668e3);cursor:pointer}',
  '.dsfm-summary{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 5%,transparent)}',
  '.dsfm-summary>dt{font-size:12px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap}',
  '.dsfm-summary>dd{font-size:12px;color:var(--dsw-alias-label-primary,#222);margin:0;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}',
  '.dsfm-success{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:4px 0}',
  '.dsfm-success-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--dsw-alias-state-success-primary,#2a7d3c)}',
  '.dsfm-success-icon{width:20px;height:20px;border-radius:50%;background:var(--dsw-alias-state-success-primary,#2a7d3c);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;flex:none}',

  // ── 移动端适配（宿主设置面板窄屏 / 手机浏览器）──────────────
  // 原则：工具栏可换行、卡片纵向堆叠（按钮独占一行）、双层网格退化为单列、
  // 弹框贴边；列表最大高度放宽由页面自然滚动。
  '@media (max-width: 640px){',
  '  .dsfm-list{max-height:none;overflow:visible}',
  '  .dsfm-toolbar{flex-wrap:wrap}',
  '  .dsfm-toolbar .dsfm-input{flex:1 1 100%;min-width:0}',
  '  .dsfm-count{white-space:normal}',
  '  .dsfm-tabs{gap:5px}',
  '  .dsfm-tab{padding:3px 12px;font-size:12px}',
  '  .dsfm-card{padding:9px 10px;border-radius:8px}',
  '  .dsfm-card-top{flex-direction:column;align-items:stretch;gap:8px}',
  '  .dsfm-card-top .dsfm-btn-primary{width:100%;padding:8px 14px;font-size:13px}',
  '  .dsfm-name-row{gap:6px}',
  '  .dsfm-details{grid-template-columns:minmax(0,1fr);gap:2px 0}',
  '  .dsfm-details>dt{margin-top:6px;white-space:normal}',
  '  .dsfm-summary{grid-template-columns:minmax(0,1fr);gap:2px 0;padding:8px 10px}',
  '  .dsfm-summary>dt{white-space:normal;margin-top:5px}',
  '  .dsfm-token-row{flex-wrap:wrap}',
  '  .dsfm-token-row .dsfm-input{flex:1 1 100%}',
  '  .dsfm-token-row .dsfm-btn{flex:1 1 auto}',
  '  .dsfm-use-modal{width:100vw;max-width:100vw;min-height:100%;border-radius:0;max-height:100vh;overflow-y:auto;padding:14px 14px 18px}',
  '  .dsfm-backdrop{align-items:stretch;padding:0}',
  '  .dsfm-modal-ops{position:sticky;bottom:0;background:var(--dsw-alias-bg-base,#fff);padding:10px 0 2px}',
  '  .dsfm-modal-ops .dsfm-btn{flex:1}',
  '  .dsfm-check{font-size:12px;line-height:1.4;align-items:flex-start}',
  '}',
  // 中窄屏（平板竖屏 / 桌面窄分栏）：卡片按钮不下压，只收紧间距。
  '@media (min-width: 641px) and (max-width: 860px){',
  '  .dsfm-card{padding:9px 11px}',
  '  .dsfm-toolbar .dsfm-count{display:none}',
  '}',
]

/** 注入样式表（幂等；bundle 可能被宿主重新加载）。 */
export function injectStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(CSS_ID) !== null) return
  const style = document.createElement('style')
  style.id = CSS_ID
  style.textContent = css.join('\n')
  document.head.appendChild(style)
}
