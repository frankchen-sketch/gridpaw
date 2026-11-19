# 大格数独集群 · 开发契约（冻结版）

> 2026-11-19。四路并发开工前冻结的接口与命名。**改这份文件 = 改契约，须主控同意后统一改。**
> 选品依据：`research/2026-11-19-hexadoku-research.md`

## 一、引擎 API（卡1 实现，卡2 调用，不得擅改）

- 源文件：`src/lib/puzzle-core/sudoku-engine.ts`
- 打包：`scripts/bundle-engine.mjs` 增加 `compileEngine('./src/lib/puzzle-core/sudoku-engine.ts', 'sudoku-engine.js')`
- 全局名：`SudokuEngine`（与 `StarBattleEngine` / `SlitherEngine` 同模式）
- 页面引入：`<script is:inline src="/sudoku-engine.js"></script>`

### 类型

```ts
export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuPuzzle {
  id: string;                  // `sudoku-${size}-${difficulty}-${seed}`
  size: number;                // 9 | 12 | 16 | 25
  blockW: number;              // 区块宽
  blockH: number;              // 区块高
  symbols: string[];           // 显示字符，长度 = size
  givens: [number, number][];  // [cellIndex, value(1..size)]
  solution: number[];          // 长度 size*size，取值 1..size
  difficulty: SudokuDifficulty;
}
```

### 函数

```ts
export function generate(
  size: number, blockW: number, blockH: number,
  difficulty: SudokuDifficulty, seed?: number, timeBudgetMs?: number
): SudokuPuzzle

export function countSolutions(p: SudokuPuzzle, limit?: number): { count: number }
export function validate(p: SudokuPuzzle, vals: Int8Array | number[]): { ok: boolean; errors: string[] }
export function hintLookup(p: SudokuPuzzle, idx: number): number   // 正确答案；-1 = 无效
```

### 符号集（固定）

| size | 区块 | symbols |
|---|---|---|
| 9 | 3×3 | `1..9` |
| 12 | 4×3 | `1..9` + `A B C` |
| 16 | 4×4 | `0..9` + `A..F` |
| 25 | 5×5 | `1..9` + `A..P` |

### 硬约束

1. `generate` 必须产出**唯一解**（`countSolutions === 1`），不满足则换种子重来，最多 20 次后降一档难度
2. 16×16 / 25×25 生成可能慢：必须支持 `timeBudgetMs`（默认 8000），超时返回更低难度盘而不是抛错
3. **不得引入新依赖**
4. 所有 `Int8Array` 用 `-1` 表示空，与现有引擎一致

## 二、页面（卡2）

| 路由 | 文件 | 引擎参数 |
|---|---|---|
| `/16x16-sudoku/` | `src/pages/16x16-sudoku/index.astro` | 16 / 4 / 4 |
| `/mega-sudoku/` | `src/pages/mega-sudoku/index.astro` | 16 / 4 / 4（＋25 可选） |
| `/hexadoku/` | `src/pages/hexadoku/index.astro` | 16 / 4 / 4 |
| `/12x12-sudoku/` | `src/pages/12x12-sudoku/index.astro` | 12 / 4 / 3 |
| `/25x25-sudoku/` | `src/pages/25x25-sudoku/index.astro` | 25 / 5 / 5 |
| `/sudoku-with-letters/` | `src/pages/sudoku-with-letters/index.astro` | 9 或 16 + 字母符号 |

每页必须：

- `title` / `description` **全局唯一**（不得互相复制）
- 恰好一个 `H1`
- 一个可玩面板，调 `SudokuEngine.generate(...)`
- 至少 2 条指向其它大格页的内链
- `/hexadoku/` 与 `/16x16-sudoku/` 正文**不得重复**：前者只做同义入口 + 短说明 + 内链

## 三、视觉（卡3）

- 只用现有 CSS 变量（`--md-primary: #D97706`、奶油白底），不引入新色系
- 出 3 版：**A 紧凑网格 / B 纸质棋谱 / C 大触控格**
- 交付形态：静态 HTML 稿（不进 repo 主干），主控截图给法老挑
- 每版必须包含：16×16 盘面、选中态、冲突态、数字键盘（16 符号需要 16 个键）

## 四、基建（卡4）

- `scripts/gen-sudoku-levels.mjs`：构建期预生成，每页 12 盘，写 `src/data/sudoku-levels.json`
- build 链路插入点：在 `bundle-engine.mjs` **之前**
- `check-nav-consistency.mjs` 需覆盖 6 个新路由
- 验收：`pnpm run build` 通过，6 个路由在 `dist/` 有产物

## 五、分支与 worktree

| 卡 | 分支 | worktree |
|---|---|---|
| 引擎 | `feat/sudoku-engine` | `~/workspace/.worktrees/sudoku-engine` |
| 页面 | `feat/sudoku-pages` | `~/workspace/.worktrees/sudoku-pages` |
| 美术 | `design/sudoku-visual` | `~/workspace/.worktrees/sudoku-visual` |
| 基建 | `chore/sudoku-scaffold` | `~/workspace/.worktrees/sudoku-scaffold` |

**红线**：不 push、不 merge、不 deploy、不动 main、不切主 worktree 分支。

## 六、验收（合并前逐条过）

1. **引擎**：node 跑每档 100 盘，唯一解 100%，无崩溃，16×16 单盘生成 < 8s
2. **页面**：`pnpm run build` 通过，6 路由有产物，title/description 两两不重复
3. **视觉**：3 版可截图对比，符号键盘完整
4. **基建**：`sudoku-levels.json` 生成成功，build 全绿
5. **全部**：`pnpm run lint` 通过
