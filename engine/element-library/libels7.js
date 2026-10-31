// ---------- TECH CODE ----------
def('TECH CODE','GIT GRAPH',t=>{const n=Math.floor(sm(t*1.4)*6)+1;
 ctx.strokeStyle='#4a5370';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(400,1150);ctx.lineTo(400,1150-Math.min(n,4)*120);ctx.stroke();
 if(n>3){ctx.beginPath();ctx.moveTo(400,790);ctx.quadraticCurveTo(400,700,540,700);ctx.stroke();ctx.beginPath();ctx.moveTo(400,790);ctx.lineTo(400,670);ctx.stroke();}
 for(let i=0;i<Math.min(n,4);i++){ctx.fillStyle=ACC;ctx.beginPath();ctx.arc(400,1150-i*120,24,0,7);ctx.fill();}
 if(n>4){ctx.fillStyle=GRN;ctx.beginPath();ctx.arc(540,700,24,0,7);ctx.fill();chip('merge',660,700,GRN,'#04230f',28);}
 if(n>5){ctx.fillStyle=ACC;ctx.beginPath();ctx.arc(400,670,24,0,7);ctx.fill();}
 txt('main',310,1160,'700 30px ui-monospace,monospace','rgba(255,255,255,0.6)','center');});
def('TECH CODE','MATRIX RAIN',t=>{ctx.font='700 34px ui-monospace,monospace';
 for(let c=0;c<14;c++){const x=120+c*60;const sp=0.4+R(c)*0.8;const head=((t*sp*800)%1400)+330;
  for(let k=0;k<14;k++){const y=head-k*44;if(y<330||y>1510)continue;const ch=String.fromCharCode(48+Math.floor(R(c*31+k+Math.floor(t*6))*42));
   ctx.fillStyle=k===0?'#d7ffe6':'rgba(34,197,94,'+Math.max(0,0.8-k*0.07)+')';ctx.fillText(ch,x,y);}}});
def('TECH CODE','BINARY STREAM',t=>{for(let r2=0;r2<9;r2++){const y=680+r2*70;const off=(t*(60+R(r2)*120))%80;
 ctx.font='700 44px ui-monospace,monospace';for(let i=0;i<13;i++){const v=R(r2*37+i+Math.floor(t*3))>0.5?'1':'0';
  ctx.fillStyle=i===6?ACC2:'rgba(255,255,255,'+(0.15+R(r2+i)*0.3)+')';ctx.fillText(v,140+i*62-off,y);}}
 glow(540,900,300,'rgba(59,130,246,0.2)');});
def('TECH CODE','API CALL',t=>{card(170,640,740,520,26);
 typeT('POST /v1/agents/run',clamp(t*2.4,0,1),220,720,'700 40px ui-monospace,monospace',AMB);
 typeT('{ "task": "edit video" }',clamp(t*2.4-0.5,0,1),220,790,'700 40px ui-monospace,monospace','#98c379');
 if(t>0.8){const p=sm((t-0.8)*4);ctx.strokeStyle=ACC2;ctx.lineWidth=5;ctx.setLineDash([16,12]);ctx.lineDashOffset=-t*60;ctx.beginPath();ctx.moveTo(220,860);ctx.lineTo(220+p*600,860);ctx.stroke();ctx.setLineDash([]);}
 if(t>1.1){chip('200 OK',320,960,GRN,'#04230f',34);txt('{ "status": "done" }',440,975,'700 40px ui-monospace,monospace','#fff');}});
def('TECH CODE','SERVER RACK',t=>{for(let r2=0;r2<3;r2++){const x=250+r2*200;ctx.fillStyle='#161b28';rr(x,660,160,500,14);ctx.fill();ctx.strokeStyle='#39405a';ctx.lineWidth=4;rr(x,660,160,500,14);ctx.stroke();
 for(let k=0;k<6;k++){ctx.fillStyle='#0a0f1c';rr(x+14,680+k*78,132,60,8);ctx.fill();
  for(let L=0;L<3;L++){const on=R(r2*17+k*3+L+Math.floor(t*5))>0.4;ctx.fillStyle=on?(L===2?GRN:ACC2):'#232a3e';ctx.beginPath();ctx.arc(x+40+L*34,710+k*78,8,0,7);ctx.fill();}}}
 txt('the cloud = someone elses computer',540,1260,'700 32px Inter','rgba(255,255,255,0.6)','center');});
