#!/usr/bin/env python3
"""疯狂收杂物 wxapkg → 解包资产 + 关卡文档流恢复（管线第 1 步）

从 4 个微信小游戏包重建：
  build/dec/*.dec.wxapkg          解密后的标准 wxapkg
  build/unpack/{app,config,assets,wx_sdk}/   按索引解包的文件树
  build/config_docs.pkl           config bundle 的连续 JSON 文档流恢复结果 [(offset, doc), ...]

关键实测（见 skill wechat-minigame-recon §5）：
- V1MMWX 解密 pass = 小程序 appid（不是 wxid），XOR key = appid 倒数第 2 字符
- wxapkg 索引里的 ofs 是容器内绝对偏移，不是相对 body
- bundle 的 import json 是一条被窗口切碎的连续 JSON 文档流，用
  json.JSONDecoder().raw_decode 在每个 {" 锚点扫描即可无失败恢复
用法: python3 unpack_pipeline.py [包目录]
"""
import json
import os
import pickle
import re
import sys

from Crypto.Cipher import AES
from Crypto.Hash import SHA1
from Crypto.Protocol.KDF import PBKDF2

APPID = 'wx1644b5d3f47969f0'
SALT = b'saltiest'
IV = b'the iv: 16 bytes'
DEFAULT_PKG = os.path.expanduser(
    '~/Library/Containers/com.tencent.xinWeChat/Data/Documents/app_data/radium/users/'
    'e0a340392a2438ccfe26892de5708186/applet/packages/wx1644b5d3f47969f0/15')
BUILD = os.environ.get(
    'FKSZW_BUILD', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))

PACKAGES = {
    '__APP__': 'app',
    '_subpackages_config_': 'config',
    '_subpackages_assets_bundle_': 'assets',
    '_subpackages_wx_sdk_': 'wx_sdk',
}


def decrypt(src, dst):
    data = open(src, 'rb').read()
    if data[:6] != b'V1MMWX':
        raise SystemExit(f'not a V1MMWX package: {src} magic={data[:6]!r}')
    key = PBKDF2(APPID.encode(), SALT, dkLen=32, count=1000, hmac_hash_module=SHA1)
    head = AES.new(key, AES.MODE_CBC, IV).decrypt(data[6:6 + 1024])[:1023]
    xor_key = ord(APPID[-2])
    tail = bytes(b ^ xor_key for b in data[6 + 1024:])
    plain = head + tail
    if plain[:1] != b'\xbe':
        raise SystemExit(f'decrypt failed: first byte {plain[:1]!r}')
    open(dst, 'wb').write(plain)
    return dst


def entries_of(path):
    d = open(path, 'rb').read()
    index_len = int.from_bytes(d[5:9], 'big')
    body_ofs = 14 + index_len
    p = 14
    n = int.from_bytes(d[p:p + 4], 'big')
    p += 4
    ents = []
    for _ in range(n):
        nl = int.from_bytes(d[p:p + 4], 'big')
        p += 4
        nm = d[p:p + nl].decode('utf-8', 'replace')
        p += nl
        ofs = int.from_bytes(d[p:p + 4], 'big')
        p += 4
        size = int.from_bytes(d[p:p + 4], 'big')
        p += 4
        ents.append((nm, ofs, size))
    return d, body_ofs, ents


def unpack(dec_path, outdir):
    d, body_ofs, ents = entries_of(dec_path)
    # 自校验：窗口按 ofs 排序后无缝铺满 body，首个 ofs == body_ofs
    first_ofs = min(e[1] for e in ents)
    assert first_ofs == body_ofs, f'ofs 偏移模型不符: first={first_ofs} body={body_ofs}'
    for nm, ofs, size in ents:
        out = os.path.join(outdir, nm.lstrip('/'))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out, 'wb').write(d[ofs:ofs + size])
    return ents


def recover_docs(dec_path):
    d = open(dec_path, 'rb').read()
    body = 14 + int.from_bytes(d[5:9], 'big')
    s = d[body:].decode('utf-8', 'replace')
    dec = json.JSONDecoder()
    docs = []
    skip_until = -1
    for m in re.finditer(r'\{"', s):
        i = m.start()
        if i < skip_until:
            continue
        try:
            v, end = dec.raw_decode(s, i)
        except Exception:
            continue
        docs.append((i, v))
        skip_until = end
    return len(s), docs


def main():
    pkgdir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PKG
    decdir = os.path.join(BUILD, 'dec')
    unpdir = os.path.join(BUILD, 'unpack')
    os.makedirs(decdir, exist_ok=True)
    for stem, sub in PACKAGES.items():
        src = os.path.join(pkgdir, stem + '.wxapkg')
        if not os.path.exists(src):
            print('跳过（不存在）:', src)
            continue
        dec = decrypt(src, os.path.join(decdir, stem + '.dec.wxapkg'))
        n = unpack(dec, os.path.join(unpdir, sub))
        print(f'{stem}: 解密 {os.path.getsize(dec)//1024}KB, 解包 {len(n)} 文件 -> {sub}/')

    cfg_dec = os.path.join(decdir, '_subpackages_config_.dec.wxapkg')
    total, docs = recover_docs(cfg_dec)
    out = os.path.join(BUILD, 'config_docs.pkl')
    pickle.dump(docs, open(out, 'wb'))
    print(f'文档流 {total//1024}KB -> 恢复 {len(docs)} 文档 -> {out}')
    kinds = {}
    for _, v in docs:
        if isinstance(v, dict):
            if 'levelName' in v:
                kinds['level'] = kinds.get('level', 0) + 1
            elif set(v.keys()) == {'bg', 'end', 'level', 'name', 'theme'}:
                kinds['index'] = kinds.get('index', 0) + 1
            elif set(v.keys()) == {'icon', 'name', 'type'}:
                kinds['catalog'] = kinds.get('catalog', 0) + 1
    print('文档分类:', kinds)


if __name__ == '__main__':
    main()
