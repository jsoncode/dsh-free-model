/**
 * dsh-free-model —— OpenRouter 免费模型浏览/一键配置插件 · 宿主半边。
 *
 * - `/dsh-free-model/api` HTTP 路由（webServer 注册 + 浏览器信任围栏）：浏览器半边
 *   （设置 → 免费模型 tab）经 fetch POST JSON 调用，op 分发见 ops.ts：
 *   `models`（拉取/缓存免费模型）、`status`（路由与凭据状态）、`checkToken`、
 *   `useModel`（写凭据 + settings.yaml 路由，创建可直接使用的模型配置）。
 * - 模型缓存落 $DSH_HOME/dsh-free-model.json；OpenRouter Token 只经 credentials
 *   服务落 .credentials.yaml，本插件不存储任何密钥。
 * - 无模型工具、无对话命令：设置页是唯一入口。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主/插件目录解析，本文件不含任何绝对路径。
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-free-model";
/**
 * 必需服务：settings（路由写入）与 credentials（Token 存储）。
 * webServer / webRuntime 为可选依赖，用 ctx.get 读取（headless 等组合缺失时
 * 仅跳过路由注册并告警，不影响插件其余部分）。
 */
export declare const inject: string[];
/** 宿主插件入口：解析数据目录并注册浏览器 HTTP API。 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map