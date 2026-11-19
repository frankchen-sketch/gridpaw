# AdSense 重申前审计（2026-11-19）

> 背景：gridpaw 2026-10-13 被 AdSense 拒（「低价值内容」），10-14 起整改、10-25 批次 1+2 上线，但**从未重申**。2026-11-19 法老要求「再提一次审核 + 再做一次审计」。
> 结论：**0 blocker / 0 fail，4 项卫生整改后提交**（commit `4f71107`，生产指纹 `4f71107`）。

## 一、哥飞 adsense_audit（MCP，实扣 3 积分）

调用：`mcp__webcafe_seo__adsense_audit(site="gridpaw.com")`

| 指标 | 值 |
|---|---|
| decision | ready |
| total / pass / fail | 73 / 18 / 0 |
| blockers / high / medium | 0 / 0 / 0 |
| unknown | 52（AI 判定组整组 aiError，不是站点问题） |
| na | 3 |
| 抽样 5 页词数 | 2852 / 1034 / 1098 / 1058 / 1846 |
| ads.txt | ✅ 有 google 行（pub-5225990079437405） |
| About/Contact/Privacy/Terms | ✅ 全在 |

**唯一实质缺口 = ADS-PRIV-04 CMP 缺失**。判据：CMP 是「AdSense 代码上线那一刻」的前置，不是审核前置 —— 过审后再配不迟。

⚠️ 报告 `adsenseDetected: true` 是假阳性：pub ID 来自 ads.txt 授权行，线上 `adsbygoogle` 实测命中 0。

## 二、全站免积分复现（474 sitemap URL 逐页实抓）

方法：抓 sitemap-0.xml → 10 并发抓 HTML → 剥 script/style → 分词量词数 + 5-gram shingle 聚类。

### 词数分布（中位 1,079）

| 档 | 页数 |
|---|---|
| <300 | 4 |
| 300–499 | 3 |
| 500–799 | 70（主要德语 BP3） |
| 800–1499 | 298 |
| ≥1500 | 99 |

`<500` 词只剩 7 页，其中 3 页 noindex（offline / refund-policy / terms），真薄页只有 5 个功能页：`/akari/play/` 169、`/badges/` 197、`/elsewhere/` 402、`/contact/` 440、`/akari/create/` 482。

### 5-gram 重复率（去 main 外、剥 script/style；口径 = 每页 vs 全族最大 Jaccard）

| 族 | 页数 | 中位 | ≥0.40 | ≥0.30 | 最高 |
|---|---|---|---|---|---|
| BP3 EN 关卡 | 137 | 0.351 | **49 页** | 81 页 | 0.606 |
| BP3 DE 关卡 | 137 | 0.388 | **54 页** | 107 页 | 0.441 |
| R&E | 62 | 0.034 | 0 | 0 | 0.052 |
| pt-br | 37 | 0.172 | 0 | 0 | 0.181 |

高重复集中在 **BP3 L54–136 扩量批**（EN 清单关卡号最小 55）；L1–53 老页已在 10-25 整改中达标。

### 其他实测

| 项 | 结果 |
|---|---|
| 线上广告 | **零** —— `ADSTERRA_OFF=true` 自 2026-11-17（`d1759b6`）全站撤除 |
| sitemap 卫生 | `/terms/`(noindex)、`/refund-policy/`(noindex)、`/offline/`(noindex+无 canonical) 三页在 sitemap 里（矛盾配置） |
| 信任页 | privacy 983w / terms 997w / about 780w / contact 456w，首页页脚四链接齐全，全 200 |
| pictomino 子站 | `/pictomino/community` **81 词**（唯一真薄页，在 pictomino-sitemap） |
| hreflang | **双向已通**（EN 页有 `hreflang="de"`，DE 页有 `hreflang="en"` + x-default） |

## 三、站规模（对比 10-04 那次申请）

| | 10-04 申请时 | 10-21~11-18（28d） | 倍数 |
|---|---|---|---|
| GA4 PV | 1,065 / 月 | **40,923** | ×38 |
| GA4 UV | 491 / 月 | **11,771** | ×24 |
| sessions | 601 / 月 | 16,324 | ×27 |
| GSC | — | **13,803 clicks / 260,315 imp** | — |

分族 GSC（28d）：BP3 EN L1-53 = 4,689 clicks；L54-136 = 1,159；**BP3 DE 全族 137 页只有 187 clicks / 3,156 imp**；R&E 58；meowdoku 492；pt-br 12。

## 四、决策记录：德语 137 页 noindex 方案**撤回**

初版建议「提交前把德语 137 页 noindex 并移出 sitemap」，依据是「占 sitemap 29% 但只占点击 1.35%」。法老质疑「这个改动挺大的啊」后实读正文，判定该依据**不成立**：

1. 德语正文是**流畅可用的逐步解法**（`Ziehe die Kuh zum Mädchen` / `Doppeltippe auf die Lkw-Tür`，ziehen/tippen/wischen 术语正确），每页 11–12 步各不相同
2. 共享的只是免责声明 + FAQ 骨架 + 关卡导航 = **攻略站的正常形态**，不是「自动生成的低价值内容」
3. 逻辑本身不自洽：按重复率算 EN 49 页 ≥0.40 更严重，不动 EN 只因为 EN 有流量 —— **按流量决定谁 noindex = 商业逻辑冒充审核逻辑**

