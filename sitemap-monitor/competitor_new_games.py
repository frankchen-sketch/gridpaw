#!/usr/bin/env python3
"""从 sitemap baseline 差集里提取「新开的游戏」（按游戏基名首次出现判定）。
用法: python3 competitor_new_games.py [--dir <sitemap-monitor目录>]
输出: 本周新增游戏（基名），及每个游戏的证据 URL。
"""
import os, re, sys, json, collections

D = os.path.expanduser("~/workspace/gridpaw/sitemap-monitor")
if "--dir" in sys.argv:
    D = sys.argv[sys.argv.index("--dir") + 1]

SITES = ["trickystorywalkthrough.com.tsv", "tricky-story.org.tsv"]
STOP = {"", "contact-us", "privacy-policy", "about", "terms", "home", "about-us",
        "disclaimer", "dmca", "sitemap"}


def game_base(url):
    """URL → 游戏基名。纯数字关卡页返回 None。"""
    parts = [p for p in url.split("/") if p]
    if not parts:
        return None
    slug = parts[-1].lower()
    # /level/277 这类：最后一段是纯数字 → 用倒数第二段的游戏名（若有）
    if slug.isdigit():
        return None
    # 剥掉关卡范围/序号
    s = re.sub(r"-(level|levels|day|days|story|chapter)-?\d+(-\d+)?\b.*$", "", slug)
    s = re.sub(r"-(level|levels|day|days|story|chapter)\b.*$", "", s)
    # 剥掉内容类型后缀
    s = re.sub(r"-(walkthrough|walkthroughs|answers?|solutions?|hints?|guide|"
               r"cheats?|tips|all-levels)\b.*$", "", s)
    s = s.strip("-_")
    if s in STOP or len(s) < 3:
        return None
    return s


def load(d, site):
    p = os.path.join(d, site)
    if not os.path.exists(p):
        return None
    out = []
    for line in open(p):
        if "\t" in line:
            out.append(line.split("\t", 1)[1].strip())
    return out


bs = sorted(x for x in os.listdir(D) if x.startswith("baseline-"))
if len(bs) < 2:
    print("RESULT: 基线不足（<2 轮），本周跳过")
    sys.exit(0)

cur, prev = bs[-1], bs[-2]
print(f"对比: {prev} → {cur}")

report = {}
for site in SITES:
    curr = load(os.path.join(D, cur), site)
    if curr is None:
        print(f"\n{site}: 最新 baseline 无，跳过")
        continue
    old = load(os.path.join(D, prev), site)
    if old is None:
        print(f"\n{site}: **首次监控**（上轮无此站），已建基线，本周不做筛选、不花积分")
        report[site] = {"first_seen": True, "games": []}
        continue

    old_games = {g for g in (game_base(u) for u in old) if g}
    cur_map = collections.defaultdict(list)
    for u in curr:
        g = game_base(u)
        if g:
            cur_map[g].append(u)

    new_games = {g: urls for g, urls in cur_map.items() if g not in old_games}
    print(f"\n{site}: 上轮 {len(old_games)} 个游戏基名 → 本轮 {len(cur_map)} 个，"
          f"**新游戏 {len(new_games)} 个**")
    for g, urls in sorted(new_games.items(), key=lambda kv: -len(kv[1])):
        print(f"   + {g:<40} {len(urls)} URL   例: {urls[0].split('/')[-2] if urls[0].endswith('/') else urls[0].split('/')[-1]}")
    report[site] = {"first_seen": False, "games": sorted(new_games)}

print("\n" + json.dumps(report, ensure_ascii=False))
