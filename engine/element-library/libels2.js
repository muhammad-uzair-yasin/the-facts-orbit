// ---------- AI & AGENTS ----------
def('AI AGENTS','NEURAL NET',t=>{const L=[[300,3],[540,4],[780,2]];const pos=[];
 L.forEach((l,li)=>{const col=[];for(let i=0;i<l[1];i++){col.push([l[0],740+ (i-(l[1]-1)/2)*150]);}pos.push(col);});
 for(let a=0;a<2;a++)pos[a].forEach(p1=>pos[a+1].forEach(p2=>{const lit=(t*2-a*0.5)%2<1;ctx.strokeStyle=lit?'rgba(147,197,253,0.7)':'rgba(255,255,255,0.15)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();}));
 pos.flat().forEach((p,i)=>{const pu=0.5+0.5*Math.sin(t*4+i);glow(p[0],p[1],40,'rgba(99,150,255,'+(0.3+pu*0.4)+')');ctx.fillStyle='#cfe0ff';ctx.beginPath();ctx.arc(p[0],p[1],20,0,7);ctx.fill();});});
def('AI AGENTS','ROBOT HEAD',t=>{const bl=Math.abs(Math.sin(t*3))>0.92;
 glow(CX,690,60,'rgba(59,130,246,0.9)',0.5+0.4*Math.sin(t*6));ctx.fillStyle=ACC;ctx.beginPath();ctx.arc(CX,690,16,0,7);ctx.fill();ctx.strokeStyle='#8fa2c4';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(CX,706);ctx.lineTo(CX,760);ctx.stroke();
 ctx.fillStyle='#39405a';rr(340,760,400,340,60);ctx.fill();ctx.fillStyle='#1b2130';rr(380,820,320,180,40);ctx.fill();
 ctx.fillStyle=CYN;if(bl){rr(430,900,80,10,5);ctx.fill();rr(570,900,80,10,5);ctx.fill();}else{ctx.beginPath();ctx.arc(470,905,34,0,7);ctx.fill();ctx.beginPath();ctx.arc(610,905,34,0,7);ctx.fill();}
 rr(450,1030,180,26,13);ctx.fillStyle='rgba(255,255,255,0.4)';ctx.fill();});
def('AI AGENTS','AI CHIP',t=>{ctx.save();ctx.translate(CX,880);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const p=sm((t*1.6-i*0.08)%1.4);ctx.strokeStyle='rgba(147,197,253,'+(0.9-p*0.6)+')';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(Math.cos(a)*150,Math.sin(a)*150);ctx.lineTo(Math.cos(a)*(150+p*160),Math.sin(a)*(150+p*160));ctx.stroke();
  ctx.fillStyle=ACC2;ctx.beginPath();ctx.arc(Math.cos(a)*(150+p*160),Math.sin(a)*(150+p*160),8,0,7);ctx.fill();}
 rr(-150,-150,300,300,30);ctx.fillStyle='#101626';ctx.fill();ctx.strokeStyle=ACC;ctx.lineWidth=6;ctx.stroke();
 glow(0,0,130,'rgba(59,130,246,0.6)');txt('AI',0,30,'110px "Archivo Black"','#fff','center');ctx.restore();});
def('AI AGENTS','PROMPT BOX',t=>{card(170,780,740,180,40);
 typeT('build me a website',clamp(t*1.6,0,1),230,890,'700 44px Inter','#fff');
 const fly=sm((t-0.72)*4);ctx.save();ctx.translate(810+fly*160,870-fly*120);ctx.rotate(-0.4-fly*0.3);ctx.fillStyle=fly>0?ACC2:ACC;
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-54,20);ctx.lineTo(-40,0);ctx.lineTo(-54,-20);ctx.closePath();ctx.fill();ctx.restore();});
def('AI AGENTS','THINKING',t=>{ctx.strokeStyle=VIO;ctx.lineWidth=10;ctx.lineCap='round';
 ctx.beginPath();ctx.arc(CX-60,840,110,Math.PI*0.6,Math.PI*1.9);ctx.stroke();ctx.beginPath();ctx.arc(CX+70,850,95,Math.PI*1.2,Math.PI*0.6);ctx.stroke();
 ctx.beginPath();ctx.arc(CX+10,760,80,Math.PI,Math.PI*2.2);ctx.stroke();
 for(let i=0;i<3;i++){const p=(t*1.8-i*0.25)%1;if(p<0)continue;ctx.globalAlpha=1-p;ctx.fillStyle=VIO;ctx.beginPath();ctx.arc(CX-40+i*60,1020+ -p*60,14+i*2,0,7);ctx.fill();}ctx.globalAlpha=1;
 txt('thinking…',CX,1160,'700 40px Inter','rgba(255,255,255,0.6)','center');});
def('AI AGENTS','TOKEN STREAM',t=>{rr(640,760,260,240,26);ctx.fillStyle='#101626';ctx.fill();ctx.strokeStyle=ACC;ctx.lineWidth=5;ctx.stroke();txt('LLM',770,900,'800 56px Inter','#fff','center');
 ['the','cat','sat','on'].forEach((w,i)=>{const p=(t*1.5-i*0.3)%1.6;if(p<0||p>1)return;const x=180+p*430,y=820+Math.sin(p*5+i)*40;
  ctx.globalAlpha=p>0.85?(1-p)*6:1;chip(w,x,y,'rgba(147,197,253,0.2)','#cfe0ff',30);ctx.globalAlpha=1;});
 glow(770,880,140,'rgba(59,130,246,'+(0.3+0.3*Math.sin(t*8))+')');});
def('AI AGENTS','AGENT LOOP',t=>{const steps=[['SENSE',0],['PLAN',1],['ACT',2]];const act=Math.floor(t*2.2)%3;
 ctx.save();ctx.translate(CX,880);ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=8;
 for(let i=0;i<3;i++){const a0=i*2.09-1.57,a1=a0+1.75;ctx.beginPath();ctx.arc(0,0,220,a0+0.17,a1-0.17);ctx.stroke();
  const ae=a1-0.17;ctx.save();ctx.translate(Math.cos(ae)*220,Math.sin(ae)*220);ctx.rotate(ae+Math.PI/2);ctx.fillStyle='rgba(255,255,255,0.5)';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-16,-30);ctx.lineTo(16,-30);ctx.fill();ctx.restore();}
 steps.forEach((s,i)=>{const a=i*2.09-1.57;const on=i===act;ctx.save();ctx.translate(Math.cos(a)*220,Math.sin(a)*220);
  if(on)glow(0,0,110,'rgba(59,130,246,0.8)');rr(-105,-48,210,96,22);ctx.fillStyle=on?ACC:'#101626';ctx.fill();ctx.strokeStyle=on?'#fff':'rgba(255,255,255,0.3)';ctx.lineWidth=4;ctx.stroke();
  txt(s[0],0,16,'800 40px Inter','#fff','center');ctx.restore();});ctx.restore();});
