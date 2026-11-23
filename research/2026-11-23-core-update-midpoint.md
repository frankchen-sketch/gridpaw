# November 2026 core update 中期实况（gridpaw.com）

> 调查时间：**2026-11-23 18:20~18:40 CST**
> 触发：法老「你去 x 上搜一下 google 这波算法调整，我看 gsc 23 号分小时还是被打压了流量」
> 结论：**这波是官方承认的 core update，今天仍未结案；「23 号被打压」一半是跨星期几比较的错觉，一半是 update 峰后回吐**

---

## 一、官方状态（一手，非传闻）

来源：Google Search Status Dashboard，页面最后更新 **2026-11-23 02:17 PST**

| 项 | 值 |
|---|---|
| 事件名 | **November 2026 core update** |
| 状态 | **Active（进行中，未结案）** |
| 开始时间 | **2026-11-10 10:06 PST** = 北京时间 11-11 01:06 |
| 受影响产品 | Ranking |
| 日历热图 | Crawling / Indexing / Serving 全绿，**仅 Ranking 一行亮，11-23 那格仍带 incident 标记** |
| Last update 字段 | 11-10 10:07 PST（官方自开始后就再没更新过状态） |

事件 URL：`https://status.search.google.com/incidents/WLxcJyC6jMWMfryxsKMc`

X 圈一致的转述：11-10 开始、两周滚动、**11-24 左右结束**、今年第三次 core update（@InfiniStrategy、@imransafari 均如此表述）。

---

## 二、X 圈信号（2026-11-16 ~ 11-23，60 条去重后筛选）

| 账号 | 内容 | 与本项目的关系 |
|---|---|---|
| @NatePrince_ | 「Google's November core update cut non-branded search impressions to my DTC site by **78%** in a week. Searches for the brand by name went up.」 | **与我们完全同型**：非品牌曝光暴跌、品牌词反而涨 |
| @Zac_Baldwin | 自建站「From 200 → 20 clicks a day」，判定为 November core update 所致 | 同型，量级接近 |
| @JohanesSurya | 「FACEBOOK is quietly WINNING the November 2026 Google Core Update — Facebook: 8.2B monthly clicks from Google. All time high. LinkedIn: Down 48%. Reddit, YouTube, and X: All down from their peaks.」 | 平台站挤压独立站的结构性信号 |
| @InfiniStrategy | 「should finish rolling out around November 24... The strange part is **how quiet the tracking tools have been**.」 | 第三方排名工具数据可疑，别拿来判读 |
| @TheCoolestCool 引 @NozzleIO | 「Since mid-September, Google seems to be sending **fake results to the tools that track your rankings**... checked 27.5 million of these results」 | 同上，且时间点（9 月中）与我们 9-04 建站后的建索引期重叠 |
| @Seo_with_Malik | 吐槽 core update 后的恐慌式 SEO（重写内容/改标题/堆外链） | **正是我们现在必须避免的** |
| @imransafari | 「It started 10 Nov, 10:06 a.m. PT... If you're judging a traffic drop today, you're early. Wait until the Search Status Dashboard marks the rollout [complete]」 | **直接支持「现在别下结论」** |

**结论**：这不是 gridpaw 单独被针对，是这波 update 的普遍现象；而且这波的特点是**非品牌曝光被压缩、品牌词存活、平台站受益**——与我们 11-17 实测（BP3/meowdoku/the-loop 全掉出前 10、品牌词 gridpaw 仍第 1-6）完全一致。

---

## 三、本站实测（GA4 Organic Search 为判据，Asia/Shanghai 日界）

数据源：GA4 属性 `552793510`（timeZone=Asia/Shanghai），维度 `date × sessionDefaultChannelGroup`，09-28 起的完整序列。
脚本：`~/.hermes/scripts/gridpaw-organic-reality.py`（wrapper `gridpaw-organic-reality.sh`，走 email-automation venv）

| 日期 | 星期 | Organic Search | AI 助手 | 总会话 | vs 上同星期 |
|---|---|---|---|---|---|
| 11-11 | 三 | 746 | 48 | 905 | — |
| 11-12 | 四 | 649 | 55 | 851 | — |
| 11-13 | 五 | 658 | 51 | 847 | — |
| 11-14 | 六 | 650 | 41 | 855 | — |
| 11-15 | 日 | 397 | 48 | 573 | -32% |
| **11-16** | **一** | **100** | 48 | 283 | **-87%** |
| **11-17** | **二** | **98** | 77 | 261 | **-84%** |
| 11-18 | 三 | 859 | 114 | 1228 | +15% |
| 11-19 | 四 | 916 | 109 | 1286 | +41% |
| 11-20 | 五 | 1073 | 104 | 1443 | +63% |
| **11-21** | **六** | **1171** | 72 | 1540 | **+80%（峰）** |
| 11-22 | 日 | 473 | 80 | 742 | +19% |
| 11-23 | 一 | 136（到 15:xx） | 77 | 346 | **+36%（vs 11-16 的 100）** |

**形态**：11-15 起塌 → 11-16/17 谷底（基线的 14~15%）→ 11-17 23:00 CST 阶跃恢复 → 11-18~21 连续 4 天上涨至 **+80% 峰值** → 11-22 起回吐 → 11-23 更低但同口径仍高于上周一。

