// ---------- EDUCATION ----------
def('EDUCATION','CHALK WRITE',t=>{ctx.fillStyle='#1d3326';rr(170,600,740,560,20);ctx.fill();ctx.strokeStyle='#8a5a2b';ctx.lineWidth=16;rr(170,600,740,560,20);ctx.stroke();
 const p=sm(t*1.4);ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();
 for(let i=0;i<=50*p;i++){const q=i/50;const xx=300+q*480;const yy=880+Math.sin(q*9)*40*Math.sin(q*3.14);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();
 txt('A  I  101',CX,740,'700 54px Georgia','rgba(255,255,255,0.85)','center');
 ctx.fillStyle='#fff';rr(300+p*480-10,860+Math.sin(p*9)*40*Math.sin(p*3.14),20,60,8);ctx.fill();});
def('EDUCATION','BOOK FLIP',t=>{ctx.fillStyle='#39405a';rr(240,700,600,380,16);ctx.fill();
 ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.moveTo(540,700);ctx.quadraticCurveTo(300,680,260,720);ctx.lineTo(260,1040);ctx.quadraticCurveTo(300,1000,540,1060);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(540,700);ctx.quadraticCurveTo(780,680,820,720);ctx.lineTo(820,1040);ctx.quadraticCurveTo(780,1000,540,1060);ctx.closePath();ctx.fill();
 const p=(t*1.1)%1;const fl=Math.cos(p*Math.PI);ctx.fillStyle='#e6e0d2';ctx.beginPath();ctx.moveTo(540,700);ctx.quadraticCurveTo(540+240*fl,680,540+280*fl,720);ctx.lineTo(540+280*fl,1040);ctx.quadraticCurveTo(540+240*fl,1000,540,1060);ctx.closePath();ctx.fill();
 for(let i=0;i<4;i++){ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(320,780+i*60,170,10);ctx.fillRect(600,780+i*60,170,10);}});
def('EDUCATION','IDEA BULB',t=>{const on=t>0.4;if(on)glow(CX,820,320,'rgba(255,220,120,0.8)');
 ctx.fillStyle=on?'#ffe9a8':'#39405a';ctx.beginPath();ctx.arc(CX,820,150,0,7);ctx.fill();
 ctx.fillStyle=on?'#ffd978':'#2a3044';ctx.beginPath();ctx.moveTo(CX-60,940);ctx.lineTo(CX+60,940);ctx.lineTo(CX+40,1030);ctx.lineTo(CX-40,1030);ctx.closePath();ctx.fill();
 rr(CX-40,1040,80,26,10);ctx.fillStyle='#8fa2c4';ctx.fill();
 if(on)for(let i=0;i<8;i++){const a=i*0.785,pp=EB((t-0.4)*3);ctx.strokeStyle=AMB;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(CX+Math.cos(a)*190,820+Math.sin(a)*190);ctx.lineTo(CX+Math.cos(a)*(190+60*pp),820+Math.sin(a)*(190+60*pp));ctx.stroke();}});
def('EDUCATION','BRAIN GEARS',t=>{function gear(x,y,r,a,col){ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=col;
  for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-14,-r-18,28,24);}ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.fill();
  ctx.fillStyle='#0a0f1c';ctx.beginPath();ctx.arc(0,0,r*0.4,0,7);ctx.fill();ctx.restore();}
 ctx.strokeStyle=VIO;ctx.lineWidth=10;ctx.beginPath();ctx.arc(CX-50,840,180,Math.PI*0.55,Math.PI*1.95);ctx.stroke();ctx.beginPath();ctx.arc(CX+90,860,140,Math.PI*1.15,Math.PI*0.7);ctx.stroke();
 gear(CX-60,840,80,t*2,ACC2);gear(CX+100,900,60,-t*2.6,AMB);});