def('AI AGENTS','TOOL CALL',t=>{card(150,720,780,340,26);txt('tool call',200,790,'700 32px Inter','rgba(255,255,255,0.5)');
 typeT('search_github({',clamp(t*2.4,0,1),200,860,'700 42px ui-monospace,monospace',ACC2);
 typeT('  q: "free ai agent"',clamp(t*2.4-0.4,0,1),200,925,'700 42px ui-monospace,monospace','#98c379');
 typeT('})  →  12 results ✓',clamp(t*2.4-0.8,0,1),200,990,'700 42px ui-monospace,monospace','#fff');});
def('AI AGENTS','GUARDRAIL',t=>{const hit=sm((t-0.35)*5);
 ctx.save();ctx.translate(CX,880);const s=1+hit*0.08*Math.sin(t*50);ctx.scale(s,s);
 glow(0,0,230,'rgba(34,197,94,0.5)');ctx.fillStyle='rgba(34,197,94,0.15)';ctx.strokeStyle=GRN;ctx.lineWidth=10;
 ctx.beginPath();ctx.moveTo(0,-190);ctx.quadraticCurveTo(170,-150,170,-40);ctx.quadraticCurveTo(170,120,0,200);ctx.quadraticCurveTo(-170,120,-170,-40);ctx.quadraticCurveTo(-170,-150,0,-190);ctx.fill();ctx.stroke();
 txt('SAFE',0,20,'800 60px Inter','#d7ffe6','center');ctx.restore();
 const bp=clamp(t*2.2,0,0.62);ctx.strokeStyle=RED;ctx.lineWidth=12;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(150,560);const bx=150+bp*360,by=560+bp*260;ctx.lineTo(bx,by);ctx.stroke();
 if(hit>0&&hit<1){ctx.globalAlpha=1-hit;ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(370,715,20+hit*90,0,7);ctx.stroke();ctx.globalAlpha=1;}});
