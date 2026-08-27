/**
 * dsh-free-model —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
 */
export declare const LANG: "zh" | "en";
/** 取文案并替换 {var} 占位符。 */
export declare const t: (key: string, vars?: Record<string, string | number>) => string;
/** 宿主错误 code → 本地化文本；未知 code 回退原文。 */
export declare const tErr: (res: {
    code?: string;
    error?: string;
} | null | undefined, fallback: string) => string;
/**
 * 时间格式化（Unix 秒 → 本地日期）。
 * @param unixSeconds - Unix 秒时间戳；0/无效返回 '—'。
 */
export declare const fmtDate: (unixSeconds: number | null | undefined) => string;
/** 缓存时间格式化（epoch 毫秒 → 本地日期时间）。 */
export declare const fmtDateTime: (epochMs: number) => string;
/**
 * Token 数量紧凑格式化：1_000_000 → 1M，131072 → 131K，4096 → 4096。
 * @param n - token 数；null/0 返回 '—'。
 */
export declare const fmtTokens: (n: number | null | undefined) => string;
/**
 * 价格格式化（USD / token）：0 → '$0'；非零保留 3 位有效数字。
 * @param n - 价格数字；null 返回 '—'。
 */
export declare const fmtPrice: (n: number | null | undefined) => string;
//# sourceMappingURL=i18n.d.ts.map