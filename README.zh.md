# dsh-free-model

<p align="center">
  <img src="assets/logo.svg" alt="dsh-free-model logo" width="72" height="72" />
</p>

**dsh-free-model** 是一个 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness)插件：
浏览 OpenRouter 的**免费模型**，一键把其中任何一个添加到 DSH 模型列表。

- **平台 tab**：设置入口内按平台分 tab（当前内置 OpenRouter；`PLATFORMS` 注册表让后续平台
  接入只需一行）。拉取/过滤/排序都在宿主侧完成，tab 是唯一入口。
- **免费模型目录**：由宿主拉取 `https://openrouter.ai/api/v1/models`，只保留价格为 0
  （prompt 与 completion 同时为 0）或带 `:free` 标记的模型，并按 OpenRouter 的 `created`
  时间**倒序排列——最新上线的模型永远在最上面**。结果缓存到 `$DSH_HOME/dsh-free-model.json`
  （6 小时新鲜窗口；网络重试全部失败时降级展示旧缓存并提示）。
- **卡片展示完整信息**：名称、id（点击复制）、上架时间、上下文长度、最大输出、输入/输出
  模态、分词器、价格、支持的请求参数、内容审核 / 强制推理标记、可展开的完整描述——并支持
  **二次本地搜索**（id / 名称 / 描述 / 厂商）。排版适配窄面板与移动端（卡片纵向堆叠、
  网格退化单列、弹框转为全屏页签）。
- **「添加到模型列表」→ 一键创建模型配置**：仅当该平台**还没有**已存凭据时才要求输入
  OpenRouter API Token（可现场「校验」，调 `GET /api/v1/key`）。确定后：
  1. Token 经宿主 **credentials** 服务落 `.credentials.yaml`（`OPENROUTER_API_KEY`）；
  2. **把模型并入 `settings.yaml` 里的 OpenRouter 路由**（`llm-pi-ai` 命名空间——已有
     `openrouter` / `openrouter-free` / baseURL 指向 openrouter.ai 的路由时并入，原样保留其
     `apiKeyEnv` 与已有模型条目；否则新建 `openrouter-free` 路由，`openai-completions` 协议 +
     `https://openrouter.ai/api/v1`）；
  3. 可选勾选**设为新会话的默认模型**（`agent-default-model` 命名空间）。
  完成后模型立即出现在对话框底部的模型选择器中，**无需重启宿主**。
- **稳健拉取**：所有 OpenRouter 请求失败自动重试，最多 **10 次**（指数退避 + 抖动）。
- 中英双语界面，无硬编码路径。

[English](README.md)

## 命令

| 脚本 | 作用 |
| --- | --- |
| `npm run check` | `tsc -b` 类型检查（host + client 两个 program） |
| `npm run build` | 清理 `lib/`，`tsc -b`，tsdown 打包 `lib/index.js`（宿主，ESM）+ `lib/client.js`（浏览器，`__ModuleLoader__` 工厂） |
| `npm run watch` | tsdown watch 模式 |
| `npm run verify` | 模拟宿主模块加载器校验 `lib/client.js`（工厂形状 + seed 外部依赖） |
| `npm run test:ops` | 宿主逻辑离线单测（免费判定、排序、路由识别、配置写入编排、数据文件往返） |
| `npm run smoke` | 直连真实 OpenRouter `/models` 的冒烟测试 |
| `npm run release` | `check` + `build` + `verify`，然后 `npm version patch` 并 `git push --follow-tags` |
| `npm run publish:npm` | `check` + `build` + `verify`，然后 `npm publish --access public` |

## 安装

```sh
# 本地开发（link 工作区；lib/ 重新构建后自动生效）
dsh plugin --profile web add ./dsh-free-model

# 已发布：npm / tarball / GitHub
dsh plugin --profile web add dsh-free-model
dsh plugin --profile web add github:you/dsh-free-model#<sha>

dsh --profile web --dump-config   # 确认分层
dsh --profile web                 # 启动（宿主半边需要重启后加载）
```

> **本地开发依赖**：宿主经原生 Node ESM 加载 `lib/index.js`，因此插件目录必须能解析
> `@deepseek-ai/schemastery` 与 `@deepseek-ai/dsh-settings`。在插件目录里执行一次
> `pnpm install`，或直接使用仓库内已提交的 `lib/` 构建产物（本仓库提交 `lib/`，与
> dsh-jenkins 一致）。

## 使用

1. 打开 **设置 → 免费模型**，选择平台 tab（OpenRouter）。
2. 列表按上架时间倒序出现（缓存新鲜时秒出；点**刷新**强制回源）。
3. 在搜索框输入关键词本地过滤。
4. 点某个模型的**添加到模型列表**：
   - 仅当平台还没有已存凭据时才出现 Token 输入框（已配置时直接沿用
     `OPENROUTER_API_KEY`，弹框中有提示），
   - 需要的话勾选**设为新会话的默认模型**，
   - 确定——配置写入完成，弹框会显示该去哪里选这个模型。

## 新增一个平台

1. `src/client/components/FreeModelsSection.tsx`：在 `PLATFORMS` 追加 `{ id, labelKey }`，
   并在下方按 id 挂载面板组件。
2. 复制 `src/client/components/OpenRouterPanel.tsx` 作为起点；ops 请求带上
   `platform: '<id>'`。
3. `src/host/ops.ts`：扩展 `runOp` 的平台分发（按平台 API 实现拉取/过滤，映射到
   `RouteModelProfile`，并在 `model-config.ts` 里补该平台的凭据引用与路由命名）。

## 结构

```
├── src/host/*.ts      # 宿主半边：/dsh-free-model/api 路由（按平台分发 op）、
│                      # OpenRouter 拉取过滤排序（10 次重试）、缓存存储、
│                      # 模型配置写入（settings + credentials 服务）
├── src/client/*.tsx   # 浏览器半边：settings.section 平台 tab 外壳、
│                      # 各平台面板（本地搜索、模型卡片）、添加到模型列表弹框
├── lib/index.js       # 宿主半边构建产物（tsdown，ESM），已提交
├── lib/client.js      # 浏览器半边构建产物（tsdown → __ModuleLoader__ 工厂），已提交
├── scripts/           # verify-client.mjs、test-ops.mts（离线单测）、smoke-openrouter.mts（真实冒烟）
├── tsdown.config.ts   # node 半边 + client bundle 包装
├── cordis.patch.yml   # 组合包 patch：按包名引用的插件行
└── package.json       # dsh.bundle + dsh.client(web) 清单 + peerDependencies
```

## 说明

- OpenRouter 免费模型同样需要账号 Token（有每日限额），弹框里有提示。
- 写入走的是官方通道：`settings.update('llm-pi-ai', …)` 会经过 llm-pi-ai 的
  schema 校验（不合法的配置在写入处被拒绝），适配器实时重注册路由——添加模型
  后**无需重启宿主**。
- 对已有 OpenRouter 路由的手工修改（自定义 `apiKeyEnv`、额外字段）会被保留：
  添加模型只重写该路由的 `models` 数组（按 id 合并，同 id 覆盖）。
- 插件从不直接改写 settings / credentials 文件——一切经宿主服务完成；插件自己写的
  唯一文件是模型缓存（`dsh-free-model.json`）。
