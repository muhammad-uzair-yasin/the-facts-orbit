const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=process.argv[2]||'frames';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1080}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForFunction(()=>window.ready,{timeout:20000});
const fps=24,dur=+(process.argv[3]||5);
for(let i=0;i<fps*dur;i++){await p.evaluate(t=>setT(t),i/fps);
 const d=await p.evaluate(()=>document.getElementById('c').toDataURL('image/png'));
 fs.writeFileSync(`${out}/f${String(i).padStart(4,'0')}.png`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();})();
