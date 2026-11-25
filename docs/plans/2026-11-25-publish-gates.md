# 发布闸门第二轮 + 预警巡查兜底（任务书）

> 2026-11-25 起。第一轮（sha 血统 / main 只收 ff / 按 sha 出包 / I1-I2 不变量）已落在
> 分支 `ops/2026-11-25-publish-decouple`。本文定第二轮（发布时刻的闸门）与第三轮
> （预警 + 巡查兜底 + 飞书总管联动）。

## 一、第一轮解决了什么、还剩什么

第一轮修结构性错误：**发布单元从「工作树」改成「提交 sha」**，main 只收 fast-forward。
剩下的事故面共性相同 —— **退出码 0，但结果是错的**：

| 事故面 | 现实证据 |
|---|---|
| 并发顶掉：构建那几分钟 main 被推进，旧 sha 的包上线 = 整包回滚别人的改动 | train `deploy_lane` 有复核，`deploy.sh` 没有 |
| 重复部署：手工发一次就绕过幂等，I1 对账把人工上线误报成「没上线」 | deploy-state 只在 train 里写 |
| 内容没更新却「发布成功」 | 今天 Loop 日更：脚本 exit 0，线上没有今日页 |
| 部署成功但线上还是旧包 | gridpaw 有 sw.js 指纹校验，furriq / hexa 没有 |

## 二、第二轮：发布时刻的闸门（G3–G6）

全部 fail-closed，全部带逃生口，全部只在「不可逆那一步」前后拦。

| 闸门 | 判据 | 拦截点 | 失败行为 | 状态 |
|---|---|---|---|---|
| **G3 发布基线复核** | `ls-remote origin main == BASE_SHA` | 拿锁后 + `wrangler` 前各一次 | `exit 8` 让位，不出包 | ✅ 已落 |
| **G4 产物指纹闭环** | 线上 `sw.js` 的 `CACHE_VERSION` == 本次构建指纹 | 部署后自检 | `exit 4`，**不写 deploy-state** | ✅ gridpaw 有；待推广 |
| **G5 内容新鲜度** | 日更产物必须含「今天」：文件名日期 + `publishedDate` + title 非空 | 发布器出包前 | `exit 9`，卡上写「今天没数据」 | ✅ 已落（dry-run 绿，待首次真跑） |
| **G6 幂等** | `deploy-state.sha == 目标 sha` 且 `ok` | 出包前 | `exit 0` 打印「幂等已部署」；`FORCE_REDEPLOY=1` 强制 | ✅ 已落 |

G5 是今天事故的直接补丁：**「数据落了盘」不等于「页面上线了」**，闸门要验的是产物内容。

## 三、第三轮：预警 + 巡查兜底（不新增一套系统）

三条不变量，全部复用已有出口（ops.db checks / 站点巡检 / 21:30 检查回顾 / 飞书卡）：

| 不变量 | 判据 | 频率 | 出口 |
|---|---|---|---|
| **I1 合了没上线** | `origin/main sha != deploy-state.sha` | 15 min | 出卡（tell: needed，已改） |
| **I2 在飞不落地** | 分支静默 > 12h 未合 | 15 min | 出卡 + 进待合并台账 |
| **I3 线上是这份包** | 线上指纹 == `deploy-state.sha` 对应版本；今日产物 URL 200 且含今日日期 | 5 min（站点巡检） | 红卡 |
| **I4 破例部署** | 出现 `--allow-unmerged` / `FORCE_REDEPLOY` 记录 | 实时 | 出卡，21:30 回顾点名 |

- 每条不变量同时写一条 `ops-check --target <repo> --kind publish --status pass|fail`，
  `--stale 3` 就能发现「这个仓三天没通过过发布检查」。
- 21:30 检查回顾 + 早/晚 digest 加一节「发布健康度」：每仓 origin/main vs 线上 sha、
  僵尸分支数、今日发布次数、失败轮次。

## 四、跟飞书总管的联动边界

```
闸门(G1-G6) ──写──> ①台账 queue.json + 飞书多维表格
                 └─> ② ops.db checks（指挥台）
                              │
总管/日报 ──只读──> ops-check --list/--review、ops-classify --json
                              │
                         出卡 / 拍板（C 档转人；B 档 safe_to_automerge 才可「同意」）
```

