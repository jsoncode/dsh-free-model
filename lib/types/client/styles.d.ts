/**
 * dsh-free-model —— 浏览器半边：样式注入（与 dsh-jenkins 相同的 bundle CSS 注入模式）。
 * 只消费宿主 --dsw-* 语义令牌（带回退值），不写死颜色。
 */
export declare const css: string[];
/** 注入样式表（幂等；bundle 可能被宿主重新加载）。 */
export declare function injectStyles(): void;
//# sourceMappingURL=styles.d.ts.map