/**
 * dsh-free-model —— 插件数据文件（$DSH_HOME/dsh-free-model.json）。
 *
 * 唯一存放内容是最近一次成功拉取的免费模型缓存（列表已排序）+ 拉取时间，
 * 供设置页秒开与「网络全部失败时降级展示旧数据」。不存放任何密钥
 * （OpenRouter Token 只经 credentials 服务落 $DSH_HOME/.credentials.yaml）。
 *
 * 路径解析优先级：settings documentPath 所在目录 → $DSH_HOME 环境变量 → ~/.dsh。
 * 写路径为进程内串行队列 + 临时文件 rename 原子写；损坏文件备份为 .bak。
 */
import type { FreeModel } from './types.ts';
/** 数据文件格式版本（预留演进）。 */
export declare const STORE_VERSION = 1;
/** 数据文件名。 */
export declare const STORE_FILE = "dsh-free-model.json";
/** 数据文件内存形态。 */
export interface PluginStore {
    version: number;
    /** 最近一次成功拉取的免费模型（created 倒序）。 */
    models: FreeModel[];
    /** 拉取完成时间（epoch ms）。 */
    fetchedAt: number;
}
/**
 * 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
 * 结果进程内缓存（宿主运行期目录不会变化）。
 * @param settingsDocPath - settings 服务的用户文档绝对路径（可为空）。
 * @returns 数据目录绝对路径。
 */
export declare function resolveStoreDir(settingsDocPath?: string): string;
/**
 * 读取数据文件。
 * @param dir - 数据目录。
 * @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
 */
export declare function loadStore(dir: string): Promise<PluginStore | null>;
/**
 * 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。
 * @param dir - 数据目录。
 * @param store - 要写入的完整 store。
 * @returns 写入完成后兑现。
 */
export declare function saveStore(dir: string, store: PluginStore): Promise<void>;
//# sourceMappingURL=store.d.ts.map