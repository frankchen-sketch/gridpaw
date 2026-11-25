# 设计稿契约 · 冻结清单（v1.0 + v1.1）

**冻结时间**：2026-11-25
**冻结人**：法老（口头拍板「契约冻结」），执行 Hermes
**范围**：GridPaw 首页改版的设计稿层（`docs/design-v8/` + `~/.hermes/cache/scratch/` 产物）

## 冻结了什么

| 文件 | md5 | 作用 |
|---|---|---|
| `CONTRACT.md` | `4ad3df7c5960a6c7af949b187954e129` | **v1.0**：31 条 + 3 子条（冻结原样，未改动） |
| `CONTRACT-v1.1.md` | `869115044ba6eaf65b2996716f568143` | **v1.1**：v1.0 全部条款 + §J GEO 骨架 C32–C34（2026-11-25 加法升级，取代 v1.0 用于新验收） |
| `tokens.css` | `0cbc058a68b34fb988fa72eaf9d7b2d9` | 13 个色/圆角/阴影变量，唯一样式来源 |
| `contract_check.py` | `701da7336f582237f74296ee476016d6` | 静态条款检查（C2/C3/C8/C15/C19–C23/C28） |
| `style_fp_check.py` | `a5d0aeb2b886f95e8fc563f61b529f33` | 风格指纹（C31），v8 区间 |
| `assemble.py` | `d5bcda75962f933294d925df350bd750` | 分包拼装 + 拼缝检查 |
| `part1-s1-s5.md` | `99706a000ce4fef59c1ed07cd83e1644` | S1–S5 块级规格 |
| `part2-s6-s9.md` | `fb3dc187c5f1dda1aebcdac1b74b88e0` | S6–S9 块级规格 |

## 冻结的验收产物（可复现基线）

| 产物 | md5 | 状态 |
|---|---|---|
| `gp_v9_full.html`（94,989B，9 屏） | `2e55e2305a1122df6e4103a3f0206569` | FAIL 0 / WARN 0，C31 4/4 |
| `gridpaw_v8_agent.html`（94,505B，8 屏） | `d29246c2fbdad436666d01f0fc41cd92` | 风格基准（C31 的区间来源） |

## 没冻结的（故意）

- 三个模型的单屏跑分（`s1_neon/opus/sonnet.*`）：一次性对比，不进合同。
- 线上站点代码：本文件只管设计稿层，生产迁移另见 `PRODUCTION-PLAN.md`。

## 冻结纪律

1. 条款编号、阈值、判据一律不动。发现条款本身有错 → 开 `CONTRACT.md` v1.1，写明「v1.0 那条为什么错、新证据是什么」，不许原地改。
2. 改 `tokens.css` 等于改合同（C8 的白名单在里面），同流程。
3. 检查器改逻辑也要升版号：新检查器必须能在 v8/v9 两份旧稿上复现**原来**的结论，复现不了说明改坏了。

## 版本记录

**v1.1（2026-11-25）**：新增 §J GEO 骨架（C32 llms.txt Key facts / C33 robots AI bot 名单 + Content-Signal / C34 结构化数据只增不减），验收顺序加第 8 步 `gates/geo.mjs`。
> 原因不是 v1.0 写错，而是范围扩大：法老决定把 GEO 从「skill 里的运维说明」升成「合同条款」。v1.0 文件本体一字未动，md5 仍为 `4ad3df7c5960a6c7af949b187954e129`。

## 勘误表（冻结后发现的错误走这里，不改条款）

**E1 · C2 的组件路径不存在。** C2 示例写 `src/components/ShikakuBoard.astro`，但线上 `#play`（`index.astro:718–762`）是**内联区块 + 内联脚本**，没有这个组件文件。
>C2 的**要求**（可玩区块必须标记、占位必须是该游戏自己的形态）不变；变的只是落地方式：迁移时保留原 `#play` 结构与全部 id，不要去找不存在的组件。

---

## 校验方式

```bash
cd ~/workspace/gridpaw/docs/design-v8
md5 -r CONTRACT.md CONTRACT-v1.1.md tokens.css contract_check.py style_fp_check.py assemble.py part1-s1-s5.md part2-s6-s9.md
# 与上表逐行比对，任何一行不符 = 有人动过冻结件
```
