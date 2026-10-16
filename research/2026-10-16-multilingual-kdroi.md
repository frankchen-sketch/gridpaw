# 多语言扩展 KDROI 分析 — gridpaw.com（2026-10-16）

## 结论
不开整站语言版本。巴西葡语以 /pt-br/ 子目录 7 页试水（KDROI 100，刚踩线）；
日语零成本观察；西语降级；德语法语砍掉。

## 数据（查询日 2026-10-16）

KD 源 = web.cafe（各国 gl）；搜索量源 = KWP 历史模式（法老 10-16 手动查，地区 BR/ES/JP，所有语言）。
KDROI = KWP 桶低值 / web.cafe KD（桶低值口径，显示值是桶中值）。

| 词 | 地区 | KWP 显示 | 桶低值 | KD | KDROI | 3月变化 | YoY |
|---|---|---|---|---|---|---|---|
| jogos de logica | 巴西 | 5,400 | 1,000 | 10.0 | **100** | +23% | -18% |
| ロジックパズル | 日本 | 6,600 | 1,000 | 16.4 | **61** | 0% | -19% |
| juegos de logica | 西班牙 | 2,400 | 1,000 | 24.0 | **42** | 0% | -21% |
| jogos de raciocinio | 巴西 | 720 | 100 | 26.6 | 3.8 | +22% | 0% |
| puzzles logicos | 西班牙 | 50 | 10 | 7.1 | 1.4 | 0% | +50% |
| akari online | 各语区 | 10 | <10 | 32.7(es) | ≈0 | — | -100%(es) |

## 关键发现

1. **puzzles logicos 是陷阱词**：web.cafe KD 7.1 极易（全场最低），KWP 实测仅 50/月。
   KD 最低 ≠ 值得做，量门控再次拦住一个假蓝海。
2. **akari online 各语区全部 ≤10/月**：gridpaw 在西语 gl 下排 #5 没有商业价值（词本身没量）。
3. 三个头部词 YoY 全部 -18%~-21%（温和衰退，非崩塌，不触发冻结线 -90%）；
   唯一正增长信号：巴西 jogos de logica 三月 +23%。
4. CPC 梯度：日本 $0.44-2.02 >> 巴西 $0.02-0.79 —— 口径 B（游戏内广告）下日本单用户价值最高。

## GSC 信号（API 口径，28d，2026-10-16 拉）

| 国家 | 展示 | 点击 | pos |
|---|---|---|---|
| 巴西 | 152 | 4 | 7.8 |
| 西班牙 | 35 | 3 | 9.3（CTR 8.6% 全表最高） |
| 日本 | 56 | 1 | 5.6 |

## 葡语术语核验（2026-10-16 网搜巴西真实用法）

- **somas cruzadas（Kakuro）✅**：Google Play "Kakuro - Somas Cruzadas"、Steam "Cross Sums (Somas Cruzadas)"、App Store Zenkuro 一致使用。
- **nonograma（Nonogram）✅ 已修**：巴西区全部用 Nonogram/Nonograma + "revelar uma imagem oculta"；初稿的 "gravar desenho lógico" 是生造词已移除，TDK "grava"（错词）改 "pinta células para revelar"。
- **mar（Nurikabe）✅**：竞品 quietpuzzle.com/pt-br/nurikabe/ 同用 "mar"（"o restante das células forma um mar"）。
- **jogos de lógica / jogos de raciocínio 双词✅**：Geniol（"jogos de lógica e raciocínio"）、Poki、RachaCuca 并用，双关键词策略成立。

**竞品情报**：quietpuzzle.com 已在做 PT-BR 本地化谜题页（/pt-br/nurikabe/ 等），是我们 /pt-br/ 的直接同赛道玩家，后续监控其出词。

## 哥飞知识库佐证（2026-10-16 MCP knowledge_ask，8 积分）

- **子目录背书**（群聊 2024-01-23 原话）：「多语言用子目录形式。千万不要用子域名。因为子域名也相当于是新网站，权重不传递。」
- **子目录页不接独立外链**：Canva 案例（社群帖 2026-01-01）——3800 页内容集群靠父页→子页内链传权重，本地化=区域 URL+多语言关键词。对应打法：外链打英文主站，/pt-br/ 靠英文页内链喂。
- **时间窗口**：知识库无直接原话，过会时当面问哥飞。
- 已定：先堆页面（/pt-br/ 7 页），外链同步打英文主站。

## 行动清单

1. **/pt-br/ 子目录，首批 7 页**（首页 + 6 游戏落地页），机翻+术语人审，
   hreflang 互指 + x-default→英文，sitemap 分层，GSC 提交。
2. **日本零成本观察**：不动站，cron/API 周查 country=JPN 的 query 维度，
   出现日语 query 展示 ≥50/月再立项。
3. **西语挂触发器**：country=ESP 出现西语 query 展示 ≥100/月再议。
4. 哥飞过会问题：DR 2 新站第一外语，先堆页面还是先堆外链？
