#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SEO 基础守恒守卫（人味轮次 2026-11-02）。

dist 模式（渲染层）：比对改前、改后两份 dist，SEO 基础任一项变化即 FAIL。
    python3 seo_guard.py dist --base <改前dist> --cand <改后dist>

scope 模式（补丁层）：补丁涉及的文件，去掉标签之间文本后的标签/属性/代码骨架
必须与 HEAD 相同；JSON 只允许改值；命中受保护路径即 FAIL。
    python3 seo_guard.py scope --patch <changes.patch> --repo <仓库根>

退出码：0 = 全部守恒，1 = 有违规。
"""
import argparse
import collections
import json
import os
import re
import subprocess
import sys
import tempfile
import html as H

INLINE = r'</?(?:a|strong|em|b|i|span|code|sup|sub|small|mark|u|abbr|kbd)\b[^>]*>'
EM = '\u2014'
BRAND = 'GridPaw \u2014'
GAME_UI = 'Everything placed \u2014 look for mistakes'
PROTECTED = [r'^src/pages/de/', r'^public/pictomino/index\.html$',
             r'^src/data/puzzles\.json$', r'^scripts/generate-puzzles\.mjs$', r'\.txt$']
CODE_EXT = ('.astro', '.html', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.vue', '.svelte')
SCRATCH = os.path.expanduser('~/.hermes/cache/scratch')


def norm(s):
    return ' '.join(s.split())


def vis(h):
    s = re.sub(r'<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>|<!--.*?-->', ' ', h, flags=re.S | re.I)
    s = re.sub(INLINE, '', s, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    s = H.unescape(s).replace('\\"', '"')
    s = re.sub(r'\[email\s*protected\]|[\w.+-]+@[\w-]+\.[\w.-]+', 'EMAIL', s)
    return norm(s)


def pages(root):
    out = {}
    for dp, _, fs in os.walk(root):
        for f in fs:
            if f.endswith('.html'):
                p = os.path.join(dp, f)
                with open(p, encoding='utf-8', errors='ignore') as fh:
                    out[os.path.relpath(p, root)] = fh.read()
    return out


def first(rx, s):
    m = re.search(rx, s)
    return m.group(0) if m else None


def meta(h, name):
    m = re.search(r'(?is)<meta\s+(?:name|property)="%s"\s+content="([^"]*)"' % re.escape(name), h)
    if not m:
        m = re.search(r'(?is)<meta\s+content="([^"]*)"\s+(?:name|property)="%s"' % re.escape(name), h)
    return H.unescape(m.group(1)) if m else None


def head_sig(h):
    t = re.search(r'(?is)<title[^>]*>(.*?)</title>', h)
    sig = {'title': vis(t.group(1)) if t else None}
    for n in ['description', 'og:title', 'og:description', 'og:url', 'og:image',
              'twitter:title', 'twitter:description', 'twitter:image', 'robots']:
        sig[n] = meta(h, n)
    sig['canonical'] = first(r'(?is)<link[^>]*rel="canonical"[^>]*>', h)
    sig['alternate'] = re.findall(r'(?is)<link[^>]*rel="alternate"[^>]*>', h)
    return sig


def headings(h):
    return [(lvl, vis(t)) for lvl, t in re.findall(r'(?is)<h([1-6])\b[^>]*>(.*?)</h\1>', h)]


def ld_raw(h):
    return [norm(b) for b in re.findall(r'(?is)<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', h)]


def ld_answers(h):
    out = []
    for b in re.findall(r'(?is)<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', h):
        try:
            o = json.loads(b)
        except Exception:
            continue
        stack = [o]
        while stack:
            x = stack.pop()
            if isinstance(x, dict):
                if x.get('@type') == 'Answer' and isinstance(x.get('text'), str):
                    out.append(x['text'])
                stack.extend(x.values())
            elif isinstance(x, list):
                stack.extend(x)
    return out


def faq_blocks(h):
    return [vis(b) for b in re.findall(r'(?is)<details\b[^>]*class="[^"]*faq[^"]*"[^>]*>(.*?)</details>', h)]


def anchors(h):
    out = []
    for attrs, body in re.findall(r'(?is)<a\b([^>]*)>(.*?)</a>', h):
        m = re.search(r'href="([^"]*)"', attrs)
        out.append((m.group(1) if m else None, vis(body)))
    return out


def imgs(h):
    out = []
    for attrs in re.findall(r'(?is)<img\b([^>]*)>', h):
        s = re.search(r'\bsrc="([^"]*)"', attrs)
        a = re.search(r'\balt="([^"]*)"', attrs)
        out.append((s.group(1) if s else None, a.group(1) if a else None))
    return out


# 构建戳：git 提交号与时间每次构建都变，不是内容变化，归一化后再比
BUILD_INFO = re.compile(r'const i=\{id:"[^"]*",message:"[^"]*",committedAt:"[^"]*"\}')


def inline_code(h):
    out = []
    for tag, attrs, body in re.findall(r'(?is)<(script|style)\b([^>]*)>(.*?)</\1>', h):
        if 'application/ld+json' in attrs:
            continue
        body = BUILD_INFO.sub('const i={BUILD}', body)
        out.append((tag, norm(attrs), norm(body)))
    return out


def nums(h):
    return collections.Counter(re.findall(r'\d+', vis(h)))


def sitemap_urls(root):
    out = set()
    if not os.path.isdir(root):
        return out
    for f in os.listdir(root):
        if f.startswith('sitemap') and f.endswith('.xml'):
            with open(os.path.join(root, f), encoding='utf-8', errors='ignore') as fh:
                out |= set(re.findall(r'<loc>([^<]+)</loc>', fh.read()))
    return out


def astro_files(root):
    d = os.path.join(root, '_astro')
    return set(os.listdir(d)) if os.path.isdir(d) else set()


def sents(t):
    return {s.strip() for s in re.split(r'(?<=[.!?])\s+', t) if len(s.strip()) >= 40}


def dup_metric(pg):
    cnt = collections.Counter()
    ak = [p for p in pg if p.startswith('akari/')]
    for p in ak:
        cnt.update(sents(vis(pg[p])))
    cls = [s for s, c in cnt.items() if c >= 2]
    return len(ak), len(cls), sum(cnt[s] for s in cls)


# 内联 JS：标识符按首次出现重命名后比较（minifier 局部改名不算变化；字符串、数字、属性名原样比）
JS_KW = set('''break case catch class const continue debugger default delete do else export extends finally for
function if import in instanceof let new return super switch this throw try typeof var void while with yield await
async of null true false undefined NaN Infinity window document navigator location history localStorage
sessionStorage console setTimeout clearTimeout setInterval clearInterval fetch URL URLSearchParams Object Array
String Number Math JSON Date Promise Error RegExp Symbol Map Set Boolean CustomEvent Event addEventListener
removeEventListener dispatchEvent querySelector querySelectorAll getElementById createElement'''.split())
JS_TOKEN = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`|[A-Za-z_$][\w$]*|\d[\w.]*|\S')


def js_canon(body):
    names, out, prev = {}, [], ''
    for t in JS_TOKEN.findall(body):
        if re.match(r'[A-Za-z_$]', t) and t not in JS_KW and prev != '.':
            names.setdefault(t, f'v{len(names)}')
            out.append(names[t])
        else:
            out.append(t)
        prev = t
    return ' '.join(out)


def inline_eq(b, c):
    xb, xc = inline_code(b), inline_code(c)
    if len(xb) != len(xc):
        return False
    for (t1, a1, s1), (t2, a2, s2) in zip(xb, xc):
        if (t1, a1) != (t2, a2):
            return False
        if (js_canon(s1) != js_canon(s2)) if t1 == 'script' else (s1 != s2):
            return False
    return True


CHECKS = [
    ('TDK/canonical/alternate/robots', lambda b, c: head_sig(b) != head_sig(c)),
    ('H1–H6 文字', lambda b, c: headings(b) != headings(c)),
    ('JSON-LD 原文', lambda b, c: ld_raw(b) != ld_raw(c)),
    ('FAQ 可见块', lambda b, c: faq_blocks(b) != faq_blocks(c)),
    ('内链 href+锚文本', lambda b, c: anchors(b) != anchors(c)),
    ('图片 src+alt', lambda b, c: imgs(b) != imgs(c)),
    ('内联 script/style（JS 标识符归一）', lambda b, c: not inline_eq(b, c)),
    ('数字多重集', lambda b, c: nums(b) != nums(c)),
    ('游戏 UI 串计数', lambda b, c: b.count(GAME_UI) != c.count(GAME_UI)),
]


def run_dist(base_root, cand_root):
    B, C = pages(base_root), pages(cand_root)
    print(f'页面：base {len(B)} / cand {len(C)}')
    gating_fail = False
    same_set = set(B) == set(C)
    print(f'  [{"PASS" if same_set else "FAIL"}] 页面集合一致')
    gating_fail |= not same_set
    common = sorted(set(B) & set(C))
    for name, fn in CHECKS:
        bad = [p for p in common if fn(B[p], C[p])]
        print(f'  [{"PASS" if not bad else "FAIL"}] {name}' + (f'：{len(bad)} 页 {bad[:4]}' if bad else ''))
        gating_fail |= bool(bad)
    fa, fb = astro_files(base_root), astro_files(cand_root)
    ok = fa == fb
    print(f'  [{"PASS" if ok else "FAIL"}] _astro 包文件名一致' + ('' if ok else f'（base 独有 {len(fa - fb)} / cand 独有 {len(fb - fa)}）'))
    gating_fail |= not ok
    sb, sc = sitemap_urls(base_root), sitemap_urls(cand_root)
    ok = sb == sc
    print(f'  [{"PASS" if ok else "FAIL"}] sitemap URL 集合一致（{len(sb)} 条）')
    gating_fail |= not ok

    print('报告项（不gate）：')
    em_b = sum(vis(B[p]).count(EM) for p in common)
    em_c = sum(vis(C[p]).count(EM) for p in common)
    print(f'  全站可见 em dash: {em_b} → {em_c}（净减 {em_b - em_c}）')
    print(f'  可见文本有变化的页: {sum(1 for p in common if vis(B[p]) != vis(C[p]))}/{len(common)}')
    brand = [p for p in common if vis(B[p]).count(BRAND) != vis(C[p]).count(BRAND)]
    print(f'  「GridPaw —」变化页（人工确认是否正文句，不是推广卡）: {brand}')
    fb_ = sum(1 for p in common for a in ld_answers(B[p]) if vis(a) not in vis(B[p]))
    fc_ = sum(1 for p in common for a in ld_answers(C[p]) if vis(a) not in vis(C[p]))
    print(f'  FAQ JSON-LD 与可见不一致（既有，本轮不处理）: {fb_} → {fc_}')
    db, dc = dup_metric(B), dup_metric(C)
    print(f'  /akari/ 跨页重复句（句≥40字符）: 页 {db[0]}，重复句类 {db[1]} → {dc[1]}，重复页次 {db[2]} → {dc[2]}')
    rename_only = [p for p in common if inline_code(B[p]) != inline_code(C[p]) and inline_eq(B[p], C[p])]
    print(f'  内联 JS 仅标识符改名（minifier 局部命名，字符串/结构不变）: {len(rename_only)} 页')
    print('\nSEO 基础守恒:', 'PASS' if not gating_fail else 'FAIL')
    return 0 if not gating_fail else 1


def skeleton(txt):
    return re.sub(r'>[^<]*<', '><', txt)


def json_shape(x):
    if isinstance(x, dict):
        return {k: json_shape(v) for k, v in x.items()}
    if isinstance(x, list):
        return [json_shape(v) for v in x]
    if isinstance(x, str):
        return 'str'
    return type(x).__name__


def run_scope(patch, repo):
    text = open(patch, encoding='utf-8').read()
    files = [re.sub(r'^b/', '', l[4:].strip()) for l in text.splitlines()
             if l.startswith('+++ ') and not l.startswith('+++ /dev/null')]
    problems = []
    for f in files:
        for pat in PROTECTED:
            if re.search(pat, f):
                problems.append(f'受保护路径: {f}')
    r = subprocess.run(['git', 'apply', '--check', os.path.abspath(patch)], cwd=repo, capture_output=True, text=True)
    print('  [%s] git apply --check（仓库工作区）' % ('PASS' if r.returncode == 0 else 'FAIL'))
    if r.returncode:
        problems.append('git apply --check 失败: ' + r.stderr[:160])
    os.makedirs(SCRATCH, exist_ok=True)
    old = tempfile.mkdtemp(prefix='scope-old-', dir=SCRATCH)
    new = tempfile.mkdtemp(prefix='scope-new-', dir=SCRATCH)
    ar = subprocess.run(['git', 'archive', 'HEAD', '--', *files], cwd=repo, capture_output=True)
    for d in (old, new):
        subprocess.run(['tar', '-x', '-C', d], input=ar.stdout, check=True)
    ap = subprocess.run(['git', 'apply', os.path.abspath(patch)], cwd=new, capture_output=True, text=True)
    if ap.returncode:
        problems.append('在 HEAD 副本上应用失败: ' + ap.stderr[:160])
    new_files = []
    for f in files:
        po, pn = os.path.join(old, f), os.path.join(new, f)
        if not os.path.exists(po):
            new_files.append(f)
            continue
        if not os.path.exists(pn):
            problems.append(f'删除文件: {f}')
            continue
        a = open(po, encoding='utf-8', errors='ignore').read()
        b = open(pn, encoding='utf-8', errors='ignore').read()
        if f.endswith('.json'):
            try:
                if json_shape(json.loads(a)) != json_shape(json.loads(b)):
                    problems.append(f'JSON 结构变化: {f}')
            except Exception as e:
                problems.append(f'JSON 解析失败 {f}: {e}')
        elif f.endswith(CODE_EXT):
            if skeleton(a) != skeleton(b):
                problems.append(f'标签/属性/代码骨架变化: {f}')
    print(f'  文件 {len(files)} 个；HEAD 中不存在（新增，需人工审）: {new_files or "无"}')
    if problems:
        for p in problems[:20]:
            print('  [FAIL]', p)
    else:
        print('  [PASS] 受保护路径 0 命中；标签/属性/代码骨架未变；JSON 只改值')
    print('\n补丁范围守恒:', 'PASS' if not problems else 'FAIL')
    return 0 if not problems else 1


def main():
    ap = argparse.ArgumentParser(description='SEO 基础守恒守卫')
    sub = ap.add_subparsers(dest='mode', required=True)
    d = sub.add_parser('dist')
    d.add_argument('--base', required=True)
    d.add_argument('--cand', required=True)
    s = sub.add_parser('scope')
    s.add_argument('--patch', required=True)
    s.add_argument('--repo', required=True)
    a = ap.parse_args()
    if a.mode == 'dist':
        sys.exit(run_dist(a.base, a.cand))
    sys.exit(run_scope(a.patch, a.repo))


if __name__ == '__main__':
    main()