**AI 助手渠道同期翻倍**（26-55 → 72-114），与 Organic 反向 —— 说明这不只是「流量搬家」，AI 入口在这波里确实在长。

---

## 四、周内模式（判读前提，8 周实测）

| 周一 | 周二 | 周三 | 周四 | 周五 | 周六 | 周日 |
|---|---|---|---|---|---|---|
| **304** | 289 | 435 | 460 | 492 | **504** | 366 |
| （18–882） | （17–749） | （10–1229） | （31–1286） | （30–1446） | （19–1542） | （17–743） |

**周一周二是全周最低，周六最高，比值约 1:1.7。**

⚠️ **铁律**：拿周一的小时/日数据跟周六峰值比，必然得出「又被打压了」的假结论。法老这次的感觉就是由此而来 —— 11-23（周一）136 vs 11-21（周六）1171。同口径比（11-16 周一 100 → 11-23 周一 136）实际是**+36%**。

---

## 五、口径修正：GSC 近 4 天数据不可用

**两条曲线在断崖期反向矛盾**，这是本次最重要的方法论发现：

| 日期 | GSC clicks | GA4 Organic | 比值 | 判读 |
|---|---|---|---|---|
| 11-13 | 801 | 658 | 0.82 | 正常 |
| 11-14 | 681 | 650 | 0.95 | 正常 |
| **11-15** | **72** | **397** | **0.18** | **矛盾**（GSC 报塌，GA4 只掉 39%） |
| **11-16** | **51** | **100** | 0.51 | 矛盾 |
| **11-17** | **712** | **98** | **7.3** | **反向矛盾**（GSC 说恢复了，GA4 说是谷底） |
| 11-18 | 1071 | 859 | 0.80 | 正常 |
| 11-19 | 1107 | 916 | 0.83 | 正常 |
| 11-20 | 1207 | 1073 | 0.89 | 正常 |
| **11-21** | **676** | **1171** | **0.58** | 矛盾（GSC 未回填完） |
| 11-22 | 无数据 | 473 | — | GSC T+2 未出 |

**结论**：GSC 日级数据在最近 2-4 天处于未回填状态，且 11-15~17 那三天本身就不可靠。
**判据只能以 GA4 Organic Search 为主**（实时采集，不受回填影响），GSC 仅作 4 天前的交叉验证。

这也直接推翻了 11-17 那次基于 GSC 的「整站降权、曝光只剩 8.7%」的部分结论 —— 数值是当时 GSC 的呈现，但**数据本身不完整**。

---

## 六、11-21 快查 job 结论修正

`46998d75dddb`（撤广告 4 天快查，11-21 09:02 跑完）的结论是：

> 「撤广告的当天（PT 11-17 只有第一个小时还带广告）曝光就回到 12,431，随后 11-18/19 分别到 17,941、19,155，比崩盘前两天的基线 15,816 分别高 13% 和 21%... 核心更新官网至今仍未结案（没有 end 字段），因此早期信号明确指向**广告是主因**，core update 不是单独作用」

**这个推理有两处缺陷：**

1. **「未结案」恰恰说明 core update 仍在滚动重算**，恢复点 11-17 23:00 CST = **07:00 PT**（Google 日更边界）与撤广告（17:03 CST）仅相隔 6 小时，两因在时间上完全重合，**逻辑上无法分离**；
2. **若广告是主因，撤除后应稳定在高位**。实际 11-22 掉到 473（vs 11-21 的 1171，-60%）、11-23 周一 136 —— update 期典型的「先塌 → V 反 → 再回吐」洗牌形态，比「撤广告一次性修复」更符合观测。

**修正后的归因**：**仍未定。** 要分离必须在 core update 正式结案（官方预计 11-24）之后，看 11-24~30 的稳定形态：
- 稳定在基线（650-750）以上 → update 给了正向重估，广告非主因
- 跌破基线 20%+ → 回到 site-level quality demotion，B 路线进议程
- 持平 ±20% → 归因无法分离，按 STATUS.md 三路线等 12-02 终审

---

## 七、X 搜索的复现方法

```bash
export HTTPS_PROXY=http://127.0.0.1:33210 HTTP_PROXY=http://127.0.0.1:33210 ALL_PROXY=socks5://127.0.0.1:33210
# ⚠️ xurl 不支持 -filter:replies（会报 invalid operator），别带
xurl search '"Google core update"' -n 25
xurl search '"Google algorithm update"' -n 25
# 批量脚本（合并去重 + 按互动量排序）
python3 ~/.hermes/cache/scratch/xsearch-galgos.py --n 25
```

数据脚本：
```bash
export HTTPS_PROXY=http://127.0.0.1:33210
bash ~/.hermes/scripts/gridpaw-organic-reality.sh --days 18
```

---

## 八、行动结论

1. **现在什么都别改**。update 仍在 Active，此刻任何 SEO 改动在结案后的新洗牌里无法归因，等于把变量叠在变量上。
2. **11-24** 看官方 dashboard 是否转 Resolved。
3. **11-25**（job `3490afb1c839`）用 11-24 起的数据做初查；**12-02**（job `d58479593939`）终审三路线。
4. 判读一律：**GA4 Organic Search 为主 + 同星期几对齐 + GSC 近 4 天不用**。
5. **别做的事**（@Seo_with_Malik 列的正是 core update 后最容易犯的错）：重写内容、批量改 title、堆外链、砍页 noindex —— 在 update 结案前全部无法归因。