def('AI AGENTS','MEMORY DB',t=>{for(let i=2;i>=0;i--){const y=950-i*110;ctx.fillStyle='#101626';ctx.strokeStyle=VIO;ctx.lineWidth=5;
  ctx.beginPath();ctx.ellipse(CX,y-55,180,40,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillRect(CX-180,y-55,360,55);ctx.beginPath();ctx.moveTo(CX-180,y-55);ctx.lineTo(CX-180,y);ctx.moveTo(CX+180,y-55);ctx.lineTo(CX+180,y);ctx.stroke();
  ctx.beginPath();ctx.ellipse(CX,y,180,40,0,0,Math.PI);ctx.stroke();}
 const drop=(t*1.6)%1;ctx.globalAlpha=1-drop;chip('fact',CX,560+drop*220,'rgba(167,139,250,0.3)','#e9ddff',30);ctx.globalAlpha=1;
 txt('memory: '+(3+Math.floor(t*3))+' items',CX,1140,'700 36px Inter','rgba(255,255,255,0.6)','center');});
def('AI AGENTS','PARAM COUNT',t=>{const stages=['7B','13B','70B','405B'];const i=Math.min(3,Math.floor(t*3.2));const s2=1+((t*3.2)%1<0.15?0.15:0);
 ctx.save();ctx.translate(CX,860);ctx.scale(s2,s2);txt(stages[i],0,40,'150px "Archivo Black"',[ACC2,CYN,AMB,RED][i],'center');ctx.restore();
 txt('PARAMETERS',CX,990,'800 40px Inter','rgba(255,255,255,0.6)','center');});
def('AI AGENTS','MAGIC SPARK',t=>{ctx.save();ctx.translate(CX+120,960);ctx.rotate(-0.7);ctx.fillStyle='#39405a';rr(-14,-20,28,240,14);ctx.fill();ctx.fillStyle=AMB;rr(-14,-60,28,50,8);ctx.fill();ctx.restore();
 const b=sm(t*2);for(let i=0;i<14;i++){const a=R(i)*6.28,d=b*(60+R(i+7)*200);const x=CX+40+Math.cos(a)*d,y=840+Math.sin(a)*d;
  ctx.save();ctx.translate(x,y);ctx.rotate(t*3+i);ctx.fillStyle=[AMB,'#fff',CYN][i%3];const r=8+R(i+3)*10;
  ctx.beginPath();for(let k=0;k<8;k++){const rr2=k%2?r:r*0.4;ctx.lineTo(Math.cos(k*0.785)*rr2,Math.sin(k*0.785)*rr2);}ctx.closePath();ctx.fill();ctx.restore();}
 glow(CX+40,840,150,'rgba(255,220,130,0.5)');});
def('AI AGENTS','AGENT LOG',t=>{card(150,640,780,560,26);ctx.font='700 34px ui-monospace,monospace';
 const lines=[['[agent] reading task…','#cfe0ff'],['[plan] 3 steps','#98c379'],['[tool] browser.open()','#61afef'],['[tool] file.write()','#61afef'],['[agent] verifying…','#cfe0ff'],['[done] task complete ✓',GRN]];
 const n=Math.min(lines.length,Math.floor(t*6)+1);const off=Math.max(0,n-5);
 for(let i=off;i<n;i++){ctx.fillStyle=lines[i][1];ctx.fillText(lines[i][0],200,720+(i-off)*80);}
 if(Math.floor(t*3)%2)ctx.fillRect(200,730+(Math.min(n,5)-1)*80+10,24,8);});
def('AI AGENTS','LEADERBOARD',t=>{const sw=sm((t-0.45)*2.5);const rows=[['GPT-6',92,0],['Claude',95,1],['Gemini',89,2]];
 rows.forEach((r,i)=>{let y=700+i*160;if(i===0)y+=sw*160;if(i===1)y-=sw*160;
  const top=(i===1&&sw>0.5)||(i===0&&sw<=0.5);rr(190,y,700,130,24);ctx.fillStyle=top?'rgba(245,158,11,0.18)':'rgba(255,255,255,0.07)';ctx.fill();if(top){ctx.strokeStyle=AMB;ctx.lineWidth=4;ctx.stroke();}
  txt('#'+(y<780?1:y<940?2:3),250,y+82,'800 44px Inter',top?AMB:'rgba(255,255,255,0.5)');
  txt(r[0],350,y+82,'800 44px Inter','#fff');txt(r[1]+'%',840,y+82,'800 44px Inter',ACC2,'right');});});
// ---------- DATA ----------
def('DATA','LINE DRAW',t=>{const x=200,y=640,w=680,h=480;ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=2;
 for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x,y+i*h/4);ctx.lineTo(x+w,y+i*h/4);ctx.stroke();}
 const pts=[0.75,0.6,0.68,0.4,0.5,0.2,0.28,0.06];const n=sm(t*1.4)*(pts.length-1);
 ctx.strokeStyle=ACC;ctx.lineWidth=10;ctx.lineJoin='round';ctx.beginPath();
 for(let i=0;i<=Math.floor(n);i++){i?ctx.lineTo(x+w*i/7,y+h*pts[i]):ctx.moveTo(x,y+h*pts[0]);}
 const i0=Math.floor(n),f=n-i0;if(i0<7){ctx.lineTo(x+w*(i0+f)/7,y+h*(pts[i0]+(pts[i0+1]-pts[i0])*f));}ctx.stroke();
 const ex=x+w*Math.min(n,7)/7,ey=y+h*(i0<7?pts[i0]+(pts[i0+1]-pts[i0])*f:pts[7]);glow(ex,ey,60,'rgba(147,197,253,0.9)');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,ey,14,0,7);ctx.fill();});
