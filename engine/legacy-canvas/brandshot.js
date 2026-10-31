const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();
for(const m of ['avatar','banner']){const p=await b.newPage({viewport:{width:2600,height:1500}});
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8123/brand2.html?m='+m);await p.waitForFunction(()=>window.ready,{timeout:60000});
 const buf=await p.locator('#c').screenshot({type:'png'});fs.writeFileSync('ainews_'+m+'.png',buf);await p.close();}
await b.close();})();
