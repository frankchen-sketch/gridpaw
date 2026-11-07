# Adsterra 重启 · 新会话起跑简报（2026-11-07）

> 本文件给**新会话**读。读完直接按第 4 节顺序执行，不要回头重读历史。

## 1. 决策（法老 2026-11-07 拍板）

- **站点定位转向**：gridpaw 从"游戏站"改为"**攻略站**"（entity 不再定位为游戏网站）
- **变现**：Mediavine Journey 门槛要时间，所以**先恢复 Adsterra 做收益**，Journey 过审后再撤 Adsterra
- **格式限制**：法老原话"不做跳转的 socialbar 就可以了吧"

## 2. 必须先纠正的一个前提（本会话已当面纠正过，别退回去）

"不做 Social Bar 就安全"**不成立**。STATUS.md 10-21 取证结论：

- mcfroogle 投诉"ads immediately redirect"→ 判定为**误点 Native 卡片 → 落地页后退键劫持**
- 8qudbn 会话全程复核：**没有**无点击自动跳转事件
- 即：**跳转伤害发生在广告落地页，不在我们选的格式上**

所以干净的定义是：**只上不打开新标签的纯展示 banner**。Native 卡片虽然 CPM 最高（$3.08-3.21 vs banner $0.22-0.78），但它是上一次投诉的直接来源，默认**不恢复**；要恢复必须单独说服法老。

## 3. 现状事实（都来自 STATUS.md，别重新发明）

| 项 | 值 |
|---|---|
| 撤掉日期 | 2026-10-29 全线撤（Adsterra 三组件 `ADSTERRA_OFF=true`） |
| 撤掉原因 | 两周内两起独立零点击跳转投诉；DLES.gg 10-28 除名 |
| 扩量两周真实收入 | **$0.89**（2133 imp / 4 clicks / CPM $0.42），10-12→10-26 |
| 收入结构 | BP3 的 300×250 占 84% imp；US 贡献 44% 收入 |
| 内容页流量 | 28 天 645 会话中仅 6% 落在内容页（**攻略站定位后这个数会变，但要重新测**） |
| 单元 ID | gridpaw Native 31317669 / gridpaw 160×600 31688449 / BP3 300×250 31836413 / furriq Native 31420265 |
| 法律文本现状 | `terms` §7 已改为"currently runs without ads；若恢复只在信息页与棋盘旁、不入谜题，上线前更新本页与隐私政策"；`privacy` cookie 表 Adsterra 行标 (historical) |
| 恢复纪律（AGENTS.md 硬约束） | 先 `/changelog/` 公告 + 单独邮件 Peter（DLES.gg 站长）才许上线；游戏页/首页/`?embed=1` 零文内广告红线；跳转类格式永不使用；任何一起跳转投诉=当天撤不辩护；新网络=新组件，不重开 Adsterra kill switch |

## 4. 待核实三件事（先查，别猜）

1. **Mediavine 是否要求独占**——上线 Journey 前是否必须撤掉其他广告网络；申请期挂 Adsterra 是否影响审核。查 `publishers.mediavine.com` + journeymv.zendesk.com 原文；查不到就明说"未核实到"，**不要编政策**
2. **Adsterra 后台单元状态**——三个 unit 是否仍 Active、有没有被拒；`GET /api/placements/<site_id>/extended` 口径见 STATUS 10-21
3. **DLES.gg 是否接受恢复**——Peter 的邮件是硬闸，先问再上

## 5. 执行顺序（六道闸，不能跳）

1. `/changelog/` 公告：说明恢复广告 + 只上静态 banner + 零跳转承诺
2. 改 `terms` §7 + `privacy` cookie 表（把 Adsterra 行从 (historical) 改回在用，并写清格式限制）
3. 邮件 Peter（DLES.gg）—— 等回复
4. 代码恢复：`AdSlot.astro` / `InContentAd.astro` / `SideAd.astro` 的开关；**只开 banner 类**，`native` 保持 false
5. 本地验收（Playwright + 截图 + 零横向溢出 + CLS 预留高度），**部署需法老单独批准**
6. 上线后 14 天观察：Adsterra 后台 imp/CPM + GA4 内容页会话 + 任何跳转投诉（当天撤）

## 6. 攻略站版的广告位方案（建议，待法老确认）

| 位置 | 格式 | 说明 |
|---|---|---|
| 攻略正文（视频下方） | 300×250 in-flow | 主力位，全站攻略页铺 |
| 桌面右 gutter | 160×600 sticky | 零伤害，保留 |
| 游戏页 / 首页棋盘 | 无 | 保留红线（Shikaku 首页还有排名） |
| Native 卡片 | 无 | 不恢复 |
| Social Bar / Popunder / Smartlink | 无 | 永久禁用 |

## 7. 收益预期（防止两周后误判"白干"）

按自家数据 CPM $0.4-1.5：攻略站广告收入现实是**先有 30-50 个有排名的攻略页，才有每月三位数**。
现在的价值是"链路通、后台在跑数"，不是现金流。Rooms & Exits 11 关今天自然流量为 0，刚上线未收录。

## 8. 相关文件

- `STATUS.md` 行 43（CPM 审计 + 跳转取证）、97（扩量 v2）、98（BP3 300×250）、102（两周复盘）、884（Journey 门槛核实）、903（terms 改写）
- `AGENTS.md`「广告全线关闭」段（恢复纪律原文）
- 组件：`src/components/AdSlot.astro`、`InContentAd.astro`、`SideAd.astro`
- skill：`ad-network-monetization`
