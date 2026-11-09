#!/usr/bin/env python3
"""下载 81 张场景背景（远程 bundle assets_level）-> build/fkszw_bg/gamebg_NN.jpg

背景不在本地包里，走发行商 CDN：
  server   = https://ares.kampfiregames.cn/5/zjkx/formal/001/remote/assets_level/
  config   = {server}config.5448d.json
  native   = {server}native/{uuid[:2]}/{标准uuid}.{md5}.{ext}
坑：扩展名不是 .png 就是 404——ImageAsset fmt=JPEG，实测背景全是 .jpg。
校验：JPEG 头 ff d8 ff + PIL verify()，伪文件（HTML/404 页）删除。
用法: python3 fetch_backgrounds.py
"""
import json
import os
import re
import subprocess
import sys

from PIL import Image

SERVER = 'https://ares.kampfiregames.cn/5/zjkx/formal/001/remote/assets_level/'
B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
BUILD = os.environ.get(
    'FKSZW_BUILD', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
OUT = f'{BUILD}/fkszw_bg'
CACHE_GLOBS = [
    os.path.expanduser(
        '~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/users/'
        '*/applet/local/wx1644b5d3f47969f0/usr/gamecaches/assets_level/*'),
]


def dec_dashed(cu):
    bits = nbits = 0
    out = []
    for ch in cu[2:]:
        bits = (bits << 6) | B64.index(ch)
        nbits += 6
        while nbits >= 4:
            nbits -= 4
            out.append('0123456789abcdef'[(bits >> nbits) & 0xF])
    h = cu[:2] + ''.join(out)
    return f'{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:]}'


def ok_image(path):
    try:
        with open(path, 'rb') as f:
            head = f.read(3)
        if head != b'\xff\xd8\xff':
            return False
        Image.open(path).verify()
        return True
    except Exception:
        return False


def main():
    os.makedirs(OUT, exist_ok=True)
    cfg = json.loads(subprocess.run(['curl', '-sL', '-m', '30', SERVER + 'config.5448d.json'],
                                    capture_output=True, text=True).stdout)
    nv = cfg['versions']['native']
    nmd5 = {nv[i]: nv[i + 1] for i in range(0, len(nv), 2)}
    todo = {}
    for k, v in cfg['paths'].items():
        m = re.match(r'texture/gamebg/(\d+)$', v[0])
        if m:
            idx = int(k)
            todo[int(m.group(1))] = (dec_dashed(cfg['uuids'][idx]), nmd5[idx])
    ok, fail = 0, []
    for n, (u, md5) in sorted(todo.items()):
        out = f'{OUT}/gamebg_{n:02d}.jpg'
        if os.path.exists(out) and os.path.getsize(out) > 1000 and ok_image(out):
            ok += 1
            continue
        subprocess.run(['curl', '-sL', '-m', '40', '-o', out,
                        f'{SERVER}native/{u[:2]}/{u}.{md5}.jpg'], capture_output=True)
        if ok_image(out):
            ok += 1
        else:
            fail.append(n)
    print(f'背景下载: {ok}/{len(todo)} 成功, 失败: {fail}')
    from PIL import Image as I
    for n in (1, 47, 81):
        p = f'{OUT}/gamebg_{n:02d}.jpg'
        if os.path.exists(p):
            print(f'bg{n}: {I.open(p).size}')


if __name__ == '__main__':
    main()