def('TECH CODE','CLOUD SYNC',t=>{ctx.fillStyle='#39405a';ctx.beginPath();ctx.arc(440,760,90,0,7);ctx.arc(600,730,110,0,7);ctx.arc(700,790,70,0,7);ctx.fill();rr(370,790,400,70,35);ctx.fill();
 const p=(t*1.2)%1;[0,1,2].forEach(i=>{const q=(p+i*0.33)%1;ctx.globalAlpha=1-Math.abs(q-0.5)*2;
  ctx.strokeStyle=CYN;ctx.lineWidth=8;ctx.lineCap='round';const y=1120-q*240;ctx.beginPath();ctx.moveTo(480+i*60,y);ctx.lineTo(480+i*60,y-50);ctx.stroke();
  ctx.beginPath();ctx.moveTo(480+i*60,y-50);ctx.lineTo(462+i*60,y-24);ctx.moveTo(480+i*60,y-50);ctx.lineTo(498+i*60,y-24);ctx.stroke();});ctx.globalAlpha=1;
 card(380,1140,320,120,20);txt('syncing… '+Math.round(sm(t*0.8)*100)+'%',540,1215,'700 34px Inter','#fff','center');});
def('TECH CODE','BUG FIX',t=>{const dead=t>0.62;
 ctx.save();ctx.translate(540,860);if(!dead){ctx.translate(Math.sin(t*20)*14,0);}else{ctx.rotate(3.14);}
 ctx.fillStyle=dead?'#4a5370':RED;ctx.beginPath();ctx.ellipse(0,0,90,120,0,0,7);ctx.fill();
 ctx.strokeStyle=dead?'#4a5370':RED;ctx.lineWidth=10;ctx.lineCap='round';
 [[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]].forEach(l=>{ctx.beginPath();ctx.moveTo(l[0]*80,l[1]*60);ctx.lineTo(l[0]*150,l[1]*60+l[1]*20);ctx.stroke();});
 ctx.fillStyle='#0a0f1c';ctx.beginPath();ctx.arc(-30,-40,12,0,7);ctx.arc(30,-40,12,0,7);ctx.fill();ctx.restore();
 if(dead){const p=EB((t-0.62)*4);ctx.save();ctx.translate(540,1120);ctx.scale(p,p);chip('FIXED ✓',0,14,GRN,'#04230f',44);ctx.restore();}
 else txt('bug found',540,1140,'800 40px Inter',RED,'center');});
def('TECH CODE','PASSWORD DOTS',t=>{card(270,760,540,160,36);
 const n=Math.floor(clamp(t*1.6,0,1)*10);for(let i=0;i<n;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(330+i*48,840,13,0,7);ctx.fill();}
 const ok=t>0.9;if(ok){chip('strong',540,1010,GRN,'#04230f',34);}
 const bars=Math.min(3,Math.floor(n/3.4));for(let i=0;i<3;i++){ctx.fillStyle=i<bars?[RED,AMB,GRN][bars-1]:'rgba(255,255,255,0.15)';rr(330+i*150,940,130,16,8);ctx.fill();}});
def('TECH CODE','TERMINAL 404',t=>{ctx.fillStyle='#0a0f1c';rr(180,640,720,500,20);ctx.fill();
 const g=Math.sin(t*26)>0.75?10:0;
 txt('404',540+g,870,'190px "Archivo Black"',g?CYN:'#fff','center');if(g)txt('404',540-g,874,'190px "Archivo Black"','rgba(255,0,80,0.8)','center');
 txt('page not found',540,980,'700 40px ui-monospace,monospace','rgba(255,255,255,0.6)','center');
 if(Math.floor(t*3)%2)ctx.fillRect(760,950,26,10);});
def('TECH CODE','QR SCAN',t=>{ctx.fillStyle='#fff';rr(340,680,400,400,20);ctx.fill();
 for(let i=0;i<13;i++)for(let k=0;k<13;k++){if(R(i*13+k)>0.5){ctx.fillStyle='#0a0f1c';ctx.fillRect(364+i*28,704+k*28,26,26);}}
 [[364,704],[364+280,704],[364,704+280]].forEach(c=>{ctx.fillStyle='#0a0f1c';ctx.fillRect(c[0],c[1],92,92);ctx.fillStyle='#fff';ctx.fillRect(c[0]+20,c[1]+20,52,52);ctx.fillStyle='#0a0f1c';ctx.fillRect(c[0]+34,c[1]+34,24,24);});
 const sy=700+((t*1.1)%1)*360;ctx.fillStyle='rgba(34,211,238,0.8)';ctx.fillRect(340,sy,400,8);
 txt('scan to follow',540,1200,'700 36px Inter','rgba(255,255,255,0.7)','center');});