def('DATA','BAR RACE',t=>{const bars=[['GPT',0.6,ACC],['Claude',0.95,GRN],['Gemini',0.75,AMB],['Llama',0.5,VIO]];
 bars.forEach((b,i)=>{const v=sm(t*1.3-i*0.1)*b[1];const y=660+i*140;
  txt(b[0],200,y+62,'800 36px Inter','#fff');rr(360,y,v*500,90,18);ctx.fillStyle=b[2];ctx.fill();
  txt(Math.round(v*100)+'',380+v*500,y+60,'800 36px Inter','#fff');});});
def('DATA','PIE POP',t=>{const segs=[[0.35,ACC],[0.25,GRN],[0.22,AMB],[0.18,RED]];let a0=-1.57;
 segs.forEach((s,i)=>{const p=EB(t*2.2-i*0.18);if(p<=0){a0+=s[0]*6.28;return;}const a1=a0+s[0]*6.28;
  const mid=(a0+a1)/2;const off=(i===1&&t>0.7)?sm((t-0.7)*3)*40:0;
  ctx.save();ctx.translate(CX+Math.cos(mid)*off,880+Math.sin(mid)*off);ctx.scale(Math.min(1,p),Math.min(1,p));
  ctx.fillStyle=s[1];ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,250,a0,a1);ctx.closePath();ctx.fill();ctx.restore();a0=a1;});});
def('DATA','AREA FILL',t=>{const x=200,y=640,w=680,h=480;const pts=[0.7,0.55,0.62,0.35,0.45,0.18,0.25,0.05];const p=sm(t*1.4);
 ctx.beginPath();ctx.moveTo(x,y+h);for(let i=0;i<8;i++)ctx.lineTo(x+w*i/7,y+h*(pts[i]*p+(1-p)));ctx.lineTo(x+w,y+h);ctx.closePath();
 const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'rgba(34,211,238,0.7)');g.addColorStop(1,'rgba(34,211,238,0.05)');ctx.fillStyle=g;ctx.fill();
 ctx.strokeStyle=CYN;ctx.lineWidth=8;ctx.beginPath();for(let i=0;i<8;i++){const yy=y+h*(pts[i]*p+(1-p));i?ctx.lineTo(x+w*i/7,yy):ctx.moveTo(x,yy);}ctx.stroke();});