def('EDUCATION','MAGNIFIER',t=>{for(let i=0;i<5;i++){ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(220,700+i*90,640,18);}
 const p=sm(t*1.2);const mx=300+p*440,my=790+Math.sin(p*6.28)*60;
 ctx.save();ctx.beginPath();ctx.arc(mx,my,110,0,7);ctx.clip();ctx.fillStyle='#0d1322';ctx.fillRect(mx-110,my-110,220,220);
 ctx.fillStyle='#fff';ctx.font='800 44px Inter';ctx.fillText('evidence',mx-90,my+14);ctx.restore();
 ctx.strokeStyle='#cfd6e4';ctx.lineWidth=14;ctx.beginPath();ctx.arc(mx,my,110,0,7);ctx.stroke();
 ctx.save();ctx.translate(mx+78,my+78);ctx.rotate(0.785);ctx.fillStyle='#8fa2c4';rr(-16,0,32,150,16);ctx.fill();ctx.restore();});
def('EDUCATION','GRAD CAP',t=>{const p=sm(t*1.2);const y=1000-Math.sin(p*Math.PI)*320;const rot=(p-0.5)*1.2;
 ctx.save();ctx.translate(CX,y);ctx.rotate(rot);ctx.fillStyle='#161b28';ctx.beginPath();ctx.moveTo(0,-60);ctx.lineTo(220,0);ctx.lineTo(0,60);ctx.lineTo(-220,0);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#39405a';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#232a3e';rr(-90,20,180,70,10);ctx.fill();
 ctx.strokeStyle=AMB;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(160,80);ctx.stroke();ctx.fillStyle=AMB;ctx.beginPath();ctx.arc(160,95,20,0,7);ctx.fill();ctx.restore();});
def('EDUCATION','PUZZLE SNAP',t=>{const p=sm(t*1.8);const gap=(1-p)*260;
 function piece(x,y,col,side){ctx.save();ctx.translate(x,y);ctx.fillStyle=col;ctx.beginPath();rr(-130,-130,260,260,20);ctx.fill();
  ctx.beginPath();ctx.arc(side*130,0,46,0,7);if(side>0)ctx.fill();else{ctx.globalCompositeOperation='destination-out';ctx.fill();ctx.globalCompositeOperation='source-over';}ctx.restore();}
 piece(CX-135-gap,880,ACC,1);piece(CX+135+gap,880,GRN,-1);
 if(p>=1&&(t*4%1)<0.4){ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.globalAlpha=0.8;rr(CX-280,740,560,280,24);ctx.stroke();ctx.globalAlpha=1;}});
def('EDUCATION','WARNING',t=>{const s=1+0.06*Math.sin(t*8);ctx.save();ctx.translate(CX,880);ctx.scale(s,s);
 glow(0,0,320,'rgba(239,68,68,0.5)');ctx.fillStyle=RED;ctx.beginPath();ctx.moveTo(0,-220);ctx.lineTo(240,160);ctx.quadraticCurveTo(260,200,220,200);ctx.lineTo(-220,200);ctx.quadraticCurveTo(-260,200,-240,160);ctx.closePath();ctx.fill();
 ctx.fillStyle='#fff';rr(-26,-120,52,180,22);ctx.fill();ctx.beginPath();ctx.arc(0,120,30,0,7);ctx.fill();ctx.restore();});
def('EDUCATION','LOCK SECURE',t=>{const p=sm((t-0.2)*2.5);
 ctx.strokeStyle='#8fa2c4';ctx.lineWidth=34;ctx.beginPath();ctx.arc(CX,760-(1-p)*80,120,Math.PI,0);ctx.stroke();
 ctx.strokeStyle='#8fa2c4';ctx.beginPath();ctx.moveTo(CX-120,760-(1-p)*80);ctx.lineTo(CX-120,820);ctx.moveTo(CX+120,760-(1-p)*80);ctx.lineTo(CX+120,820);ctx.stroke();
 ctx.fillStyle=p>=1?GRN:'#39405a';rr(CX-220,820,440,330,40);ctx.fill();
 ctx.fillStyle='#0a0f1c';ctx.beginPath();ctx.arc(CX,950,44,0,7);ctx.fill();rr(CX-16,950,32,90,14);ctx.fill();
 if(p>=1)txt('SECURED',CX,1260,'800 44px Inter',GRN,'center');});
