(function(){"use strict";
// TODO: replace with a dedicated rpcman appId/key for the burn tracker, restricted to www.orbs.com
var BURN_TRACKER_RPC_URL="https://rpcman.orbs.network/rpc?key=f74174cb04a077391271c4e660001a54346a17cf7f872bb340e8f327f23320b8&chainId=1&appId=multisig";
var RPC=BURN_TRACKER_RPC_URL,MS="0x189a5caf060b94961f0d4f3e56ad0d678ebb6c12",TK="0xff56cc6b1e6ded347aa0b7676c85ab0b3d08b0fa",DEAD="0x000000000000000000000000000000000000dEaD";
var DEPLOY=26435746,CHUNK=7200,TOTAL=507540603n,DAY=864e5,WEEK=7*DAY,MAXGAP=2*3600e3,CONC=4,RETRIES=3,RPCMS=15000,CGMS=20000,LAG=3*3600e3;
var HASH=/^0x[0-9a-fA-F]{64}$/,HEX=/^0x[0-9a-fA-F]{1,64}$/,WORD=/^0x[0-9a-fA-F]{64}$/;
function hex(v,re){if(typeof v!=="string"||!(re||HEX).test(v))throw new Error("bad RPC value");return v}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
async function retry(fn){for(var a=0;;a++){try{return await fn()}catch(e){if(a>=RETRIES)throw e;await sleep(400*Math.pow(2,a))}}}
async function limit(tasks,n){var out=new Array(tasks.length),i=0;async function worker(){while(i<tasks.length){var k=i++;out[k]=await retry(tasks[k])}}var ws=[];for(var w=0;w<Math.min(n,tasks.length);w++)ws.push(worker());await Promise.all(ws);return out}
var TOPIC="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
function $(i){return document.getElementById(i)}
function pad(a){return "0x"+"0".repeat(24)+a.slice(2).toLowerCase()}
var rid=0;function rpc(m,p){var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},RPCMS);return fetch(RPC,{method:"POST",credentials:"omit",signal:ctl.signal,headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:++rid,method:m,params:p})}).then(function(r){if(!r.ok)throw new Error("RPC "+r.status);return r.json()}).then(function(j){if(!j||typeof j!=="object")throw new Error("bad RPC reply");if(j.error)throw new Error(j.error.message);return j.result}).finally(function(){clearTimeout(t)})}
function call(to,data,tag){return rpc("eth_call",[{to:to,data:data},tag])}
function fmt(wei){var w=BigInt(wei),i=w/10n**18n,f=(w%10n**18n)*100n/10n**18n;var s=i.toLocaleString("en-US");return f>0n?s+"."+String(f).padStart(2,"0"):s}
function short(a){return a.slice(0,6)+"…"+a.slice(-4)}
function d10(ms){return new Date(ms).toISOString().slice(0,10)}
var ARR='<svg class="ext" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 2.5h6v6M9.5 2.5 2.5 9.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
function link(h,t){var a=document.createElement("a");a.className="xl";a.href=h;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t;a.insertAdjacentHTML("beforeend",ARR);return a}
function td(lbl,cls){var c=document.createElement("td");c.setAttribute("data-l",lbl);if(cls)c.className=cls;return c}
async function chain(){
 var head=parseInt(await retry(function(){return rpc("eth_blockNumber",[]).then(function(v){return hex(v)})}),16);var tag="0x"+head.toString(16);
 var bal=await retry(function(){return call(TK,"0x70a08231"+pad(MS).slice(2),tag).then(function(v){return hex(v,WORD)})});
 $("pool").textContent=fmt(bal);
 var logs=[],jobs=[];for(var f=DEPLOY;f<=head;f+=CHUNK){(function(a,b){jobs.push(function(){return rpc("eth_getLogs",[{address:TK,fromBlock:"0x"+a.toString(16),toBlock:"0x"+b.toString(16),topics:[TOPIC,pad(MS),pad(DEAD)]}]).then(function(r){if(!Array.isArray(r))throw new Error("bad logs");return r})})})(f,Math.min(head,f+CHUNK-1))}
 (await limit(jobs,CONC)).forEach(function(l){logs=logs.concat(l)});
 logs.forEach(function(l){if(!l||typeof l!=="object")throw new Error("bad log");hex(l.transactionHash,HASH);hex(l.blockNumber);hex(l.logIndex);hex(l.data,WORD)});
 logs.sort(function(a,b){return parseInt(a.blockNumber,16)-parseInt(b.blockNumber,16)||parseInt(a.logIndex,16)-parseInt(b.logIndex,16)});
 var sum=0n;logs.forEach(function(l){l.v=BigInt(l.data);sum+=l.v});
 var bn=Array.from(new Set(logs.map(function(l){return l.blockNumber})));var ts={};
 await limit(bn.map(function(b){return function(){return rpc("eth_getBlockByNumber",[b,false]).then(function(x){if(!x)throw new Error("no block");ts[b]=parseInt(hex(x.timestamp),16)*1000})}}),CONC);
 $("burned").textContent=fmt(sum);$("count").textContent=String(logs.length);
 if(BigInt(bal)===0n&&!logs.length){$("poolhint").textContent="Not funded yet. Burns begin once 507,540,603 ORBS are sent to the Orbs burn controller.";$("counthint").textContent="Not funded yet. Weekly batches start once the program is funded.";$("burnedhint").textContent="Not funded yet. Nothing has been burned under OIP-10 so far."}
 var pct=Number(sum*10000n/(TOTAL*10n**18n))/100;$("progbar").style.width=Math.min(100,pct)+"%";$("progtxt").textContent=pct.toFixed(2)+"% of 507,540,603 ORBS in the program";
 if(logs.length){var L=logs[logs.length-1],sm=document.createElement("small");sm.textContent="ORBS";$("latest").textContent=fmt(L.v)+" ";$("latest").appendChild(sm);$("latesthint").textContent=d10(ts[L.blockNumber])+" UTC · ";$("latesthint").appendChild(link("https://etherscan.io/tx/"+L.transactionHash,"View transaction"))}
 else{$("latest").textContent="None yet";$("latesthint").textContent=BigInt(bal)===0n?"Not funded yet. The first weekly burn will appear here.":"The first weekly burn will appear here"}
 var rows=$("rows");if(logs.length){var fr=document.createDocumentFragment();logs.slice().reverse().forEach(function(l){var tr=document.createElement("tr"),c=td("Date");c.textContent=new Date(ts[l.blockNumber]).toISOString().slice(0,16).replace("T"," ");tr.appendChild(c);c=td("Pricing week");c.innerHTML='<span class="tag ph">[PLACEHOLDER]</span>';tr.appendChild(c);c=td("Price used");c.innerHTML='<span class="tag ph">[PLACEHOLDER]</span>';tr.appendChild(c);c=td("ORBS burned");c.textContent=fmt(l.v);tr.appendChild(c);c=td("Transaction");c.appendChild(link("https://etherscan.io/tx/"+l.transactionHash,short(l.transactionHash)));tr.appendChild(c);fr.appendChild(tr)});rows.textContent="";rows.appendChild(fr)}else rows.innerHTML='<tr><td colspan="5" class="empty">No burns yet. The first weekly burn will appear here after it is executed.</td></tr>';
 $("blockinfo").textContent="Data read from Ethereum at block ";$("blockinfo").appendChild(link("https://etherscan.io/block/"+head,head.toLocaleString("en-US")));
 $("netdot").className="dot ok";
}
function weekStart(now){var d=new Date(now);var m=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-((d.getUTCDay()+6)%7)*DAY;return m-WEEK}
function okObs(p){return Array.isArray(p)&&p.length===2&&typeof p[0]==="number"&&isFinite(p[0])&&typeof p[1]==="number"&&isFinite(p[1])&&p[1]>0}
function okSeries(p){if(!Array.isArray(p)||!p.every(okObs))return false;for(var i=1;i<p.length;i++)if(!(p[i][0]>p[i-1][0]))return false;return true}
function twap(prices,s,e){if(!okSeries(prices))return{ok:false,count:0,gap:0};var area=0,cur=s,cnt=0,gap=0,used=[];for(var i=0;i<prices.length;i++){var u=prices[i],d=prices[i+1];if(!d||d[0]<=s||u[0]>=e)continue;var a=Math.max(s,u[0]),b=Math.min(e,d[0]),g=d[0]-u[0];gap=Math.max(gap,g);if(a!==cur||g>MAXGAP)return{ok:false,count:cnt,gap:gap};area+=u[1]*(b-a);cnt++;cur=b;used.push(u);if(cur===e){used.push(d);break}}if(cur!==e)return{ok:false,count:cnt,gap:gap,tail:cnt>0,cur:cur};var avg=area/(e-s);if(!isFinite(avg)||!(avg>0))return{ok:false,count:cnt,gap:gap};return{ok:true,avg:avg,count:cnt,gap:gap,used:used}}
function chart(r,s,e){var el=$("chart"),W=640,H=240,P=8,pts=r.used.filter(function(p){return p[0]>=s&&p[0]<=e});var ys=pts.map(function(p){return p[1]}).concat([r.avg]),mn=Math.min.apply(0,ys),mx=Math.max.apply(0,ys),pad=(mx-mn)*.12||mx*.01;mn-=pad;mx+=pad;
 function X(t){return P+(t-s)/(e-s)*(W-2*P)}function Y(v){return H-22-(v-mn)/(mx-mn)*(H-40)}
 var line=pts.map(function(p){return X(p[0]).toFixed(1)+","+Y(p[1]).toFixed(1)}).join(" ");var g="";
 for(var k=0;k<=7;k++){var x=X(s+k*DAY);g+='<line x1="'+x+'" x2="'+x+'" y1="8" y2="'+(H-22)+'" stroke="#e2e2e2" class="cg"/>'+(k<7?'<text x="'+(x+4)+'" y="'+(H-6)+'" font-size="10" fill="#59595a" class="ct">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][k]+'</text>':"")}
 el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none">'+g+'<polyline points="'+line+'" fill="none" stroke="#3346f2" class="cp" stroke-width="1.6" vector-effect="non-scaling-stroke"/><line x1="'+P+'" x2="'+(W-P)+'" y1="'+Y(r.avg)+'" y2="'+Y(r.avg)+'" stroke="#da88de" stroke-width="2" stroke-dasharray="6 5" vector-effect="non-scaling-stroke"/></svg>'}
async function pricing(){
 var s=weekStart(Date.now()),e=s+WEEK;
 var url="/api/oip10-burn/prices/";
 $("weeklbl").textContent=d10(s)+" to "+d10(e)+" · Monday 00:00 UTC";
 $("srclink").href=url;
 var key="orbsburn:cg:"+s,cached=null,data=null,stale=false;try{cached=JSON.parse(sessionStorage.getItem(key)||"null")}catch(x){}
 if(cached&&Date.now()-cached.at<15*60e3)data=cached.prices;
 else{try{var ctl=new AbortController(),t=setTimeout(function(){ctl.abort()},CGMS),j;try{var r=await fetch(url,{credentials:"omit",signal:ctl.signal,headers:{Accept:"application/json"}});if(!r.ok)throw new Error("HTTP "+r.status);j=await r.json()}finally{clearTimeout(t)}if(!j||!Array.isArray(j.prices))throw new Error("no prices");data=j.prices.filter(function(p){return !Array.isArray(p)||typeof p[0]!=="number"||!isFinite(p[0])||(p[0]>=s-MAXGAP&&p[0]<=e+MAXGAP)});if(okSeries(data))try{sessionStorage.setItem(key,JSON.stringify({at:Date.now(),prices:data}))}catch(x){}}
  catch(err){if(cached){data=cached.prices;stale=true}else throw err}}
 var res=twap(data,s,e);
 $("obs").textContent=String(res.count);$("gap").textContent=(res.gap/3600e3).toFixed(1)+" hours";
 if(!res.ok&&res.tail&&e-res.cur<=MAXGAP&&Date.now()-e<LAG){$("twap").textContent="Not available yet";$("cov").textContent="Waiting for the final hourly price";$("pricestatus").textContent="The pricing week just closed. The final hourly price usually appears within about an hour.";return}
 if(!res.ok){$("twap").textContent="Not available";$("cov").textContent="Incomplete";$("pricestatus").textContent="The price observations for this week do not pass the coverage check.";return}
 $("twap").textContent="$"+res.avg.toFixed(6);$("cov").textContent="Complete";
 $("pricestatus").textContent="Source: CoinGecko ORBS/USD hourly observations"+(stale?" (showing the last loaded response; refresh failed)":"")+".";
 chart(res,s,e)}
chain().catch(function(e){console.warn("chain",e);$("netdot").className="dot bad";$("rows").innerHTML='<tr><td colspan="5" class="empty">Burn history could not be loaded right now. Refresh to try again.</td></tr>';["burned","pool","latest","count"].forEach(function(i){$(i).textContent="Unavailable"})});
pricing().catch(function(e){console.warn("pricing",e);$("twap").textContent="Unavailable";$("pricestatus").textContent="The price source could not be reached right now. Refresh later to try again.";["obs","gap","cov"].forEach(function(i){$(i).textContent="…"})});
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".copy");if(!b)return;var t=b.getAttribute("data-copy");var done=function(){b.textContent="Copied";setTimeout(function(){b.textContent="Copy"},1400)};if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,function(){});});
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var PALS={light:{paper:["rgba(70,52,46,.30)","rgba(104,70,54,.38)","rgba(170,92,52,.5)","rgba(235,120,60,.5)"],glow:[[26,"rgba(245,158,11,.10)"],[12,"rgba(255,122,47,.18)"],[5,"rgba(255,122,47,.45)"],[2.2,"rgba(245,158,11,.9)"],[.9,"rgba(240,88,122,.85)"]],e1:"#a8501f",e2:"#7a3b1c",ash:"#6b5a52",ea:.5,aa:.3},dark:{paper:["rgba(30,18,13,.82)","rgba(44,25,17,.85)","rgba(110,46,22,.75)","rgba(232,104,44,.6)"],glow:[[26,"rgba(245,130,40,.12)"],[12,"rgba(255,110,47,.22)"],[5,"rgba(255,110,47,.5)"],[2.2,"rgba(255,160,60,.95)"],[.9,"rgba(244,96,130,.9)"]],e1:"#e0702f",e2:"#a8461c",ash:"#8c7b70",ea:.6,aa:.4}};
var ROOT=document.documentElement,TKEY="oip10-theme",onTheme=[];function isDark(){return ROOT.getAttribute("data-theme")==="dark"}var PAL=isDark()?PALS.dark:PALS.light;
function setTheme(dark,save){if(dark)ROOT.setAttribute("data-theme","dark");else ROOT.removeAttribute("data-theme");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",dark?"#0b0b0e":"#f6f6f6");var b=$("thm");if(b){b.setAttribute("aria-pressed",dark?"true":"false");b.setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode")}PAL=dark?PALS.dark:PALS.light;if(save)try{localStorage.setItem(TKEY,dark?"dark":"light")}catch(x){}onTheme.forEach(function(f){f()})}
setTheme(isDark(),false);if($("thm"))$("thm").addEventListener("click",function(){setTheme(!isDark(),true)});
(function burn(){var cv=$("embers"),hero=$("hero");if(!cv)return;var cx=cv.getContext("2d"),W=0,H=0,B=0,dpr=1,ps=[],raf=0,vis=true,onscreen=true,last=0,T0=0,PER=24000,MAXP=34;
function size(){dpr=Math.min(window.devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*dpr|0;cv.height=H*dpr|0;cx.setTransform(dpr,0,0,dpr,0,0);var st=hero.querySelector(".stats");B=Math.min(H,st?st.offsetTop+40:H*.6);MAXP=W<700?18:34;if(ps.length>MAXP)ps.length=MAXP}
function nz(y,t){return Math.sin(y*.021+t*.00031)*14+Math.sin(y*.047-t*.00052+1.7)*7+Math.sin(y*.11+t*.0009+.4)*3}
function ease(p){return p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2}
function state(t){var c=Math.min(1,Math.max(0,t/PER)),p=-.06+1.18*ease(c);return{x:p*W,fade:1}}
function front(t,X){var pts=[],n=Math.ceil(B/8)+1;for(var i=0;i<=n;i++){var y=i*B/n;pts.push([X+nz(y,t)-y*.18,y])}return pts}
function path(pts){cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1])}
var CT=0;function draw(t,dt){CT=t;var s=state(t),pts=front(t,s.x);cx.clearRect(0,0,W,H);cx.globalCompositeOperation="source-over";
if(s.x>-40){cx.globalAlpha=s.fade;path(pts);cx.lineTo(0,B);cx.lineTo(0,0);cx.closePath();var g=cx.createLinearGradient(s.x-260,0,s.x+20,0);for(var gi=0;gi<4;gi++)g.addColorStop([0,.7,.93,1][gi],PAL.paper[gi]);cx.fillStyle=g;cx.fill();
var L=PAL.glow;cx.lineJoin="round";cx.lineCap="round";for(var k=0;k<L.length;k++){path(pts);cx.lineWidth=L[k][0];cx.strokeStyle=L[k][1];cx.stroke()}
if(dt&&ps.length<MAXP&&Math.random()<dt*(t>=PER?.02:.012)){var q=t>=PER?[Math.random()*W,B*(.15+Math.random()*.85)]:pts[(Math.random()*pts.length)|0],a=Math.random()<.6;ps.push({x:q[0],y:q[1],vx:-.01+Math.random()*.03,vy:-(.012+Math.random()*.03),r:a?.7+Math.random()*.9:.5+Math.random()*.7,l:1,d:.00025+Math.random()*.0003,e:a})}}
cx.globalAlpha=1;for(var i=ps.length-1;i>=0;i--){var p=ps[i];if(dt){p.x+=p.vx*dt+Math.sin((p.y+t*.05)*.02)*.08;p.y+=p.vy*dt;p.l-=p.d*dt}if(p.l<=0||p.y<-4){ps.splice(i,1);continue}cx.globalAlpha=Math.min(1,p.l*1.6)*(p.e?PAL.ea:PAL.aa);cx.fillStyle=p.e?(p.l>.5?PAL.e1:PAL.e2):PAL.ash;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill()}
cx.globalAlpha=1;cx.globalCompositeOperation="destination-in";var m=cx.createLinearGradient(0,0,0,B);m.addColorStop(0,"rgba(0,0,0,1)");m.addColorStop(.55,"rgba(0,0,0,.9)");m.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=m;cx.fillRect(0,0,W,H);cx.globalCompositeOperation="source-over"}
function frame(t){raf=0;var dt=Math.min(50,t-(last||t));last=t;var e=t-T0;draw(e,dt);go()}
var FZ=false;function go(){if(!raf&&vis&&onscreen&&!RM&&!FZ)raf=requestAnimationFrame(frame)}function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
size();T0=performance.now();draw(RM?PER:0,0);window.__burnT=function(c){FZ=true;stop();ps=[];for(var j=0;j<40;j++)draw(PER*c-(40-j)*30,30);draw(PER*c,0)};
window.addEventListener("resize",function(){size();if(RM||!raf)draw(CT,0)});onTheme.push(function(){if(RM||!raf)draw(CT,0)});window.__burnCT=function(){return CT};if(RM)return;
document.addEventListener("visibilitychange",function(){vis=!document.hidden;vis?go():stop()});
if("IntersectionObserver"in window)new IntersectionObserver(function(es){onscreen=es[0].isIntersecting;onscreen?go():stop()}).observe(hero);go()})();
(function flow(){var f=$("flow");if(!f)return;var bx=f.querySelectorAll(".fbox"),lbl=$("fstep"),n=bx.length,k=0,tm=0,on=false,fl=f.querySelector(".fl"),cs=[];
function meas(){var r=fl.getBoundingClientRect();cs=[];for(var j=0;j<n;j++){var b=bx[j].querySelector("i").getBoundingClientRect();cs.push(b.top+b.height/2-r.top)}fl.style.setProperty("--t0",cs[0]+"px");fl.style.setProperty("--len",(cs[n-1]-cs[0])+"px");fl.style.setProperty("--fill",((cs[k]||cs[0])-cs[0])+"px")}
meas();window.addEventListener("resize",meas);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(meas);
function show(i){for(var j=0;j<n;j++){bx[j].classList.toggle("cur",j===i);bx[j].classList.toggle("done",j<i)}lbl.textContent="Step "+(i+1)+" of "+n;k=i;if(cs.length)fl.style.setProperty("--fill",(cs[i]-cs[0])+"px")}
if(RM){f.classList.add("static");lbl.textContent=n+" steps";return}
f.classList.add("anim");show(0);function tick(){k=(k+1)%n;show(k);tm=setTimeout(tick,k===n-1?3200:2000)}
if("IntersectionObserver"in window)new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!on){on=true;tm=setTimeout(tick,2000)}else if(!v&&on){on=false;clearTimeout(tm)}},{threshold:.35}).observe(f);else tm=setTimeout(tick,2000)})();
})();