def('DATA','GAUGE',t=>{const v=sm((t-0.1)*1.3)*0.78;
 ctx.lineWidth=40;ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.arc(CX,1000,280,Math.PI,0);ctx.stroke();
 const g=ctx.createLinearGradient(260,0,820,0);g.addColorStop(0,GRN);g.addColorStop(0.6,AMB);g.addColorStop(1,RED);
 ctx.strokeStyle=g;ctx.beginPath();ctx.arc(CX,1000,280,Math.PI,Math.PI+v*Math.PI);ctx.stroke();
 for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/8;ctx.strokeStyle='rgba(255,255,255,0.5)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(CX+Math.cos(a)*230,1000+Math.sin(a)*230);ctx.lineTo(CX+Math.cos(a)*210,1000+Math.sin(a)*210);ctx.stroke();}
 ctx.save();ctx.translate(CX,1000);ctx.rotate(Math.PI+v*Math.PI);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(200,0);ctx.lineTo(0,12);ctx.fill();ctx.restore();
 txt(Math.round(v*100)+' mph',CX,1100,'800 48px Inter','#fff','center');});
def('DATA','PERCENT RING',t=>{const v=sm(t*1.3)*0.87;
 ctx.lineWidth=44;ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.beginPath();ctx.arc(CX,880,240,0,7);ctx.stroke();
 ctx.strokeStyle=GRN;ctx.lineCap='round';ctx.beginPath();ctx.arc(CX,880,240,-1.57,-1.57+v*6.28);ctx.stroke();
 txt(Math.round(v*100)+'%',CX,920,'120px "Archivo Black"','#fff','center');});
def('DATA','THERMO BAR',t=>{const v=sm(t*1.4);card(460,600,160,560,80);
 ctx.save();rr(480,620,120,520,60);ctx.clip();const g=ctx.createLinearGradient(0,1140,0,620);g.addColorStop(0,GRN);g.addColorStop(0.6,AMB);g.addColorStop(1,RED);
 ctx.fillStyle=g;ctx.fillRect(480,1140-v*520,120,v*520);ctx.restore();
 ctx.fillStyle=RED;ctx.beginPath();ctx.arc(540,1210,70,0,7);ctx.fill();txt(Math.round(v*40)+'°',540,1232,'800 48px Inter','#fff','center');});
def('DATA','TABLE SWEEP',t=>{const rows=[['OpenCode','FREE'],['Cursor','$20'],['Copilot','$10'],['Goose','FREE']];
 const hi=Math.floor(t*4)%4;rows.forEach((r,i)=>{const y=660+i*140;rr(180,y,720,120,20);
  ctx.fillStyle=i===hi?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.06)';ctx.fill();
  txt(r[0],230,y+76,'800 40px Inter','#fff');txt(r[1],850,y+76,'800 40px Inter',r[1]==='FREE'?GRN:'rgba(255,255,255,0.6)','right');});});
def('DATA','TREND ARROWS',t=>{const a=EB(t*2.5),b=EB((t-0.3)*2.5);
 if(a>0){ctx.save();ctx.translate(360,900);ctx.scale(a,a);ctx.fillStyle=GRN;
  ctx.beginPath();ctx.moveTo(0,-140);ctx.lineTo(100,-20);ctx.lineTo(40,-20);ctx.lineTo(40,120);ctx.lineTo(-40,120);ctx.lineTo(-40,-20);ctx.lineTo(-100,-20);ctx.closePath();ctx.fill();
  txt('+214%',0,220,'800 44px Inter',GRN,'center');ctx.restore();}
 if(b>0){ctx.save();ctx.translate(720,900);ctx.scale(b,-b);ctx.fillStyle=RED;
  ctx.beginPath();ctx.moveTo(0,-140);ctx.lineTo(100,-20);ctx.lineTo(40,-20);ctx.lineTo(40,120);ctx.lineTo(-40,120);ctx.lineTo(-40,-20);ctx.lineTo(-100,-20);ctx.closePath();ctx.fill();ctx.restore();
  txt('-38%',720,1120,'800 44px Inter',RED,'center');}});
def('DATA','ODOMETER',t=>{card(240,780,600,220,30);const target=[3,9,4,0,0];
 target.forEach((d,i)=>{const p=sm(t*1.6-i*0.12);const cur=Math.floor(p*(d+10*2))%10;
  ctx.save();ctx.beginPath();ctx.rect(290+i*100,800,90,180);ctx.clip();
  const off=(p*(d+20))%1;[cur,(cur+1)%10].forEach((dd,k)=>{txt(''+(p>=1?d:dd),335+i*100,940-k*180+off*180,'100px "Archivo Black"',p>=1?ACC2:'#fff','center');});
  ctx.restore();});});
