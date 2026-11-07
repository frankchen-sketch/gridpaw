import json,os,re
plan=json.load(open('data/level_plan_2026-11-08.json'))
tt={int(f.split('.')[0]):json.load(open(f'data/tt_steps/{f}')) for f in os.listdir('data/tt_steps') if f.endswith('.json')}
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower())
def words(s):
    stop=set("a an the to of on in from into onto at with and or your you his her their them it its this that then next up down left right do not is are be so".split())
    return {w for w in re.findall(r"[a-z']+",s.lower()) if w not in stop and len(w)>2}
def ov(a,b):
    if not a or not b: return 0.0
    bw=[words(x) for x in b]; hit=0
    for s in a:
        w=words(s)
        if any(len(w&x)>=2 for x in bw): hit+=1
    return hit/len(a)
rows=[]
for k,d in plan['levels'].items():
    best=(-1,None)
    for n,p in tt.items():
        if len(p['steps'])<4: continue
        if abs(len(p['steps'])-len(d['steps']))>6: continue
        o=ov(d['steps'],p['steps'])
        if o>best[0]: best=(o,n)
    alt=(-1,None)
    if d.get('alt'):
        for n,p in tt.items():
            o=ov(d['alt']['steps'],p['steps'])
            if o>alt[0]: alt=(o,n)
    nm=tt[best[1]]['name'] if best[1] else None
    rows.append((d['n'],d['name'],round(best[0],2),best[1],nm,round(alt[0],2) if alt[1] else None))
import statistics
os_=[r[2] for r in rows]
print('primary best-overlap: mean %.2f median %.2f | >=0.7:%d >=0.5:%d <0.35:%d'%(sum(os_)/len(os_),statistics.median(os_),sum(1 for x in os_ if x>=0.7),sum(1 for x in os_ if x>=0.5),sum(1 for x in os_ if x<0.35)))
nameeq=sum(1 for r in rows if r[4] and norm(r[4])==norm(r[1]))
print('name also equal:',nameeq,'/',len(rows))
a=[r[5] for r in rows if r[5] is not None]
print('alt best-overlap: mean %.2f | >=0.5:%d/%d'%(sum(a)/len(a),sum(1 for x in a if x>=0.5),len(a)))
print('lowest 12:',[ (r[0],r[1][:18],r[2],r[4]) for r in sorted(rows,key=lambda r:r[2])[:12]])
print('highest 5:',[ (r[0],r[1][:18],r[2],r[4]) for r in sorted(rows,key=lambda r:-r[2])[:5]])
json.dump({str(r[0]):{'tt_best':r[3],'ov':r[2],'tt_name':r[4],'alt_ov':r[5]} for r in rows},open('data/tt_match.json','w'),ensure_ascii=False,indent=1)