**教训：5-gram 重复率 + 点击占比不能当审核风险判据，必须读正文。** 重复数字只能指出「要去哪里读」，不能直接得出结论。

## 五、本次整改（commit `4f71107`，已部署 生产指纹 `4f71107`）

| # | 改动 | 验证 |
|---|---|---|
| 1 | sitemap 排除 `/refund-policy/`、`/offline/` | 474 → **472** URL |
| 2 | `/terms/` 去 noindex | 产物 robots meta 命中 0 |
| 3 | `/pictomino/community` 补 6 问 FAQ（id=faq），顺带修死锚点 `href="#faq"` | 81 → **402 词** |
| 4 | 德语 BP3 107 页 walkthrough：`<strong>` 完整句复述 → `(dann N weitere Züge)`，与 EN 的 `(then N more)` 对齐 | **425 张卡**，线上旧格式 0 残留 |

第 4 项的具体形态（原 → 新）：

```html
<!-- 原：<strong> 与下面 <p> 首句完全重复 -->
<strong>Ziehe die Kuh zum Mädchen.</strong>
<p>Ziehe die Kuh zum Mädchen. Doppeltippe auf die Lkw-Tür. ...</p>

<!-- 新：与 EN 的 (then 2 more) 一致 -->
<strong>Ziehe die Kuh zum Mädchen (dann 2 weitere Züge)</strong>
<p>Ziehe die Kuh zum Mädchen. Doppeltippe auf die Lkw-Tür. ...</p>
```

单数用 `(dann 1 weiterer Zug)`。剩 30 个德语页用 `Schritt N` + `Schritte 1–3: ...` 格式（本身带范围），无复述问题，不动。

闸门：`pnpm run build` 557 页；`pnpm run verify` = oxlint 通过 / conventions ok / lint:changed 109 文件全规则通过。

## 六、未做（有依据地不做）

| 项 | 为什么不做 |
|---|---|
| BP3 重复率（EN 49 + DE 54 页 ≥0.40） | 每页有独有解法步骤，攻略站常态；改动需 1–2 周，且这些页有真实点击（L54-136 共 1,159 clicks/28d）。**留到过审后**；若再被拒「低价值」则这是下一轮主战场 |
| CMP 部署 | EEA+UK+CH 占 19.7% sessions（3,334/16,935），但 CMP 是上代码前置非审核前置。过审后在后台「隐私与消息」启用 Google CMP，snippet 接线 |
| pictomino 既有 header 低对比 | `#9e9590` 灰字在白底 2.7–2.9:1、`#d47070` 在 `#fff5f0` 3.1:1 —— 真实可读性问题但**非本次改动引入**，跨 12 个 pictomino 页一致，要修得整批改，不影响 AdSense |

## 七、风险提示（下次被拒时先查这些）

1. **BP3 274 页占 sitemap 58%**，103 页 ≥0.40 —— 若重申被拒「低价值内容」，主因大概率在这里
2. **配图版权**：R&E 61 页、BP3 关卡页的截图是从 YouTube 视频抽帧的，版权归视频作者。AdSense ADS-PUB-02（无侵权内容）理论上会碰，实际审核极少因此拒，但这是全站唯一非我方原创的内容
3. **站点规模是加分项**：472 页 / 月 40,923 PV，比 10-04 那次（166 页 / 1,065 PV）强一个数量级

## 八、复现

```bash
# 哥飞初筛（扣 3 积分）
# mcp__webcafe_seo__adsense_audit(site="gridpaw.com")

# 全站免积分复现
cd ~/.hermes/cache/scratch/adsense-audit-1119   # 临时目录，结论已固化到本文
python3 fetch_all.py      # 抓 sitemap 474 URL 全文 → pages.json
python3 analyze.py        # 词数分档 / 薄页清单 / 技术面 / 路径族
python3 dedup_fam.py '^https://gridpaw\.com/brain-puzzle-3-level-\d+/$' 'BP3 EN'
python3 dedup_fam.py '^https://gridpaw\.com/de/brain-puzzle-3-level-\d+/$' 'BP3 DE'
python3 dedup_fam.py '^https://gridpaw\.com/rooms-and-exits/' 'R&E'
python3 hi_dup_list.py    # ≥0.40 的页 + 它的最相似对手

# 硬要求：走代理（否则 Google API 超时）
export HTTPS_PROXY=http://127.0.0.1:33210 HTTP_PROXY=http://127.0.0.1:33210
```

GA4 job：`properties/552793510:runReport`，`hostName` contains `gridpaw.com`；GSC：`sc-domain:gridpaw.com`（SA key `~/.hermes/scripts/furriq-daily-brief-e15ace04af1c.json`）。

**GSC 陷阱**：`containsRegex` 在 v3 API 上实测 400（需 URL-encode 整个正则）；稳妥做法是 `dimensions=["page"]` 一次拉 25,000 行再本地过滤。
**GA4 陷阱**：`country` 维度返回国家**全名**（"United Kingdom"/"Germany"），不是 ISO 码 —— 用 ISO 码过滤会得到 0%。
