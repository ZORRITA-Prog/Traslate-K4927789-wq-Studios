// Buscador de cuentas y panel Admin (actividad, limites, ban)
let qt,AU=[],BAN=[];const dq=()=>{clearTimeout(qt);qt=setTimeout(renderUsers,250)};
const fd=x=>new Date(x).toLocaleString(),KIND={text:"Texto",doc:"Documento",img:"Foto",aud:"Audio"};
async function renderUsers(){const q=$("q").value.trim().toLowerCase(),r=await api("dir");
 $("ulist").innerHTML=(r.users||[]).filter(x=>!q||x.u.toLowerCase().includes(q)).map(x=>`<div class="u"><img src="${esc(x.pic||"")}"><div class="g"><b>${esc(x.u)}</b> ${x.admin?'<span class="badge">Admin</span>':""}<div class="cnt">${esc(x.bio||"Trastale")}</div></div></div>`).join("")||"—"}
async function renderAdmin(){if(!CU?.admin)return;const[u,b]=await Promise.all([api("users"),api("banlist")]);
 AU=(u.users||[]).sort((a,c)=>(c.total||0)-(a.total||0));BAN=b.ban||[];
 $("admin").innerHTML=`<div class="cnt">Cuentas: ${AU.length} &middot; ordenadas de más a menos actividad. Modo advertencia: pon un límite (ej. 4) y la cuenta se bloquea al llegar hasta que tú lo quites.</div>`+AU.map((x,i)=>{
  const lim=x.limit!=null,blk=lim&&x.used>=x.limit;
  return `<div class="u"><img src="${esc(x.pic||"")}"><div class="g"><b>${esc(x.u)}</b> ${x.admin?'<span class="badge">Admin</span>':""}${blk?' <span class="badge warn">Bloqueada</span>':lim?' <span class="badge warn">Advertencia</span>':""}
  <div class="cnt">${esc(x.e)} &middot; ${x.total||0} traducciones${lim?` &middot; límite ${x.used}/${x.limit}`:""}${x.last?` &middot; última: ${fd(x.last)}`:""}</div></div>
  <div class="acts">${x.admin&&!CU.owner?"":`<button class="o" onclick="admLogs(${i})">Actividad</button>`}${CU.owner&&!x.owner?`<button class="o" onclick="admRole(${i},${x.admin?0:1})">${x.admin?"Quitar admin":"Dar admin"}</button>`:""}${x.admin?"":`<input type="number" min="0" id="lim-${i}" placeholder="límite"><button onclick="admLim(${i})">Poner límite</button><button class="o" onclick="admLift(${i})">Quitar límite</button><button class="o" onclick="admReset(${i})">Reiniciar</button><button class="d" onclick="admDel(${i},0)">Eliminar</button><button class="d" onclick="admDel(${i},1)">Ban</button>`}</div></div>`}).join("")
  +`<div class="row" style="margin-top:14px"><button onclick="admLogs(-1)">Ver toda la actividad</button></div><div id="alog"></div><h4>Cuentas baneadas (${BAN.length})</h4>`
  +(BAN.map((e,i)=>`<div class="u"><div class="g">${esc(e)}</div><button onclick="admUnban(${i})">Desbanear</button></div>`).join("")||"—")}
async function admLogs(i){const e=i<0?"":AU[i].e,r=await api("logs",{e}),L=r.logs||[];
 $("alog").innerHTML=`<h4>Actividad ${e?"de "+esc(AU[i].u):"de todas las cuentas"} (${L.length})</h4><div class="row"><button class="d" onclick="admClear('${e?i:-1}')">Vaciar registro</button></div>`+
 (L.map(l=>`<div class="log"><small>${fd(l.t)} &middot; <b>${esc(l.u)}</b> &middot; ${KIND[l.k]||esc(l.k)} &middot; ${esc(l.f)} &rarr; ${esc(l.to)}</small><div>${esc(l.x)}</div></div>`).join("")||'<div class="cnt">Sin actividad.</div>');$("alog").scrollIntoView({behavior:"smooth"})}
const admDo=async(a,i,extra)=>{await api(a,{e:AU[i].e,...extra});renderAdmin()};
const admLim=i=>{const v=$("lim-"+i).value;if(v!=="")admDo("limit",i,{limit:+v})},admLift=i=>admDo("limit",i,{limit:null}),admReset=i=>admDo("reset",i);
const admDel=(i,ban)=>confirm(ban?"¿Eliminar y banear esta cuenta?":"¿Eliminar esta cuenta?")&&admDo(ban?"ban":"del",i);
const admRole=(i,v)=>confirm(v?"¿Dar admin a esta cuenta?":"¿Quitar admin a esta cuenta?")&&admDo("setadmin",i,{v});
const admUnban=async i=>{await api("unban",{e:BAN[i]});renderAdmin()};
const admClear=async i=>{if(confirm("¿Vaciar el registro?")){await api("clearlogs",{e:+i<0?"":AU[+i].e});renderAdmin()}};