def('EDUCATION','KEY UNLOCK',t=>{const rot=sm((t-0.3)*2)*1.57;
 ctx.fillStyle='#39405a';rr(CX-220,700,440,360,40);ctx.fill();ctx.fillStyle='#0a0f1c';ctx.beginPath();ctx.arc(CX,850,60,0,7);ctx.fill();
 ctx.save();ctx.translate(CX,850);ctx.rotate(rot);ctx.fillStyle=AMB;ctx.beginPath();ctx.arc(0,0,34,0,7);ctx.fill();rr(14,-12,170,24,10);ctx.fill();rr(140,-12,20,50,6);ctx.fill();rr(100,-12,20,40,6);ctx.fill();ctx.restore();
 if(rot>=1.5){txt('ACCESS GRANTED',CX,1180,'800 44px Inter',GRN,'center');glow(CX,880,260,'rgba(34,197,94,0.4)');}});
// ---------- OBJECTS ----------
def('OBJECTS','PHONE FEED',t=>{card(330,560,420,760,56);ctx.fillStyle='#0a0f1c';rr(350,580,380,720,44);ctx.fill();
 ctx.save();ctx.beginPath();rr(350,580,380,720,44);ctx.clip();const off=(t*260)%260;
 for(let i=-1;i<4;i++){const y=620+i*260-off;ctx.fillStyle='rgba(255,255,255,0.08)';rr(380,y,320,220,22);ctx.fill();
  ctx.fillStyle=[ACC,GRN,AMB,VIO,CYN][(i+9)%5];ctx.beginPath();ctx.arc(425,y+50,24,0,7);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(380,y+110,320,60);}ctx.restore();
 ctx.fillStyle='#000';rr(480,596,120,28,14);ctx.fill();});
