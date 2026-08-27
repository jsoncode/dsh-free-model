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
/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
    get<T = unknown>(name: string): T | undefined;
}
export interface ClientPluginModule {
    name: string;
    inject: string[];
    apply(ctx: ClientCtx): void;
}
export declare function createPlugin(): ClientPluginModule;
//# sourceMappingURL=plugin.d.ts.map