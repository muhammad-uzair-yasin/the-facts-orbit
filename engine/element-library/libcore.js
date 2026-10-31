const W=1080,H=1920;let ctx=null;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const E=x=>1-Math.pow(1-clamp(x,0,1),3);
const EB=x=>{x=clamp(x,0,1);const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const sm=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const R=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const ACC='#3b82f6',ACC2='#93c5fd',GRN='#22c55e',RED='#ef4444',AMB='#f59e0b',VIO='#a78bfa',CYN='#22d3ee';
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function txt(s,x,y,f,c,al){ctx.font=f;ctx.fillStyle=c;if(al){ctx.textAlign=al;ctx.fillText(s,x,y);ctx.textAlign='left';}else ctx.fillText(s,x,y);}
function chip(s,x,y,bg,fg,size){size=size||40;ctx.font='800 '+size+'px Inter';const w=ctx.measureText(s).width;rr(x-w/2-30,y-size*0.85-12,w+60,size*1.7,18);ctx.fillStyle=bg;ctx.fill();txt(s,x,y,'800 '+size+'px Inter',fg,'center');}
function card(x,y,w,h,r){rr(x,y,w,h,r||26);ctx.fillStyle='rgba(255,255,255,0.06)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=2;ctx.stroke();}
function glow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.globalAlpha=a==null?0.5:a;ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();}
function cursorA(x,y,click){ctx.save();ctx.translate(x,y);ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,46);ctx.lineTo(12,35);ctx.lineTo(21,54);ctx.lineTo(29,50);ctx.lineTo(20,31);ctx.lineTo(35,28);ctx.closePath();ctx.fill();ctx.stroke();
 if(click>0&&click<1){ctx.globalAlpha=1-click;ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.arc(5,5,12+click*50,0,7);ctx.stroke();}ctx.restore();}
function pen(x,y,ang,col){ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=col||AMB;rr(-16,-150,32,130,14);ctx.fill();ctx.fillStyle='#e8eaf0';ctx.beginPath();ctx.moveTo(-16,-20);ctx.lineTo(16,-20);ctx.lineTo(0,14);ctx.closePath();ctx.fill();ctx.fillStyle='#1b2130';ctx.beginPath();ctx.moveTo(-5,2);ctx.lineTo(5,2);ctx.lineTo(0,14);ctx.closePath();ctx.fill();ctx.restore();}
function planet(x,y,r,c1,c2){const g=ctx.createRadialGradient(x-r*0.4,y-r*0.4,r*0.1,x,y,r);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
function craters(x,y,r,n,sd){for(let i=0;i<n;i++){const a=R(i+sd)*6.28,d=R(i+sd+9)*r*0.72,cr=r*(0.06+R(i+sd+33)*0.1);ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,cr,0,7);ctx.fill();}}
function starbg(t,n,sd){for(let i=0;i<n;i++){const a=0.25+0.75*Math.abs(Math.sin(t*2+R(i+sd)*7));ctx.globalAlpha=a*0.85;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(R(i+sd)*W,R(i+sd+5)*H*0.85+100,1+R(i+sd+11)*2.4,0,7);ctx.fill();}ctx.globalAlpha=1;}
function typeT(s,p,x,y,f,c){ctx.font=f;const n=Math.floor(clamp(p,0,1)*s.length);ctx.fillStyle=c;ctx.fillText(s.slice(0,n),x,y);return ctx.measureText(s.slice(0,n)).width;}
function bgBase(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a1226');g.addColorStop(1,'#05070e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
const ELS=[];const CATS=[];
function def(cat,label,fn){ELS.push({cat:cat,label:label,fn:fn});if(CATS.indexOf(cat)<0)CATS.push(cat);}
const CX=540,CY=880;