// ---------- NATURE ----------
def('NATURE','RAIN',t=>{ctx.fillStyle='#39405a';ctx.beginPath();ctx.arc(420,640,80,0,7);ctx.arc(570,610,100,0,7);ctx.arc(680,660,66,0,7);ctx.fill();rr(350,660,400,60,30);ctx.fill();
 for(let i=0;i<40;i++){const p=(t*(1+R(i))*1.4+R(i+3))%1;const x=200+R(i)*680;const y=740+p*600;
  ctx.strokeStyle='rgba(147,197,253,'+(0.7-p*0.4)+')';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y+34);ctx.stroke();}
 for(let i=0;i<6;i++){const p=(t*1.6+R(i*7))%1;if(p>0.3)continue;ctx.strokeStyle='rgba(147,197,253,0.5)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(240+R(i)*600,1330,p*120,p*36,0,0,7);ctx.stroke();}});
def('NATURE','LIGHTNING',t=>{const fl=(t*1.5)%1<0.14;if(fl){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(70,330,940,1180);}
 ctx.fillStyle='#232a3e';ctx.beginPath();ctx.arc(420,660,90,0,7);ctx.arc(590,630,110,0,7);ctx.arc(710,680,70,0,7);ctx.fill();rr(340,680,440,70,35);ctx.fill();
 if(fl){ctx.strokeStyle='#ffe9a8';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(540,760);
  let x=540,y=760;[[-40,120],[30,110],[-50,130],[20,100]].forEach(s=>{x+=s[0];y+=s[1];ctx.lineTo(x,y);});ctx.stroke();
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-44,y-20);ctx.lineTo(x+6,y+60);ctx.stroke();glow(540,980,300,'rgba(255,233,168,0.5)');}});
def('NATURE','SNOW',t=>{for(let i=0;i<36;i++){const p=(t*0.35*(0.6+R(i))+R(i+5))%1;const x=140+R(i)*800+Math.sin(t*2+i)*40;const y=400+p*1000;
 ctx.fillStyle='rgba(255,255,255,'+(0.9-p*0.4)+')';ctx.beginPath();ctx.arc(x,y,5+R(i+2)*9,0,7);ctx.fill();}
 ctx.fillStyle='#e8ecf4';ctx.beginPath();ctx.ellipse(540,1420,520,120,0,3.14,0);ctx.fill();});
def('NATURE','SUN & CLOUD',t=>{const p=sm(t*1.2);glow(440,800,260,'rgba(255,200,80,0.6)');
 ctx.save();ctx.translate(440,800);ctx.rotate(t*0.5);for(let i=0;i<10;i++){ctx.rotate(0.628);ctx.fillStyle=AMB;rr(140,-12,70,24,12);ctx.fill();}ctx.restore();
 planet(440,800,120,'#fff2b8','#ffb52e');
 ctx.save();ctx.translate((1-p)*500,0);ctx.fillStyle='#dbe3f2';ctx.beginPath();ctx.arc(600,960,80,0,7);ctx.arc(720,930,100,0,7);ctx.arc(830,970,66,0,7);ctx.fill();rr(540,970,370,70,35);ctx.fill();ctx.restore();});
def('NATURE','RAINBOW',t=>{const p=sm(t*1.3);const cols=['#ef4444','#f59e0b','#fde047','#22c55e','#3b82f6','#a78bfa'];
 cols.forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=30;ctx.beginPath();ctx.arc(540,1240,430-i*32,Math.PI,Math.PI+p*Math.PI);ctx.stroke();});
 [[290,1240],[790,1240]].forEach(cl=>{ctx.fillStyle='#dbe3f2';ctx.beginPath();ctx.arc(cl[0]-60,cl[1],56,0,7);ctx.arc(cl[0]+10,cl[1]-30,70,0,7);ctx.arc(cl[0]+80,cl[1],50,0,7);ctx.fill();rr(cl[0]-110,cl[1],220,50,25);ctx.fill();});});
