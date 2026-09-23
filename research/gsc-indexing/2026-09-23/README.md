# GSC Request Indexing — 2026-09-23

## 本轮提交

| URL | UI 结果 | API 复核 |
|---|---|---|
| https://gridpaw.com/community/ | ✅「已将网址添加到优先抓取队列」（截图：community-request-indexing.png） | 提交后约 6 分钟与 ~20 分钟两次复核均 `Discovered - currently not indexed`、`lastCrawlTime = None`（抓取未获确认，与既往多轮同一模式；原因未知，不做推测） |

- 检查结果：`已发现 - 尚未编入索引`；发现区：sitemap-0.xml + sitemap.xml，引荐来源网页 https://gridpaw.com/solver/（非孤岛页）。
- 未撞配额；首个点击即触发「正在测试实际网址」，约 20s 后出现成功面板。

## 未提交

- https://gridpaw.com/privacy/ —— 2026-09-22 已判定：live 页面带 noindex 与 sitemap 条目矛盾，Request Indexing 必然无效，不浪费配额。本轮 API 复核其状态仍 `Discovered - currently not indexed`、lastCrawlTime=None（仅观察，未提交）。

## 环境异常记录（本轮新发现）

- mini 系统代理 127.0.0.1:7890 对 Cloudflare 站点（gridpaw.com / furriq.com）TLS 间歇性失败（UNEXPECTED_EOF），对 google 系域名时好时坏。
- 解决：`NO_PROXY` 加 `gridpaw.com` 让 sitemap 拉取直连（直连 200 正常）；Google API 保持走代理。
- 复核脚本改用「python 只拿 token + curl 每次新连接发请求」，避开 urllib3 keep-alive 连接池被代理回收导致的间歇 SSL EOF。

## 剩余未收录（下次 cron 继续）

- https://gridpaw.com/community/ —— 仍是唯一真实 pending 收录目标（已发现·尚未编入索引）。
- https://gridpaw.com/privacy/ —— noindex 矛盾问题，需站点侧决策（从 sitemap 移除或去掉 noindex），非提交能解决。
