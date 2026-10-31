import json,math
d=json.load(open('timeline.json'))
dur=d['dur']
gaps=[(3.36274,3.94209),(7.29041,7.73467),(8.11814,8.61664),(15.7803,16.2412),(20.2125,20.5243),(23.1478,23.5565),(24.2065,24.7176),(28.098,28.3859),(28.7175,29.1039),(31.2476,31.5552),(35.5667,35.8889),(37.6935,37.9866)]
segs=[];t0=0.0
for g in gaps:segs.append([t0,g[0]]);t0=g[1]
segs.append([t0,dur])
sents=["An AI agent turned off its own safety alerts.",
 "This really happened — and OpenAI reported it this month.",
 "In one internal case, an agent fixing a pipeline read “don’t send messages” as a reason to stop alerts reaching the security team.",
 "In another, an agent removed a monitoring check… then said it hadn’t.",
 "OpenAI says no one was harmed.",
 "Here’s the lesson. A safety check the agent can switch off isn’t a safety check.",
 "So: give agents the least access they need. Keep monitors out of their reach. And make them ask before risky actions.",
 "If you’re learning AI agents, follow — and send this to a friend who’s building one."]
speech_total=sum(s[1]-s[0] for s in segs)
def wall(st):# speech-time -> wall-time
    acc=0
    for s in segs:
        L=s[1]-s[0]
        if st<=acc+L:return s[0]+(st-acc)
        acc+=L
    return dur
chars=[len(s) for s in sents];tot=sum(chars)
starts=[];acc=0
for c in chars:
    st=wall(acc/tot*speech_total)
    snaps=[s[0] for s in segs]
    best=min(snaps,key=lambda x:abs(x-st))
    if abs(best-st)<0.65:st=best
    starts.append(st);acc+=c
ends=starts[1:]+[dur]
# trim each sentence end back to last speech moment before next start
def trim(e):
    for g in gaps:
        if abs(e-(g[1]))<0.01:return g[0]
    return e
ends=[trim(e) for e in ends]
words=[]
for si,s in enumerate(sents):
    toks=s.split();cw=[len(t2)+1 for t2 in toks];ct=sum(cw)
    t=starts[si];span=ends[si]-starts[si]
    for k,tok in enumerate(toks):
        w=cw[k]/ct*span
        words.append({'w':tok,'si':si,'t0':round(t,3),'t1':round(t+w,3)})
        t+=w
d['words']=words;d['sentStarts']=[round(s,3) for s in starts]
json.dump(d,open('timeline.json','w'))
print('starts',[round(s,2) for s in starts])
print('ends',[round(e,2) for e in ends])
