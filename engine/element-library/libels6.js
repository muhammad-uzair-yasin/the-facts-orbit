// ---------- WEB UI ----------
def('WEB UI','LOGIN FORM',t=>{card(240,620,600,560,30);txt('Sign in',540,710,'800 48px Inter','#fff','center');
 rr(300,760,480,90,18);ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fill();typeT('uzair@postsiva.com',clamp(t*2,0,1),330,818,'700 34px Inter','#fff');
 rr(300,880,480,90,18);ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fill();
 const pw=Math.floor(clamp((t-0.5)*2,0,1)*8);for(let i=0;i<pw;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(345+i*34,925,8,0,7);ctx.fill();}
 rr(300,1010,480,100,20);ctx.fillStyle=t>1.1?GRN:ACC;ctx.fill();txt(t>1.1?'Welcome ✓':'Continue',540,1075,'800 40px Inter','#fff','center');});
def('WEB UI','COOKIE BANNER',t=>{card(220,600,640,420);txt('This site uses',540,720,'700 38px Inter','rgba(255,255,255,0.7)','center');txt('🍪 cookies',540,790,'800 56px Inter','#fff','center');
 const p=E((t-0.3)*3);if(p>0){ctx.save();ctx.globalAlpha=p;rr(300,870,230,90,18);ctx.fillStyle=GRN;ctx.fill();txt('Accept',415,928,'800 34px Inter','#fff','center');
 rr(560,870,230,90,18);ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fill();txt('Decline',675,928,'800 34px Inter','rgba(255,255,255,0.7)','center');ctx.restore();}
 if(t>0.85)cursorA(430,975,(t-0.95)*5);});
def('WEB UI','MODAL POP',t=>{ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(70,330,940,1180);const p=EB(t*2.2);
 ctx.save();ctx.translate(540,880);ctx.scale(p,p);ctx.fillStyle='#15203a';rr(-300,-240,600,480,30);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;rr(-300,-240,600,480,30);ctx.stroke();
 txt('✕',250,-180,'700 40px Inter','rgba(255,255,255,0.5)','center');
 txt('Delete this agent?',0,-110,'800 46px Inter','#fff','center');txt('This cannot be undone.',0,-40,'700 32px Inter','rgba(255,255,255,0.55)','center');
 rr(-260,60,240,90,18);ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();txt('Cancel',-140,118,'800 34px Inter','#fff','center');
 rr(20,60,240,90,18);ctx.fillStyle=RED;ctx.fill();txt('Delete',140,118,'800 34px Inter','#fff','center');ctx.restore();});
def('WEB UI','DROPDOWN',t=>{rr(290,640,500,100,20);ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();txt('Choose model',330,705,'700 38px Inter','#fff');
 ctx.save();ctx.translate(740,690);ctx.rotate(t>0.2?3.14*sm((t-0.2)*4):0);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-18,-10);ctx.lineTo(18,-10);ctx.lineTo(0,14);ctx.fill();ctx.restore();
 ['GPT-6','Claude','Gemini','Llama'].forEach((s,i)=>{const p=E((t-0.3)*4-i*0.12);if(p<=0)return;ctx.globalAlpha=p;
  const y=760+i*110;rr(290,y,500,100,18);ctx.fillStyle=i===1&&t>1?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.07)';ctx.fill();txt(s,330,y+64,'700 36px Inter','#fff');ctx.globalAlpha=1;});
 if(t>0.9)cursorA(600,900,(t-1.05)*5);});
def('WEB UI','TOASTS',t=>{[['Saved ✓',GRN],['Render queued',ACC],['1 warning',AMB]].forEach((c,i)=>{const p=E(t*2.4-i*0.35);if(p<=0)return;
 const x=W-440+(1-p)*400;const y=640+i*130;ctx.globalAlpha=Math.min(1,p);
 rr(x,y,400,100,20);ctx.fillStyle='#15203a';ctx.fill();ctx.fillStyle=c[1];ctx.fillRect(x,y,12,100);
 txt(c[0],x+50,y+62,'700 34px Inter','#fff');ctx.globalAlpha=1;});});
