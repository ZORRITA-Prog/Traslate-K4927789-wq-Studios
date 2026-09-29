// Interfaz, navegacion, idiomas de la pagina (se traduce a cualquier idioma) y contadores
async function setUI(l){
 if(!I[l]){const c=ls("ui4_"+l,null);if(c)I[l]=c;else{
  const keys=Object.keys(I.en),out={};$("ui").disabled=true;
  await Promise.all(keys.map(async k=>{try{out[k]=await tr(I.en[k],"en",l)}catch{out[k]=I.en[k]}}));
  if(keys.some(k=>out[k]!=I.en[k]))sv("ui4_"+l,out);I[l]=out;$("ui").disabled=false}}
 ui=l;localStorage.ui=l;document.documentElement.lang=l;document.documentElement.dir=RTL.includes(l)?"rtl":"ltr";
 buildLangs();fillUI();fillLangs();
 document.querySelectorAll("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));
 document.querySelectorAll("[data-p]").forEach(e=>e.placeholder=t(e.dataset.p));
 buildNav();counters();authUI();if(CU&&document.querySelector("#s-prof.on"))renderProfile()}
function fillUI(){const s=$("ui");if(s.options.length<50)s.innerHTML=CODES.map(c=>[c,dn(c,c)]).sort((a,b)=>a[1].localeCompare(b[1])).map(([c,n])=>`<option value="${c}">${esc(n)}</option>`).join("");s.value=ui}
function fillLangs(){const opt=a=>Object.entries(LANGS).filter(([k])=>a||k!="auto").map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join("");
 document.querySelectorAll(".langs").forEach(d=>{const f=d.querySelector(".f")?.value||"auto",o=d.querySelector(".to")?.value||"en";
  d.innerHTML=`<select class="f">${opt(1)}</select>&rarr;<select class="to">${opt(0)}</select>`;d.querySelector(".f").value=f;d.querySelector(".to").value=o});
 const v=$("v-to");if(v){const o=v.value||"ja";v.innerHTML=opt(0);v.value=o}}
function buildNav(){const cur=document.querySelector(".sec.on")?.id.slice(2)||"text",T=[...TABS];if(CU)T.push("prof");if(CU?.admin)T.push("adm");
 $("nav").innerHTML=T.map(k=>`<button class="o ${k==cur?"on":""}" onclick="show('${k}')">${k=="adm"?"Admin":t(k)}</button>`).join("")}
function show(k){document.querySelectorAll(".sec").forEach(s=>s.classList.toggle("on",s.id=="s-"+k));buildNav();if(k=="usr")renderUsers();if(k=="adm")renderAdmin();if(k=="prof")renderProfile()}
const lg=id=>{const d=$(id).querySelector(".langs");return[d.querySelector(".f").value,d.querySelector(".to").value]};
function counters(){["text","doc","img","aud"].forEach(k=>{const el=$("c-"+k),m=CU;
 el.textContent=!m?`${Math.max(0,15-(+localStorage["c_"+k]||0))} ${t("left")}`:m.limit==null?t("unl"):`${Math.max(0,m.limit-m.used)} ${t("left")}`;
 el.style.color=m&&m.limit!=null&&m.used>=m.limit?"var(--o)":""})}
// Devuelve "" si puede traducir, o el mensaje de error si no (invitado sin cupo, limite del admin, cuenta baneada...)
async function use(k,f,to,x){
 if(!CU){const n=+localStorage["c_"+k]||0;if(n>=15){openAuth(t("limit"));return t("limit")}localStorage["c_"+k]=n+1;counters();return""}
 const r=await api("use",{k,f,to,x});
 if(r.err){if(r.err=="banned"||r.err=="auth"){localStorage.removeItem("tok");CU=null;setUI(ui)}return emsg(r)}
 CU.used=r.used;CU.limit=r.limit;CU.total=(CU.total||0)+1;counters();return""}
