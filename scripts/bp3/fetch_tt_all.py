import json,os,re,html,subprocess,time
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
PROXY="http://127.0.0.1:7880"
tt={int(k):v for k,v in json.load(open('data/tt_map.json')).items()}
os.makedirs('data/tt_steps',exist_ok=True)
todo=[n for n in sorted(tt) if not os.path.exists(f'data/tt_steps/{n}.json')]
print('fetch',len(todo))
for i,n in enumerate(todo,1):
    url=f"https://trickystorywalkthrough.com/brain-puzzle-3-crazy-mind-level-{n}-solution/"
    raw=subprocess.run(["curl","-sL","-x",PROXY,"-A",UA,"--max-time","35",url],capture_output=True,text=True).stdout
    m=re.search(r'Step by Step Hints.*?<ul>(.*?)</ul>',raw,re.S)
    steps=[]
    if m:
        for li in re.findall(r'<li[^>]*>(.*?)</li>',m.group(1),re.S):
            t=re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>','',li))).strip()
            if t: steps.append(t)
    vid=re.search(r'youtube(?:-nocookie)?\.com/embed/([\w-]{11})',raw)
    json.dump({'n':n,'name':tt[n],'steps':steps,'video':vid.group(1) if vid else None},open(f'data/tt_steps/{n}.json','w'),ensure_ascii=False)
    if i%25==0: print(' ...',i)
    time.sleep(0.3)
print('done',len(os.listdir('data/tt_steps')))
