#!/usr/bin/env python3
"""Audit BP3 level images against frames from each level's own walkthrough video.

用法（重跑一次全量核对）:
  1. 取帧: 对每个关卡的页面视频 `yt-dlp --download-sections "*2-11"` + `ffmpeg -ss 3/-ss 8`
     落到 /tmp/audit53/f{n}_t{3,8}.jpg（需要代理 127.0.0.1:7880）
  2. 跑本脚本，输出 /tmp/audit53_results.json
  3. 判据：own（本关图 vs 本关视频帧）应显著高于 best_other；已知错配对照 = 0.19，
     正确配对 ≥0.89，没有图像以更高分匹配到别的关卡视频即视为通过。
     注意粗指标会把同为暖色调卡通的场景误判（实测 L1 vs L27 = 0.899 是假阳性，
     必须用 vision 复核 tie 或低分项，不能只信阈值。

Idea: build a similarity matrix between every level image and every level's video
frames. If an image matches a *different* level's video better than its own, the
image is probably filed under the wrong level.

Metric: normalised grayscale correlation (structure/room layout) blended with an
HSV histogram distance (palette). Frames and screenshots come from the same game
engine, so the same scene scores high even at different puzzle stages.
"""
import glob
import itertools
import json
import os
import re
import sys

import numpy as np
from PIL import Image

REPO = '/Users/frank/workspace/gridpaw'
FRAMES = '/tmp/audit53'
SIZE = (48, 27)

rows = json.load(open('/tmp/audit53.json'))


def vec(path):
    im = Image.open(path).convert('RGB').resize(SIZE, Image.BILINEAR)
    a = np.asarray(im, dtype=np.float32) / 255.0
    g = a.mean(axis=2)
    g = (g - g.mean()) / (g.std() + 1e-6)
    hist = np.histogramdd(a.reshape(-1, 3), bins=(6, 6, 6), range=((0, 1),) * 3)[0]
    h = hist / (hist.sum() + 1e-6)
    return g, h


def score(g1, h1, g2, h2):
    corr = float((g1 * g2).mean())
    hi = float((np.sqrt(h1) * np.sqrt(h2)).sum())          # Bhattacharyya coefficient
    return 0.6 * max(corr, 0) + 0.4 * hi


def frames_for(n):
    out = []
    for p in sorted(glob.glob(f'{FRAMES}/f{n}_t*.jpg')):
        try:
            out.append((p,) + vec(p))
        except Exception:
            pass
    return out


frame_cache = {n: frames_for(n) for n in range(1, 54)}
missing_frames = [n for n, v in frame_cache.items() if not v]

img_cache = {}
for r in rows:
    n = r['n']
    for name in r['imgs']:
        p = os.path.join(REPO, 'public/brain-puzzle-3', name)
        if os.path.exists(p):
            try:
                img_cache[(n, name)] = vec(p)
            except Exception as e:
                print('skip', p, e)

print(f'frames: {sum(len(v) for v in frame_cache.values())} for {53 - len(missing_frames)} levels'
      f' | missing frames: {missing_frames}')
print(f'images: {len(img_cache)}')

results = []
for (n, name), (g1, h1) in img_cache.items():
    own = max((score(g1, h1, g2, h2) for _, g2, h2 in frame_cache.get(n, [])), default=0.0)
    best = (0.0, None)
    for m, frames in frame_cache.items():
        if m == n or not frames:
            continue
        s = max(score(g1, h1, g2, h2) for _, g2, h2 in frames)
        if s > best[0]:
            best = (s, m)
    results.append({'level': n, 'img': name, 'own': round(own, 3),
                    'best_other': best[1], 'best_other_score': round(best[0], 3),
                    'margin': round(best[0] - own, 3)})

results.sort(key=lambda r: -r['margin'])
json.dump(results, open('/tmp/audit53_results.json', 'w'), indent=1)

print('\nlevel img                       own  best_other  gap')
for r in results[:20]:
    print(f"{r['level']:>4} {r['img']:26s} {r['own']:.3f}  L{r['best_other']:<3} {r['best_other_score']:.3f}  {r['margin']:+.3f}")
print('\nmedian own score:', round(float(np.median([r['own'] for r in results])), 3))
suspects = [r['level'] for r in results if r['margin'] > 0.03 or r['own'] < 0.55]
print('suspects:', suspects)
