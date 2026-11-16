# Adsterra Native（无 iframe）格式对账实验 — 2026-11-16 起

> 起因：法老转述「Adsterra 去掉 iframe 收益更高」。核对结论：Banner 单元后台**没有**非 iframe 代码选项（法老已确认），
> 所以「去掉 iframe」在本站唯一可执行的形态 = **Native Banner**（unit 31317669，创意以 `<a><img>` 内联进页面 DOM）。
> 目标：2-3 天内拿到「Native CPM vs iframe Banner CPM」的同窗口对照，而不是拍脑袋。

## 一、实验设计（为什么这样切）

| 项 | 内容 |
|---|---|
| 测试组 | 66 个 en BP3 关卡页 → 正文位改 Native Banner（`src/data/native-test-pages.ts`） |
| 对照组 | 另外 66 个 en BP3 关卡页 → 保持 300×250 iframe |
| 分组方法 | GA4 近 7 天 pagePath PV **降序交替**二分（不是按量对半切）：测试组 4,785 PV/7d ≈ 684/天，对照组 4,629 PV/7d ≈ 661/天，页面质量匹配 |
| 分账口径 | Adsterra 按 **placement** 分账：Native unit 31317669 的曝光全部来自测试组；banner unit 31836413 的曝光来自对照组 + 其它 96 页 → 两个单元天然不重叠，**无需时间前后对比** |
| 观测窗口 | 2026-11-16 部署起，3 天 |
| 时区 | 一律 `timezone=GMT+08:00`（后台默认 GMT+0 会把同一天劈成两个桶） |

## 二、部署前基线（Adsterra 后台，zone=gridpaw.com，GMT+8）

**11-02 → 11-16 按 placement：**

| placement | imp | CPM | net |
|---|---|---|---|
| 300×250 (31836413) | 9,173 | **$0.364** | $3.34 |
| 320×50 mobile (32144309) | 8,020 | $0.086 | $0.69 |
| 160×600 (31688449) | 889 | $0.473 | $0.42 |
| 728×90 (32144316) | 610 | $0.159 | $0.10 |
| 合计 | 18,692 | $0.243 | $4.55 |

**10 月 Native 时代（09-20 → 10-31，同一站同一账号）：**

| placement | imp | CPM | net |
|---|---|---|---|
| NativeBanner (31317669) | 143 | **$1.649** | $0.24 |
| 300×250 (31836413) | 3,446 | $0.370 | $1.27 |
| 160×600 (31688449) | 330 | $0.710 | $0.23 |

→ 10 月实测 Native 是 banner 的 **4.5 倍**（n=143，量小但方向明确）。这次就是验证这个倍数在当前流量结构下是否成立。

**按国家（11-02 → 11-16）：** US 3,796 imp / CPM **$0.459**；UK 1,552 imp / $0.231。
法老「美国 CPM 才 0.5」的体感与此完全对得上——banner 形态下美国量最大（20% imp）、CPM 却只有 $0.46。

## 三、预期与判据

- 测试组 ≈ 684 PV/天 → Native 约 600-700 imp/天，3 天约 1,800-2,100 imp。
- 判据不是「绝对收入涨了没有」（绝对额只有几毛），而是 **unit CPM 比值**：
  - Native CPM ≥ 2× banner CPM → 方向成立，值得讨论怎么开（受限于 10-15/10-29 两次投诉的形态记忆）
  - Native CPM ≈ banner CPM（<1.3×）→ 这条建议在本站不成立，直接结案、清空清单
- 统计噪声：日 CPM 最近 10 天在 $0.14–$0.30 之间摆动（CV≈30%），所以 4.5× 这种量级能读出来，20-30% 的差异读不出来——不要用小差异下结论。

## 四、风险与铁律（没变）

- Native 卡片是 **10-15 Reddit「ads immediately redirect」+ 10-29 第二次跳转投诉的直接形态来源**。这次只放 66 页、限 3 天，blast radius 受控。
- **任何一起跳转投诉 = 清空 `NATIVE_TEST_PATHS` 数组当天回滚**，不辩护。
- 上传的 changelog 2026-11-07 条目有一句「an ad is a fixed rectangle with an Advertisement label above it」——
  Native 卡片严格说不是「fixed rectangle」。本次实验未改该文案（3 天内部对照，非永久形态）；若决定长期开 Native，**这句必须先改再上**。
- 回滚：`src/data/native-test-pages.ts` 清空数组 → InContentAd 全站回 iframe。

## 五、执行记录

- 分支 `exp/native-banner`（worktree `/Users/frank/workspace/gridpaw-exp-native`），commit `0483689`
- 本地验收 17/17（`probe-native-format.py`）：测试页正文位 0 iframe / 对照页仍 300×250 / 移动端只出 320×50 /
  `?embed=1` 与 `gp_ads_free` 全静默 / 侧栏 banner 的 atOptions 时序未被 native loader 打乱 / native 盒占位 260px
- 生产部署：`bash scripts/deploy.sh` 全绿，指纹 `0483689-dirty`；线上抽查 level-33（native，300×250 key=0）、
  level-36 / level-45（banner，native 容器=0）
- 读数脚本：`scripts/exp-native-report.sh [start] [end]`
