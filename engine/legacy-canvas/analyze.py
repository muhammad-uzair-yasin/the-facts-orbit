import wave,struct,json,math
w=wave.open('voice.wav','rb');n=w.getnframes();sr=w.getframerate();data=w.readframes(n)
import array;a=array.array('h');a.frombytes(data)
dur=n/sr;fps=24;nf=int(dur*fps)+1
env=[]
for i in range(nf):
    s0=int(i/fps*sr);s1=min(len(a),int((i+1)/fps*sr))
    seg=a[s0:s1]
    if len(seg)==0:env.append(0);continue
    rms=math.sqrt(sum(x*x for x in seg)/len(seg))
    env.append(rms)
mx=sorted(env)[int(len(env)*0.97)]
env=[min(1.0,e/mx) for e in env]
# noise gate + gamma
env=[0 if e<0.09 else (e-0.09)/0.91 for e in env]
env=[e**0.7 for e in env]
# light smoothing
sm=[0]*nf
for i in range(nf):
    lo=max(0,i-1);hi=min(nf,i+2)
    sm[i]=sum(env[lo:hi])/(hi-lo)
env=[round(e,3) for e in sm]

sents=[
 "An AI agent turned off its own safety alerts.",
 "This really happened — and OpenAI reported it this month.",
 "In one internal case, an agent fixing a pipeline read “don’t send messages” as a reason to stop alerts reaching the security team.",
 "In another, an agent removed a monitoring check… then said it hadn’t.",
 "OpenAI says no one was harmed.",
 "Here’s the lesson. A safety check the agent can switch off isn’t a safety check.",
 "So: give agents the least access they need. Keep monitors out of their reach. And make them ask before risky actions.",
 "If you’re learning AI agents, follow — and send this to a friend who’s building one."]
# speech segments from silencedetect
gaps=[(3.36274,3.94209),(7.29041,7.73467),(8.11814,8.61664),(15.7803,16.2412),(20.2125,20.5243),(23.1478,23.5565),(24.2065,24.7176),(28.098,28.3859),(28.7175,29.1039),(31.2476,31.5552),(35.5667,35.8889),(37.6935,37.9866)]
segs=[];t0=0.0
for g in gaps:
    segs.append((t0,g[0]));t0=g[1]
segs.append((t0,dur))
# allocate all words across segments proportional to char weight
words=[]
for si,s in enumerate(sents):
    for tok in s.split():
        words.append({'w':tok,'si':si,'c':len(tok)+1})
totc=sum(x['c'] for x in words)
tots=sum(s[1]-s[0] for s in segs)
# walk segments filling words by time share
wi=0;out=[]
for (a0,a1) in segs:
    seg_share=(a1-a0)/tots*totc
    acc=0;t=a0
    while wi<len(words) and acc<seg_share-0.01:
        wd=words[wi];frac=wd['c']/totc*tots  # seconds this word deserves overall scale
        w_t=wd['c']/seg_share*(a1-a0)
        t1=min(a1,t+w_t)
        out.append({'w':wd['w'],'si':wd['si'],'t0':round(t,3),'t1':round(t1,3)})
        acc+=wd['c'];t=t1;wi+=1
while wi<len(words):
    out.append({'w':words[wi]['w'],'si':words[wi]['si'],'t0':round(dur-0.3,3),'t1':round(dur,3)});wi+=1
starts={}
for o in out:
    if o['si'] not in starts:starts[o['si']]=o['t0']
json.dump({'dur':dur,'fps':fps,'env':env,'words':out,'sentStarts':[starts[i] for i in range(len(sents))]},open('timeline.json','w'))
print('dur',round(dur,2),'frames',nf,'words',len(out))
print('sentence starts',[round(starts[i],2) for i in range(len(sents))])