def('NATURE','WIND LEAVES',t=>{for(let i=0;i<4;i++){const y=700+i*130;ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=7;ctx.lineCap='round';
 const off=(t*300+i*120)%1200;ctx.beginPath();for(let k=0;k<30;k++){const x=-100+off+k*14;const yy=y+Math.sin(k*0.4+t*3)*26;k?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();}
 for(let i=0;i<7;i++){const p=(t*0.5+R(i))%1;const x=150+p*800;const y=760+Math.sin(p*9+i)*160+i*40;
 ctx.save();ctx.translate(x,y);ctx.rotate(t*4+i);ctx.fillStyle=i%2?GRN:AMB;ctx.beginPath();ctx.ellipse(0,0,26,13,0,0,7);ctx.fill();ctx.restore();}});
def('NATURE','OCEAN WAVES',t=>{for(let L=0;L<3;L++){const y0=900+L*120;ctx.fillStyle=['#1e5aa6','#174a8c','#103a72'][L];
 ctx.beginPath();ctx.moveTo(70,1510);ctx.lineTo(70,y0);
 for(let x=70;x<=1010;x+=20){ctx.lineTo(x,y0+Math.sin(x*0.012+t*(2+L))*40);}ctx.lineTo(1010,1510);ctx.closePath();ctx.fill();}
 for(let i=0;i<5;i++){const x=200+R(i)*680;const y=900+Math.sin(x*0.012+t*2)*40;ctx.fillStyle='rgba(255,255,255,0.7)';ctx.beginPath();ctx.arc(x+Math.sin(t*3+i)*20,y-6,6,0,7);ctx.fill();}
 glow(540,700,240,'rgba(255,220,130,0.3)');planet(540,660,90,'#fff2b8','#ffb52e');});
def('NATURE','MOUNTAINS',t=>{const p=sm(t*1.2);
 [['#232a3e',1300,0.9],['#2f3a56',1240,1],['#44527a',1180,1.1]].forEach((m,i)=>{ctx.fillStyle=m[0];ctx.beginPath();ctx.moveTo(70,1510);
  for(let x=70;x<=1010;x+=30){const q=(x-70)/940;const h=m[1]-Math.abs(Math.sin(q*9+i*3))*((340-i*70)*p);ctx.lineTo(x,h);}ctx.lineTo(1010,1510);ctx.closePath();ctx.fill();});
 planet(760,620,80,'#fff','#cfd6e4');glow(760,620,160,'rgba(255,255,255,0.4)');
 for(let i=0;i<3;i++){ctx.fillStyle='rgba(255,255,255,0.9)';ctx.beginPath();ctx.moveTo(330+i*200,1510);ctx.lineTo(380+i*200,1300);ctx.lineTo(430+i*200,1510);ctx.fill();}});
def('NATURE','TREE GROW',t=>{const p=sm(t*1.3);ctx.strokeStyle='#8a5a2b';ctx.lineWidth=26;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(540,1240);ctx.lineTo(540,1240-p*360);ctx.stroke();
 if(p>0.4){ctx.lineWidth=14;[[-1,0.5],[1,0.65],[-1,0.85]].forEach(b=>{const bp=clamp((p-b[1])*4,0,1);if(bp<=0)return;
  ctx.beginPath();ctx.moveTo(540,1240-b[1]*360);ctx.lineTo(540+b[0]*bp*130,1240-b[1]*360-bp*110);ctx.stroke();});}
 const fp=EB((t-0.7)*3);if(fp>0){ctx.save();ctx.translate(540,830);ctx.scale(fp,fp);ctx.fillStyle=GRN;
  ctx.beginPath();ctx.arc(-90,40,80,0,7);ctx.arc(90,40,80,0,7);ctx.arc(0,-40,110,0,7);ctx.fill();ctx.restore();}
 ctx.fillStyle='#2a3044';ctx.beginPath();ctx.ellipse(540,1260,220,50,0,0,7);ctx.fill();});
def('NATURE','FIRE FLAME',t=>{for(let i=0;i<3;i++){const s2=1-i*0.26;const fl=Math.sin(t*9+i*2)*0.12;
 ctx.save();ctx.translate(540,1060);ctx.scale(s2*(1+fl*0.4),s2);ctx.fillStyle=['#e25822','#f59e0b','#fde047'][i];
 ctx.beginPath();ctx.moveTo(0,-380);ctx.quadraticCurveTo(170+fl*120,-160,120,40);ctx.quadraticCurveTo(70,130,0,130);ctx.quadraticCurveTo(-70,130,-120,40);ctx.quadraticCurveTo(-170-fl*120,-160,0,-380);ctx.fill();ctx.restore();}
 for(let i=0;i<6;i++){const p=(t*1.4+R(i))%1;ctx.globalAlpha=1-p;ctx.fillStyle=AMB;ctx.beginPath();ctx.arc(480+R(i)*120,1050-p*420,7,0,7);ctx.fill();}ctx.globalAlpha=1;
 ctx.fillStyle='#5a3a24';[[470,1180,-0.3],[610,1180,0.3]].forEach(l=>{ctx.save();ctx.translate(l[0],l[1]);ctx.rotate(l[2]);rr(-130,-26,260,52,22);ctx.fill();ctx.restore();});});
