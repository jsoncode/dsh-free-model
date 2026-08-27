import { jsx as _jsx } from "react/jsx-runtime";
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
import { injectStyles } from "./styles.js";
import { makeRun } from "./rpc.js";
import { t } from "./i18n.js";
import { FreeModelsSection } from "./components/FreeModelsSection.js";
/** 设置弹框里本插件 tab 的注册 id（settings.section 的 only 过滤键）。 */
const SECTION_ID = 'dsh-free-model';
export function createPlugin() {
    return {
        name: 'dsh-free-model',
        inject: ['slots'],
        apply(ctx) {
            const slots = ctx.get('slots');
            if (slots === undefined)
                return;
            injectStyles();
            const run = makeRun();
            // ─── 设置弹框 tab：免费模型（settings.section list 插槽）──────
            // order 40：排在宿主内置 sections（models=10 等）之后；label 用 thunk
            // 跟随界面语言。组件经闭包拿到 run，无需 inject 面。
            slots.inject('settings.section', () => slots.register({
                name: 'settings.section',
                id: SECTION_ID,
                order: 40,
                label: () => t('nav'),
            }, () => _jsx(FreeModelsSection, { run: run })));
        },
    };
}
