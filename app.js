
const API="https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/KONSTANZ/W/currentmeasurement.json";
const $=id=>document.getElementById(id);
let ports=[];
let settings=JSON.parse(localStorage.getItem("settings")||'{"draft":1.70,"buffer":0.10,"reference":2.50}');

const num=v=>Number(String(v).replace(",","."));
const fmt=v=>Number.isFinite(v)?v.toFixed(2).replace(".",",")+" m":"–";

function level(){
 const m=num($("manualLevel").value);
 if(Number.isFinite(m)&&m>0)return m;
 const s=num(localStorage.getItem("lastLevel"));
 return Number.isFinite(s)&&s>0?s:NaN;
}
function used(p){
 const m=$("mode").value;
 if(m==="safe")return p.min;
 if(m==="mid")return p.max==null?p.min:(p.min+p.max)/2;
 return p.max==null?p.min:p.max;
}
function calc(p){
 const l=level(); if(!Number.isFinite(l))return {status:"unknown",label:"Pegel eingeben"};
 const plan=used(p),current=plan+l-settings.reference,under=current-settings.draft,reserve=current-(settings.draft+settings.buffer);
 const status=reserve>=.20?"safe":reserve>=0?"tight":"unsafe";
 return {status,label:status==="safe"?"ZUGÄNGLICH":status==="tight"?"KNAPP ZUGÄNGLICH":"NICHT ZUGÄNGLICH",plan,current,under,reserve};
}
function populate(q=""){
 const cur=$("port").value,needle=q.toLowerCase();
 $("port").innerHTML="";
 ports.filter(p=>p.name.toLowerCase().includes(needle)).forEach(p=>{
  const o=document.createElement("option");o.value=p.name;o.textContent=p.name;$("port").appendChild(o);
 });
 if([...$("port").options].some(o=>o.value===cur))$("port").value=cur;
 update();
}
function update(){
 const p=ports.find(x=>x.name===$("port").value)||ports[0]; if(!p)return;
 const r=calc(p); $("status").className="status "+r.status;$("status").textContent=r.label;
 $("plan").textContent=fmt(r.plan);$("current").textContent=fmt(r.current);$("under").textContent=fmt(r.under);$("reserve").textContent=fmt(r.reserve);
 $("detail").textContent=`Original: ${p.raw} · Datenerhebung: ${p.stand} · ${p.type}.${p.note?" "+p.note:""}`;
 render();
}
async function getLevel(){
 $("levelInfo").textContent="Pegel wird geladen …";
 try{
  const res=await fetch(API,{cache:"no-store"});if(!res.ok)throw new Error();
  const d=await res.json(),v=Number(d.value)/100;
  localStorage.setItem("lastLevel",String(v));$("onlineLevel").value=v.toFixed(2);
  $("levelInfo").textContent=`Onlinewert gespeichert: ${fmt(v)} · ${d.timestamp||""}`;
 }catch{
  $("levelInfo").textContent=`Abruf nicht möglich. Verwendeter Wert: ${fmt(level())}`;
 }
 update();
}
function render(){
 const f=$("filter").value;$("rows").innerHTML="";
 ports.map(p=>[p,calc(p)]).filter(x=>f==="all"||x[1].status===f).sort((a,b)=>(b[1].reserve??-999)-(a[1].reserve??-999)).forEach(([p,r])=>{
  const d=document.createElement("div");d.className="row";
  d.innerHTML=`<div class="line"><h3>${p.name}</h3><span class="badge ${r.status}">${r.label}</span></div>
  <div class="line"><span>${p.raw}</span><strong>Reserve ${fmt(r.reserve)}</strong></div>
  <div class="small">Datenerhebung: ${p.stand} · ${p.note||p.type}</div>`;
  d.onclick=()=>{$("port").value=p.name;show("check");update();scrollTo(0,0)};$("rows").appendChild(d);
 });
}
function show(id){
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("hidden",v.id!==id));
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>show(b.dataset.tab));
$("search").oninput=e=>populate(e.target.value);$("port").onchange=update;$("mode").onchange=update;$("filter").onchange=render;
$("manualLevel").oninput=()=>{localStorage.setItem("manualLevel",$("manualLevel").value);update()};
$("loadLevel").onclick=getLevel;$("save").onclick=()=>{
 settings={draft:num($("draft").value),buffer:num($("buffer").value),reference:num($("reference").value)};
 localStorage.setItem("settings",JSON.stringify(settings));update();show("check");
};
(async()=>{
 ports=await fetch("./data/haefen.json").then(r=>r.json());
 $("draft").value=settings.draft.toFixed(2);$("buffer").value=settings.buffer.toFixed(2);$("reference").value=settings.reference.toFixed(2);
 $("manualLevel").value=localStorage.getItem("manualLevel")||"";
 const l=num(localStorage.getItem("lastLevel"));if(Number.isFinite(l))$("onlineLevel").value=l.toFixed(2);
 populate();render();
 if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js");
})();
