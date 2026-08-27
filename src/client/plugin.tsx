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

import { injectStyles } from './styles.ts'
import { makeRun } from './rpc.ts'
import { t } from './i18n.ts'
import { FreeModelsSection } from './components/FreeModelsSection.tsx'
import type { RunFn } from './rpc.ts'

/** 宿主 slots 服务最小视图。 */
interface SlotsService {
  inject(name: string, fn: () => unknown): unknown
  register(def: Record<string, unknown>, component: unknown): () => void
}

/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
  get<T = unknown>(name: string): T | undefined
}

export interface ClientPluginModule {
  name: string
  inject: string[]
  apply(ctx: ClientCtx): void
}

/** 设置弹框里本插件 tab 的注册 id（settings.section 的 only 过滤键）。 */
const SECTION_ID = 'dsh-free-model'

export function createPlugin(): ClientPluginModule {
  return {
    name: 'dsh-free-model',
    inject: ['slots'],

    apply(ctx: ClientCtx) {
      const slots = ctx.get<SlotsService>('slots')
      if (slots === undefined) return
      injectStyles()
      const run: RunFn = makeRun()

      // ─── 设置弹框 tab：免费模型（settings.section list 插槽）──────
      // order 40：排在宿主内置 sections（models=10 等）之后；label 用 thunk
      // 跟随界面语言。组件经闭包拿到 run，无需 inject 面。
      slots.inject('settings.section', () => slots.register(
        {
          name: 'settings.section',
          id: SECTION_ID,
          order: 40,
          label: () => t('nav'),
        },
        () => <FreeModelsSection run={run} />,
      ))
    },
  }
}
