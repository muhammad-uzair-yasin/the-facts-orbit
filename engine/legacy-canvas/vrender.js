const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const f0=+process.argv[2],f1=+process.argv[3];const out='vf';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8123/video2.html');await p.waitForFunction(()=>window.ready,{timeout:180000});
const t0=Date.now();const B=8;
for(let i=f0;i<f1;i+=B){const idx=[];for(let k=i;k<Math.min(f1,i+B);k++)idx.push(k);
 const arr=await p.evaluate(fr=>fr.map(i=>{setT(i/24);return document.getElementById('stage').toDataURL('image/jpeg',0.9);}),idx);
 arr.forEach((d,k)=>fs.writeFileSync(`${out}/f${String(idx[k]).padStart(4,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64')));}
console.log('frames',f1-f0,'secs',((Date.now()-t0)/1000).toFixed(1));
await b.close();})();
