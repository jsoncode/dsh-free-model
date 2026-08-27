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
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
/** 数据文件格式版本（预留演进）。 */
export const STORE_VERSION = 1;
/** 数据文件名。 */
export const STORE_FILE = 'dsh-free-model.json';
let cachedDir = null;
/**
 * 解析插件数据目录。优先级：settings documentPath 目录 → $DSH_HOME → ~/.dsh。
 * 结果进程内缓存（宿主运行期目录不会变化）。
 * @param settingsDocPath - settings 服务的用户文档绝对路径（可为空）。
 * @returns 数据目录绝对路径。
 */
export function resolveStoreDir(settingsDocPath) {
    if (cachedDir !== null)
        return cachedDir;
    if (settingsDocPath && settingsDocPath.trim().length > 0) {
        cachedDir = dirname(settingsDocPath);
        return cachedDir;
    }
    const env = process.env.DSH_HOME;
    cachedDir = env && env.trim().length > 0 ? env.trim() : join(homedir(), '.dsh');
    return cachedDir;
}
/**
 * 读取数据文件。
 * @param dir - 数据目录。
 * @returns 有效 store；文件不存在返回 null；损坏时备份为 .bak 并返回 null。
 */
export async function loadStore(dir) {
    const target = join(dir, STORE_FILE);
    let raw;
    try {
        raw = await readFile(target, 'utf8');
    }
    catch (error) {
        const err = error;
        if (err && err.code === 'ENOENT')
            return null;
        console.warn(`[dsh-free-model] cannot read store file: ${target}`, error instanceof Error ? error.message : String(error));
        return null;
    }
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.models))
            return null;
        const models = parsed.models.filter((entry) => entry !== null && typeof entry === 'object' && typeof entry.id === 'string');
        return {
            version: STORE_VERSION,
            models,
            fetchedAt: typeof parsed.fetchedAt === 'number' && Number.isFinite(parsed.fetchedAt) ? parsed.fetchedAt : 0,
        };
    }
    catch (error) {
        try {
            await rename(target, target + '.bak');
        }
        catch { /* 备份失败忽略 */ }
        console.warn(`[dsh-free-model] store file corrupt, backed up to .bak: ${target}`, error instanceof Error ? error.message : String(error));
        return null;
    }
}
/* ── 原子写（进程内串行队列）──────────────────────────────────── */
let writeChain = Promise.resolve();
function doSave(dir, store) {
    return (async () => {
        await mkdir(dir, { recursive: true });
        const payload = JSON.stringify({ version: STORE_VERSION, models: store.models, fetchedAt: store.fetchedAt });
        const tmp = join(dir, STORE_FILE + '.tmp');
        const target = join(dir, STORE_FILE);
        await writeFile(tmp, payload, { encoding: 'utf8' });
        await rename(tmp, target);
    })();
}
/**
 * 保存数据文件（整体替换）。写操作串行化，避免并发写坏文件。
 * @param dir - 数据目录。
 * @param store - 要写入的完整 store。
 * @returns 写入完成后兑现。
 */
export function saveStore(dir, store) {
    const next = writeChain.then(() => doSave(dir, store));
    writeChain = next.catch(() => { });
    return next;
}
