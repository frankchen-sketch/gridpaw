#!/usr/bin/env python3
"""从 config_docs.pkl 导出 81 关全量摆放数据 -> build/fkszw_levels_all.json

每关一条：{seq, levelName, bg, bgPosX, itemTypes(order), items(content)}
注意：seq 是文档流顺序，不是游戏关卡号；游戏关卡号由索引文档 {bg,end,level,name,theme}
的 bg→level 映射决定（render_levels_v7.load_levels 负责换算）。
用法: python3 export_levels_all.py
"""
import json
import os
import pickle

BUILD = os.environ.get(
    'FKSZW_BUILD', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))


def main():
    docs = pickle.load(open(f'{BUILD}/config_docs.pkl', 'rb'))
    # config_docs.pkl 的 docs 是 (id, doc) 元组对，必须解包迭代
    levels = [(i, v) for i, v in docs if isinstance(v, dict) and 'levelName' in v]
    export = []
    for rank, (i, v) in enumerate(levels, 1):
        export.append({
            'seq': rank,
            'levelName': v['levelName'],
            'bg': v.get('bg'),
            'bgPosX': v.get('bgPosX'),
            'itemTypes': v['order'],
            'items': v['content'],
        })
    fp = f'{BUILD}/fkszw_levels_all.json'
    json.dump(export, open(fp, 'w'), ensure_ascii=False)
    n_items = sum(len(e['items']) for e in export)
    print(f'导出: {fp} {os.path.getsize(fp)//1024}KB, {len(export)} 关, {n_items} 件物品')
    l47 = [e for e in export if str(e['bg']) == '47']
    if l47:
        print(f"L47(bg=47): {l47[0]['levelName']} {len(l47[0]['items'])} 件, "
              f"{len(l47[0]['itemTypes'])} 桶 order")


if __name__ == '__main__':
    main()