def('WEB UI','STEPPER',t=>{const steps=['Brief','Script','Voice','Render'];const done=Math.min(3,Math.floor(t*3.2));
 steps.forEach((s,i)=>{const x=220+i*215;const on=i<=done;
  if(i<3){ctx.strokeStyle=i<done?GRN:'rgba(255,255,255,0.25)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+50,860);ctx.lineTo(x+165,860);ctx.stroke();}
  ctx.fillStyle=on?GRN:'#2a3044';ctx.beginPath();ctx.arc(x,860,44,0,7);ctx.fill();
  txt(on?'✓':''+(i+1),x,876,'800 40px Inter','#fff','center');txt(s,x,960,'700 30px Inter',on?'#fff':'rgba(255,255,255,0.45)','center');});});
def('WEB UI','FILE UPLOAD',t=>{ctx.setLineDash([24,16]);ctx.strokeStyle=t>0.6?GRN:'rgba(255,255,255,0.4)';ctx.lineWidth=6;rr(240,640,600,440,30);ctx.stroke();ctx.setLineDash([]);
 const p=sm(t*1.8);const y=560+p*220;ctx.save();ctx.translate(540,y);ctx.rotate((1-p)*0.3);
 ctx.fillStyle='#e8eaf0';rr(-70,-90,140,180,14);ctx.fill();ctx.fillStyle='#8fa2c4';ctx.beginPath();ctx.moveTo(30,-90);ctx.lineTo(70,-50);ctx.lineTo(30,-50);ctx.fill();
 txt('MP3',0,20,'800 36px Inter','#39405a','center');ctx.restore();
 if(t>0.75){const b=sm((t-0.75)*3);rr(320,1000,440*b,20,10);ctx.fillStyle=GRN;ctx.fill();}
 txt(t>1.3?'uploaded ✓':'drop audio here',540,1140,'700 36px Inter',t>1.3?GRN:'rgba(255,255,255,0.6)','center');});
def('WEB UI','CAROUSEL',t=>{const p=sm((t-0.4)*2);const off=-p*340;
 for(let i=0;i<4;i++){const x=240+i*340+off;if(x<-100||x>1100)continue;const focus=Math.abs(x-440)<180;
  ctx.save();ctx.globalAlpha=focus?1:0.45;ctx.translate(x,880);ctx.scale(focus?1:0.88,focus?1:0.88);
  ctx.fillStyle=['#15203a','#1b2a4a','#15203a','#1b2a4a'][i];rr(-150,-220,300,440,28);ctx.fill();ctx.strokeStyle=focus?ACC:'rgba(255,255,255,0.2)';ctx.lineWidth=4;rr(-150,-220,300,440,28);ctx.stroke();
  txt('TIP '+(i+1),0,-140,'800 40px Inter',ACC2,'center');ctx.restore();}
 [0,1,2,3].forEach(i=>{ctx.beginPath();ctx.arc(480+i*40,1190,i===(p>0.5?1:0)?14:9,0,7);ctx.fillStyle=i===(p>0.5?1:0)?'#fff':'rgba(255,255,255,0.3)';ctx.fill();});});
def('WEB UI','PRICING TABLE',t=>{[['FREE','$0',GRN,0],['PRO','$19',ACC,1]].forEach(c=>{const i=c[3];const p=EB(t*2-i*0.25);if(p<=0)return;
 ctx.save();ctx.translate(330+i*420,880);ctx.scale(Math.min(1,p),Math.min(1,p));
 ctx.fillStyle='#101626';rr(-180,-300,360,600,28);ctx.fill();ctx.strokeStyle=c[2];ctx.lineWidth=i?6:3;rr(-180,-300,360,600,28);ctx.stroke();
 txt(c[0],0,-200,'800 40px Inter',c[2],'center');txt(c[1],0,-90,'90px "Archivo Black"','#fff','center');
 ['agents','voice','render'].forEach((f,k)=>{txt('✓ '+f,0,0+k*70,'700 32px Inter','rgba(255,255,255,0.75)','center');});
 rr(-130,220,260,80,40);ctx.fillStyle=c[2];ctx.fill();txt('Start',0,272,'800 34px Inter','#fff','center');ctx.restore();});});
def('WEB UI','STAR RATING',t=>{for(let i=0;i<5;i++){const p=EB(t*2.4-i*0.22);if(p<=0)continue;
 ctx.save();ctx.translate(300+i*120,860);ctx.scale(p,p);ctx.fillStyle=i<4?AMB:'rgba(255,255,255,0.25)';
 ctx.beginPath();for(let k=0;k<10;k++){const r2=k%2?22:52;const a=k*0.628-1.57;ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);}ctx.closePath();ctx.fill();ctx.restore();}
 if(t>1.2)txt('4.8 · 2,140 reviews',540,1000,'700 36px Inter','rgba(255,255,255,0.7)','center');});
def('WEB UI','DARK TOGGLE',t=>{const dark=t>0.5;const p=sm((t-0.5)*5);
 ctx.fillStyle=dark?'#0a0f1c':'#dbe7ff';rr(240,700,600,360,40);ctx.fill();
 txt(dark?'dark mode':'light mode',540,800,'800 44px Inter',dark?'#fff':'#1b2130','center');
 rr(390,880,300,110,55);ctx.fillStyle=dark?ACC:'#9db5e0';ctx.fill();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(447+p*186,935,44,0,7);ctx.fill();
 ctx.font='40px Inter';ctx.textAlign='center';ctx.fillText(dark?'🌙':'☀️',447+p*186,950);ctx.textAlign='left';});
