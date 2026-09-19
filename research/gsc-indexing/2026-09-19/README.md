# GridPaw GSC Request Indexing - 2026-09-19（手动轮：TDK 改版重提交）

## 背景

9/19 晚部署了 8 页 TDK 改版（commit `6e38f0a` + 内链 `537b40e`），Google 手里是旧缓存，主动 Request Indexing 加速重抓。 IndexNow 只对 Bing 生效，Google 必须走 GSC UI。

## 提交结果（ego-browser，task space 按名创建后已关闭）

| URL | 结果 |
|---|---|
| `https://gridpaw.com/`（首页，41 曝光 0 点击） | ✅ 已将网址添加到优先抓取队列 |
| `https://gridpaw.com/akari/how-to-solve/` | ✅ 已将网址添加到优先抓取队列 |
| `https://gridpaw.com/akari/how-to-play/` | ✅ 已将网址添加到优先抓取队列（首轮超时为误报，单次重试确认 queued） |

- 配额：提交 3 发，**0 次撞「超出了配额」**（与 9/15「每轮 1-2 发」的实测不同，记录事实不推测原因）。
- 未提交：`/akari/`、`/akari/solver/`、`/tips/`、`/akari/rules/`、`/akari/levels/hard/`（同样改了 TDK）——留给明天 09:30 cron，若配额允许会自然覆盖。

## 技术备注（给下轮 ego-browser 操作者）

- task space 选择**不跨 nodejs 进程持久**，每次调用开头都要 `useOrCreateTaskSpace`；关闭用名字字符串 `completeTaskSpace('gridpaw-request-indexing', {keep:false})`。
- 运行时无 `sleep`，用 `new Promise(r=>setTimeout(r,ms))`。
- `js()` 的页面上下文会保留之前的 `const` 声明，注入脚本一律包 IIFE。
- 复查以各 URL 的 `lastCrawlTime` 为准（明早 cron 自动做）。
