// 把 src/data/amochiroom-levels.json（6.8MB 全量）拆成按关卡的前端数据，
// 供 /room-sort-game-online/ 的可玩引擎按需加载（首屏只取 index.json + 当前关）。
//
// 用法：node scripts/export-roomsort-play.mjs
// 输出：public/room-sort/index.json + public/room-sort/levels/{N}.json
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src/data/amochiroom-levels.json';
const OUT_DIR = 'public/room-sort';
const LEVELS_DIR = path.join(OUT_DIR, 'levels');

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!Array.isArray(data?.levels) || data.levels.length === 0) {
  console.error(`[export-roomsort-play] ${SRC} 没有 levels 数组，中止`);
  process.exit(1);
}

fs.mkdirSync(LEVELS_DIR, { recursive: true });

const index = [];
let totalBytes = 0;
let maxBytes = 0;
let maxLevel = 0;

for (const l of data.levels) {
  // items 的数组顺序即绘制顺序（后画的在上层），遮挡交给 DOM hit-test，
  // 所以这里必须保持原顺序，不能排序。
  const slim = {
    level: l.level,
    name: l.name,
    difficulty: l.difficulty ?? null,
    bgW: l.bgW,
    bgH: l.bgH,
    bg: l.bg,
    boxes: (l.boxes ?? []).map((b) => ({
      name: b.name,
      count: b.count,
      type: b.type,
      queue: b.queue,
      thumbs: b.thumbs ?? [],
    })),
    // [fn, x, y, fx, fy, ang, w, h, type]
    items: l.items,
  };
  const body = JSON.stringify(slim);
  const bytes = Buffer.byteLength(body);
  totalBytes += bytes;
  if (bytes > maxBytes) {
    maxBytes = bytes;
    maxLevel = l.level;
  }
  fs.writeFileSync(path.join(LEVELS_DIR, `${l.level}.json`), body);

  index.push({
    level: l.level,
    name: l.name,
    difficulty: l.difficulty ?? null,
    boxCount: l.boxCount,
    itemCount: l.itemCount,
    thumb: l.thumb,
  });
}

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index));

console.log(
  `[export-roomsort-play] ${index.length} 关 → ${OUT_DIR}（合计 ${(totalBytes / 1048576).toFixed(2)} MB，` +
    `最大单关 L${maxLevel} ${(maxBytes / 1024).toFixed(0)} KB）`,
);