def('WEB UI','SKELETON LOAD',t=>{const sh=(t*1.4)%1;card(240,620,600,560,30);
 [[280,680,220,120,24],[520,680,280,40,12],[520,740,240,40,12],[280,840,520,36,10],[280,910,470,36,10],[280,980,520,36,10],[280,1070,260,70,18]].forEach(b=>{
  rr(b[0],b[1],b[2],b[3],b[4]);ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();});
 ctx.save();rr(240,620,600,560,30);ctx.clip();const g=ctx.createLinearGradient(240+sh*800-200,0,240+sh*800,0);
 g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.5,'rgba(255,255,255,0.14)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(240,620,600,560);ctx.restore();});
// ---------- CHARTS 2 ----------
def('CHARTS 2','RADAR',t=>{const ax=['speed','cost','iq','tools','safety'];const vals=[0.9,0.7,0.85,0.6,0.95];
 ctx.save();ctx.translate(540,880);for(let r2=1;r2<=3;r2++){ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;ctx.beginPath();
  for(let i=0;i<=5;i++){const a=i*1.256-1.57;ctx.lineTo(Math.cos(a)*r2*90,Math.sin(a)*r2*90);}ctx.stroke();}
 const p=sm(t*1.4);ctx.beginPath();for(let i=0;i<=5;i++){const a=(i%5)*1.256-1.57;const v=vals[i%5]*p*270;ctx.lineTo(Math.cos(a)*v,Math.sin(a)*v);}
 ctx.fillStyle='rgba(59,130,246,0.3)';ctx.fill();ctx.strokeStyle=ACC;ctx.lineWidth=6;ctx.stroke();
 ax.forEach((s,i)=>{const a=i*1.256-1.57;txt(s,Math.cos(a)*320,Math.sin(a)*320+10,'700 30px Inter','rgba(255,255,255,0.7)','center');});ctx.restore();});
def('CHARTS 2','CANDLESTICK',t=>{const n=Math.floor(sm(t*1.3)*9)+1;
 for(let i=0;i<n;i++){const x=240+i*70;const up=R(i)>0.4;const o=800+R(i+3)*160,c2=o+(up?-1:1)*(40+R(i+7)*120);
  ctx.strokeStyle=up?GRN:RED;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,Math.min(o,c2)-40);ctx.lineTo(x,Math.max(o,c2)+40);ctx.stroke();
  ctx.fillStyle=up?GRN:RED;ctx.fillRect(x-20,Math.min(o,c2),40,Math.abs(c2-o));}
 txt('AI stocks',540,640,'800 40px Inter','rgba(255,255,255,0.7)','center');});
def('CHARTS 2','SCATTER',t=>{ctx.strokeStyle='rgba(255,255,255,0.25)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(240,660);ctx.lineTo(240,1120);ctx.lineTo(850,1120);ctx.stroke();
 for(let i=0;i<22;i++){const p=EB(t*2.4-i*0.05);if(p<=0)continue;const x=280+R(i)*540,y=1080-R(i+5)*380-R(i)*60;
  ctx.save();ctx.translate(x,y);ctx.scale(p,p);ctx.fillStyle=R(i+9)>0.5?ACC:CYN;ctx.globalAlpha=0.85;ctx.beginPath();ctx.arc(0,0,10+R(i+2)*14,0,7);ctx.fill();ctx.restore();}
 const lp=sm((t-0.7)*2);if(lp>0){ctx.strokeStyle=AMB;ctx.lineWidth=6;ctx.setLineDash([18,14]);ctx.beginPath();ctx.moveTo(280,1050);ctx.lineTo(280+lp*540,1050-lp*360);ctx.stroke();ctx.setLineDash([]);}});
def('CHARTS 2','FUNNEL',t=>{[['VIEWS','100K',940],['LIKES','12K',700],['FOLLOWS','1.4K',460],['FANS','300',250]].forEach((f,i)=>{const p=E(t*2.2-i*0.25);if(p<=0)return;
 const y=640+i*130;const w=f[2]*p;ctx.fillStyle=[ACC,CYN,GRN,AMB][i];
 ctx.beginPath();ctx.moveTo(540-w/2,y);ctx.lineTo(540+w/2,y);ctx.lineTo(540+w/2*0.8,y+110);ctx.lineTo(540-w/2*0.8,y+110);ctx.closePath();ctx.fill();
 txt(f[0]+'  '+f[1],540,y+70,'800 34px Inter','#07101f','center');});});
def('CHARTS 2','HISTOGRAM',t=>{const vals=[2,5,9,14,18,15,10,6,3];
 vals.forEach((v,i)=>{const p=sm(t*1.8-i*0.08);const h=v*24*p;ctx.fillStyle='rgba(99,150,255,0.85)';ctx.fillRect(240+i*68,1100-h,60,h);});
 ctx.strokeStyle=AMB;ctx.lineWidth=6;ctx.beginPath();const p2=sm((t-0.5)*2);
 for(let i=0;i<=40*p2;i++){const q=i/40;const x=240+q*610;const g=Math.exp(-Math.pow((q-0.5)*3.2,2))*440;i?ctx.lineTo(x,1100-g):ctx.moveTo(x,1100-g);}ctx.stroke();});
def('CHARTS 2','DONUT LEGEND',t=>{const segs=[[0.4,ACC,'video'],[0.3,GRN,'tools'],[0.2,AMB,'news'],[0.1,RED,'misc']];let a0=-1.57;const p=sm(t*1.4);
 segs.forEach(s=>{const a1=a0+s[0]*6.28*p;ctx.strokeStyle=s[1];ctx.lineWidth=70;ctx.beginPath();ctx.arc(420,860,180,a0,a1);ctx.stroke();a0=a1;});
 txt('30d',420,880,'800 56px Inter','#fff','center');
 segs.forEach((s,i)=>{const y=700+i*90;ctx.fillStyle=s[1];rr(680,y,36,36,10);ctx.fill();txt(s[2],740,y+30,'700 34px Inter','#fff');});});
def('CHARTS 2','STACKED BARS',t=>{for(let i=0;i<5;i++){const x=250+i*130;let y=1100;
 [[0.3,ACC],[0.25,GRN],[0.2,AMB]].forEach((s,k)=>{const h=s[0]*(300+R(i+k)*240)*sm(t*1.6-i*0.1-k*0.15);ctx.fillStyle=s[1];ctx.fillRect(x,y-h,90,h);y-=h;});}
 txt('M  T  W  T  F',540,1170,'700 36px ui-monospace,monospace','rgba(255,255,255,0.6)','center');});
def('CHARTS 2','BUBBLES',t=>{[['GPT',0.9,ACC],['Claude',1.15,VIO],['Gemini',0.8,CYN],['Llama',0.6,GRN],['Grok',0.5,AMB]].forEach((b,i)=>{const p=EB(t*1.8-i*0.15);if(p<=0)return;
 const x=270+R(i)*540,y=700+R(i+4)*360;const r2=b[1]*95*p;
 ctx.globalAlpha=0.3;ctx.fillStyle=b[2];ctx.beginPath();ctx.arc(x,y,r2,0,7);ctx.fill();ctx.globalAlpha=1;
 ctx.strokeStyle=b[2];ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,r2,0,7);ctx.stroke();txt(b[0],x,y+12,'800 '+Math.round(r2*0.38)+'px Inter','#fff','center');});});