- 总管**不持有执行权**：它只能读判据、出卡、转人。真正执行的是脚本，且必须有人点头。
- 表格里永远不做「点一下就上线」的动作（2026-11-19 定的边界）。
- 破例（`--allow-unmerged`）本身也是数据，进台账、进回顾，不靠人记。

## 五、验收：每条闸门必须「故意触发」一次

| 闸门 | 触发病例 | 期望 |
|---|---|---|
| G3 | 出包期间在另一个终端推进 main | `exit 8`，产物作废 |
| G4 | 篡改 `dist/sw.js` 指纹 | `exit 4`，deploy-state 无新增 |
| G5 | 删掉今日 `loop-answers-<今天>.json` | `exit 9`，卡上写「今天没数据」 |
| G6 | 同 sha 连跑两次 | 第二次 `exit 0` + 「幂等」 |
| I1 | 合一个 docs 提交、不部署 | 15 min 内出卡 |
| I2 | 造一个 13h 未合的分支 | 出卡 + 台账一行 |
| I3 | 把线上指纹改掉（或发布旧包） | 5 min 内红卡 |

## 六、风险与回滚

- 每条闸门都有逃生口（`FORCE_REDEPLOY` / `--allow-unmerged --why` / `SKIP_ENGINE_SELFTEST`），
  逃生口动作本身进台账 —— 逃生不是绕过审计。
- G5 要动 `~/.hermes/scripts/loop-hints-pull.sh`（每天 14:00 cron）：先在副本上
  `--dry` 跑通 worktree/commit/push 全链，再替换线上脚本。
- 通知量：I1/I2 走 sig 去重，同一内容只出一次卡；避免「每 15 分钟一条」。

## 七、待拍板

1. **合并节奏**：当前分支已含 G3/G4/G6 + 第一轮全部，建议一次合并（避免两次碰生产）；
   还是先合第一轮、G 闸另开分支？
2. **G5 是否现在改 loop 脚本**（会碰 14:00 日更 cron）。
3. 破例部署的出卡对象：只给法老，还是同时进飞书群？

## 八、生效顺序（有依赖，别乱）

1. 合本分支进 gridpaw main（旧钩子允许 local_ref=main 的 ff；主树脏不影响）→ 新钩子/脚本生效。
2. 用 `bash scripts/deploy.sh --sha <main>` 发一版（此时才第一次真跑 G3/G4/G6）。
3. 跑 `loop-hints-pull.sh --publish-only` 补发今日 Loop 页（G5 首次真跑）。
4. 之后列车恢复：B 档自动合 + 自动 `--sha` 部署；C 档等你点头。

破例/回滚卡：`~/.hermes/scripts/feishu-ops-card.sh` → 飞书「总管 · 审批室」群（已在 11-25 16:02 验证可达）。

## 九、D 道：契约/文档捷径（2026-11-25 法老定：AGENTS 与 memory 走最慢）

契约 brief 是**别的会话读的输入**，不是产物 —— 它靠进 main 生效，不靠上线。但等 30 分钟列车太慢，所以开一条只收 doc-only 的捷径：

| 能走捷径 | 不能走（走最慢/正常合并） |
|---|---|
| `docs/**`、`*.contract.md`、`STYLE.md`、`DESIGN.md` | `AGENTS.md` / `CLAUDE.md`（规则类，改的是所有会话的行为） |
| | 一切代码/配置：`src/` `scripts/` `package.json` `wrangler*` `public/` `.github/` |
| | memory（本就不在仓库里，天然不走） |

实现：`~/.hermes/scripts/contract-lane.sh <repo> <branch>`（`--check` 只判定）
- 三条仍守：main 只收 ff、只推自己的提交、必留痕（`ops-check --kind contract` + 飞书「总管 · 审批室」群）
- 不部署：docs 不进产物；若某契约渲染进站点，那它就不是文档，别走这条道
- 实测：docs-only 分支通过；带 `scripts/` 改动 exit 10 拒；落后 main exit 5 拒

**消费者纪律（比推送更重要）**：会话读契约一律读 `origin/main` 版本
（`git show origin/main:docs/x.md`），不读本地工作树副本 —— 后者可能落后好几天。
列车合老分支时用 `git merge-base --is-ancestor <契约提交> <分支>` 标注「这分支在旧契约下写的」。