def('OBJECTS','CLOCK SPIN',t=>{planet(CX,880,230,'#e8ecf4','#9aa6bd');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(CX,880,210,0,7);ctx.fill();
 for(let i=0;i<12;i++){const a=i*0.524;ctx.strokeStyle='#39405a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(CX+Math.cos(a)*180,880+Math.sin(a)*180);ctx.lineTo(CX+Math.cos(a)*160,880+Math.sin(a)*160);ctx.stroke();}
 ctx.save();ctx.translate(CX,880);ctx.rotate(t*8);ctx.strokeStyle='#161b28';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(0,-120);ctx.stroke();ctx.restore();
 ctx.save();ctx.translate(CX,880);ctx.rotate(t*0.7);ctx.strokeStyle='#161b28';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(0,-80);ctx.stroke();ctx.restore();
 ctx.fillStyle=RED;ctx.beginPath();ctx.arc(CX,880,16,0,7);ctx.fill();});
def('OBJECTS','CALENDAR FLIP',t=>{ctx.fillStyle='#e8ecf4';rr(290,660,500,480,30);ctx.fill();ctx.fillStyle=RED;rr(290,660,500,120,30);ctx.fillRect(290,720,500,60);ctx.fill();
 txt('NOVEMBER',CX,745,'800 48px Inter','#fff','center');
 [1,2].forEach(k=>{ctx.fillStyle='#8fa2c4';ctx.beginPath();ctx.arc(CX-140+280*(k-1),660,18,0,7);ctx.fill();ctx.fillStyle='#39405a';rr(CX-148+280*(k-1),600,16,70,8);ctx.fill();});
 const fl=clamp((t-0.4)*2.5,0,1);
 if(fl<0.5){ctx.save();ctx.translate(CX,960);ctx.scale(1,1-fl*2);txt('1',0,55,'160px "Archivo Black"','#161b28','center');ctx.restore();}
 else{ctx.save();ctx.translate(CX,960);ctx.scale(1,(fl-0.5)*2);txt('2',0,55,'160px "Archivo Black"',RED,'center');ctx.restore();}});
def('OBJECTS','COFFEE STEAM',t=>{ctx.fillStyle='#e8ecf4';rr(380,860,320,280,30);ctx.fill();ctx.strokeStyle='#e8ecf4';ctx.lineWidth=26;ctx.beginPath();ctx.arc(740,970,70,-1.3,1.3);ctx.stroke();
 ctx.fillStyle='#5a3a24';ctx.beginPath();ctx.ellipse(540,880,150,36,0,0,7);ctx.fill();
 for(let i=0;i<3;i++){ctx.strokeStyle='rgba(255,255,255,'+(0.5-0.14*i)+')';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();
  for(let k=0;k<=24;k++){const q=k/24;const y=830-q*260;const x=440+i*90+Math.sin(q*5+t*4+i*2)*26*(0.4+q);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}});
def('OBJECTS','COIN STACK',t=>{const n=Math.min(6,Math.floor(t*7)+1);
 for(let i=0;i<n;i++){const drop=i===n-1?EB((t*7-i)%1):1;const y=1080-i*62-(1-drop)*300;
  ctx.fillStyle='#d9a514';ctx.beginPath();ctx.ellipse(CX,y,140,40,0,0,7);ctx.fill();ctx.fillStyle=AMB;ctx.beginPath();ctx.ellipse(CX,y-14,140,40,0,0,7);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(CX,y-14,100,26,0,0,7);ctx.stroke();}
 txt('$'+(n*100),CX,660,'800 72px Inter',AMB,'center');});
def('OBJECTS','WIRE GLOBE',t=>{ctx.strokeStyle=CYN;ctx.lineWidth=4;ctx.beginPath();ctx.arc(CX,880,230,0,7);ctx.stroke();
 for(let i=1;i<4;i++){ctx.beginPath();ctx.ellipse(CX,880,230,230*Math.cos(i*0.39),0,0,7);ctx.stroke();}
 for(let i=0;i<6;i++){const ph=t*1.2+i*0.524;const rx=230*Math.abs(Math.sin(ph));ctx.globalAlpha=Math.sin(ph)>0?1:0.25;
  ctx.beginPath();ctx.ellipse(CX,880,rx,230,0,0,7);ctx.stroke();}ctx.globalAlpha=1;
 glow(CX,880,260,'rgba(34,211,238,0.25)');});
def('OBJECTS','BATTERY CHARGE',t=>{const v=sm(t*1.3);card(240,800,560,220,40);ctx.fillStyle='#39405a';rr(800,860,50,100,16);ctx.fill();
 ctx.save();rr(270,830,500,160,26);ctx.clip();ctx.fillStyle=v<0.3?RED:v<0.7?AMB:GRN;ctx.fillRect(270,830,v*500,160);ctx.restore();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(560,840);ctx.lineTo(480,930);ctx.lineTo(530,930);ctx.lineTo(510,990);ctx.lineTo(590,900);ctx.lineTo(540,900);ctx.closePath();ctx.fill();
 txt(Math.round(v*100)+'%',CX,1120,'800 52px Inter','#fff','center');});
def('OBJECTS','ENVELOPE',t=>{const p=sm((t-0.2)*1.8);
 ctx.fillStyle='#39405a';rr(270,800,540,340,20);ctx.fill();
 const ly=800-p*220;ctx.fillStyle='#e8ecf4';rr(330,ly,420,260,16);ctx.fill();txt('@',CX,ly+150,'100px "Archivo Black"',ACC,'center');
 ctx.fillStyle='#2a3044';ctx.beginPath();ctx.moveTo(270,800);ctx.lineTo(540,980);ctx.lineTo(810,800);ctx.lineTo(810,1140);ctx.lineTo(270,1140);ctx.closePath();ctx.fill();
 ctx.save();ctx.translate(540,800);ctx.scale(1,1-p*1.6);ctx.fillStyle='#4a5370';ctx.beginPath();ctx.moveTo(-270,0);ctx.lineTo(0,170);ctx.lineTo(270,0);ctx.closePath();ctx.fill();ctx.restore();});
