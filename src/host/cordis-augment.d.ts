/**
 * 宿主 Context 的服务类型增强（声明合并）。
 *
 * 说明：插件用到的 settings / credentials / webServer / webRuntime 服务由宿主
 * 侧插件提供，类型链在插件工程内不完整；这里显式增强反射读取 get<T>(name)
 * 的签名（运行时由 cordis reflect 支持），保持插件侧类型安全，与 dsh-jenkins
 * 的做法一致。
 */
declare module '@deepseek-ai/cordis' {
  interface Context {
    /** 反射层提供的服务读取（context proxy 运行时委托给 reflect）。 */
    get<T = unknown>(name: string): T | undefined
  }
}

export {}