def('CHARTS 2','TIMELINE',t=>{ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(240,880);ctx.lineTo(240+sm(t*1.3)*600,880);ctx.stroke();
 [['2023','LLMs'],['2024','RAG'],['2025','Agents'],['2026','Teams']].forEach((m,i)=>{const p=EB(t*2-i*0.3);if(p<=0)return;
  const x=270+i*180;ctx.save();ctx.translate(x,880);ctx.scale(p,p);ctx.fillStyle=ACC;ctx.beginPath();ctx.arc(0,0,22,0,7);ctx.fill();ctx.restore();
  txt(m[0],x,i%2?800:980,'800 34px Inter',ACC2,'center');txt(m[1],x,i%2?760:1030,'700 30px Inter','rgba(255,255,255,0.7)','center');});});
def('CHARTS 2','KPI ROW',t=>{[['VIEWS','1.2M',GRN,'+34%'],['CTR','5.8%',AMB,'+2%'],['SUBS','48K',ACC,'+12%']].forEach((k,i)=>{const p=EB(t*2-i*0.2);if(p<=0)return;
 ctx.save();ctx.translate(290+i*250,880);ctx.scale(Math.min(1,p),Math.min(1,p));
 ctx.fillStyle='#101626';rr(-110,-130,220,260,24);ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=2;rr(-110,-130,220,260,24);ctx.stroke();
 txt(k[0],0,-70,'700 26px Inter','rgba(255,255,255,0.5)','center');txt(k[1],0,10,'800 52px Inter','#fff','center');txt(k[3],0,80,'800 30px Inter',k[2],'center');ctx.restore();});});
