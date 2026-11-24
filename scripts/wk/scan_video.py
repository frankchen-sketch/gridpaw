#!/usr/bin/env python3
"""扫码 Word Kitchen 攻略录像 → 每关一帧 + manifest。

用法：python3 scripts/wk/scan_video.py <video.mp4> <pack-slug> [--min-seg 8]

做法（2026-11-24 实测定型）：
1) ffmpeg 场景切换检测（threshold 0.22）拿到切点，3 秒内去重 → 段边界
2) 丢掉短于 --min-seg 的段（片头/片尾卡）
3) 每段起点 +6s 取一帧（此点托盘字母已全部落位、尚未被大量消耗）
4) 写 <pack>.manifest.json：{pack, video, duration, segments:[{level, start, end, frame}]}

注意：段序 = 关号（游戏原生包内 1..N）。托盘字母不在这里读——读帧必须走
vision_analyze（见 research/2026-11-24-level-backfill-contract.md §2），
纯文本模型会把 UI 元素读错。
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, errors="replace")


def duration(path: Path) -> float:
    r = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ])
    return float(r.stdout.strip())


def scene_cuts(path: Path, threshold: float = 0.22):
    r = run([
        "ffmpeg", "-v", "info", "-i", str(path),
        "-vf", f"select='gt(scene,{threshold})',showinfo",
        "-an", "-f", "null", "-",
    ])
    times = sorted(float(m) for m in re.findall(r"pts_time:([0-9.]+)", r.stderr))
    # 3 秒内合并（同一转场常被连报两次）
    merged = []
    for t in times:
        if not merged or t - merged[-1] > 3:
            merged.append(t)
    return merged


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("pack")
    ap.add_argument("--min-seg", type=float, default=8.0)
    ap.add_argument("--lead", type=float, default=6.0, help="段起点后多少秒取帧")
    ap.add_argument("--out", default=None)
    ap.add_argument("--every", type=float, default=0,
                    help=">0 时忽略段边界，按固定间隔取帧（关号靠读顶部标签确认，最稳）")
    args = ap.parse_args()

    video = Path(args.video).expanduser()
    if not video.exists():
        sys.exit(f"video not found: {video}")
    dur = duration(video)

    if args.every:
        outdir = Path(args.out) if args.out else video.parent / f"frames_{args.pack}"
        outdir.mkdir(parents=True, exist_ok=True)
        segs = []
        t = args.every
        while t < dur - 1:
            frame = outdir / f"{args.pack}_{int(t):04d}s.jpg"
            r = run([
                "ffmpeg", "-v", "error", "-ss", str(t), "-i", str(video),
                "-frames:v", "1", "-q:v", "2", "-y", str(frame),
            ])
            if r.returncode == 0 and frame.exists():
                segs.append({"t": round(t, 1), "frame": str(frame)})
            t += args.every
        manifest = {
            "pack": args.pack, "video": video.name, "duration": round(dur, 2),
            "mode": f"interval:{args.every}", "frames": segs,
        }
        mpath = outdir.parent / f"{args.pack}.manifest.json"
        mpath.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
        print(f"{args.pack}: {len(segs)} frames every {args.every}s, {dur:.0f}s -> {mpath}")
        return

    cuts = scene_cuts(video)
    bounds = [0.0] + [t for t in cuts if t > 1.0] + [dur]

    segs = []
    for i in range(len(bounds) - 1):
        start, end = bounds[i], bounds[i + 1]
        if end - start < args.min_seg:
            continue
        segs.append({"start": round(start, 1), "end": round(end, 1)})

    outdir = Path(args.out) if args.out else video.parent / f"frames_{args.pack}"
    outdir.mkdir(parents=True, exist_ok=True)
    for idx, s in enumerate(segs, 1):
        t = s["start"] + args.lead
        if t >= s["end"]:
            t = s["start"] + (s["end"] - s["start"]) / 2
        frame = outdir / f"{args.pack}_l{idx:02d}_{int(t)}s.jpg"
        r = run([
            "ffmpeg", "-v", "error", "-ss", str(t), "-i", str(video),
            "-frames:v", "1", "-q:v", "2", "-y", str(frame),
        ])
        if r.returncode != 0 or not frame.exists():
            print(f"WARN level {idx}: frame extract failed at {t}s", file=sys.stderr)
            continue
        s["level"] = idx
        s["t"] = round(t, 1)
        s["frame"] = str(frame)

    manifest = {
        "pack": args.pack,
        "video": video.name,
        "duration": round(dur, 2),
        "scene_threshold": 0.22,
        "segments": segs,
    }
    mpath = outdir.parent / f"{args.pack}.manifest.json"
    mpath.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(f"{args.pack}: {len(segs)} segments, {dur:.0f}s -> {mpath}")


if __name__ == "__main__":
    main()
