// MODO LOCAL: imita al servidor usando localStorage (solo funciona en el navegador de cada persona).
// Si pones API_URL en config.js, este archivo ya no se usa y puedes borrarlo.
const DEFPIC="https://inmiku.infinityfreeapp.com/u/ImMiku_541d421d.jpg";
const LOCAL_ADMIN={u:"k4927789-wq",e:"k4927789@gmail.com",p:"8cf314ae5ba69467cc3b480af0bed5e2886ecb9dcc405ebcafa3e838fff3eaf5",pic:"https://inmiku.infinityfreeapp.com/u/ImMiku_a8f73f64.jpg",bio:"Cuenta oficial del creador y administrador de Trastale-K4927789-wq-Studio. Gestiona la comunidad y mantiene la página segura.",admin:1};
const OWNER_E=LOCAL_ADMIN.e;
// Admins extra (se crean una sola vez). Solo el creador puede dar o quitar admin y ver la actividad de los admins.
const EXTRA_ADMINS=[{u:"Emmanuel",e:"emmanuel@gmail.com",p:"7dba04654e68541302908cdd3316ba5c6f6d8621dec9d8d8cf7252a405559f2e"},{u:"Abraham Ruiz",e:"abrahamruiz@gmail.com",p:"efd0c3fbba873bf594fb1e0252456f763778cf933b69f0303f1e9fabb96c3436"}];
const pub=x=>{const{p,...r}=x;r.owner=x.e==OWNER_E?1:0;return r};
const okUser=u=>/^[\w.-]{3,20}$/.test(u||"");
async function localApi(a,d){
 const U=ls("users",[]),a0=U.find(x=>x.e==OWNER_E);
 if(!a0)U.unshift({...LOCAL_ADMIN,date:Date.now()});else{a0.admin=1;if(!/^[0-9a-f]{64}$/.test(a0.p))a0.p=LOCAL_ADMIN.p}
 const seeded=ls("seeded",[]);let ns=0;
 EXTRA_ADMINS.forEach(z=>{if(seeded.includes(z.e))return;seeded.push(z.e);ns=1;
  if(!U.find(y=>y.e==z.e||y.u.toLowerCase()==z.u.toLowerCase()))U.push({...z,g:0,pic:DEFPIC,bio:"",date:Date.now(),used:0,total:0,limit:null,admin:1})});
 if(ns||!a0){sv("seeded",seeded);sv("users",U)}
 U.forEach(x=>{x.used??=0;x.total??=0;x.limit??=null;x.bio??=""});
 const ban=ls("ban",[]),save=()=>sv("users",U),em=localStorage.tok||"";let m=U.find(x=>x.e==em)||null;
 if(m&&ban.includes(m.e))m=null;
 const need=()=>m?null:{err:"auth"},adm=()=>m&&m.admin?null:{err:"auth"},own=m&&m.admin&&m.e==OWNER_E;
 // un log de admin solo lo ve el creador
 const hid=l=>!own&&(l.ad||!!U.find(y=>y.e==l.e&&y.admin));
 const start=x=>{x.last=Date.now();save();return{ok:1,token:x.e,user:pub(x)}};
 const nu=(u,e,p,g)=>({u,e,p,g,pic:DEFPIC,bio:"",date:Date.now(),used:0,total:0,limit:null});
 let r,x;
 switch(a){
 case"register":{const e=(d.e||"").trim().toLowerCase(),u=(d.u||"").trim();
  if(!okUser(u))return{err:"user"};if(!e.includes("@"))return{err:"bad"};if((d.p||"").length<6)return{err:"pass"};
  if(ban.includes(e))return{err:"banned"};if(U.find(y=>y.e==e||y.u.toLowerCase()==u.toLowerCase()))return{err:"exists"};
  x=nu(u,e,await h(d.p),0);U.push(x);return start(x)}
 case"login":{const id=(d.id||"").trim().toLowerCase();x=U.find(y=>y.u.toLowerCase()==id||y.e==id);
  if(!x||x.p!=await h(d.p||""))return{err:"bad"};if(ban.includes(x.e))return{err:"banned"};return start(x)}
 case"google":{const e=(d.e||"").trim().toLowerCase();if(!e.includes("@"))return{err:"bad"};if(ban.includes(e))return{err:"banned"};
  x=U.find(y=>y.e==e);if(!x){x=nu(e.split("@")[0].replace(/[^\w.-]/g,"_").slice(0,20)||"user",e,"google:"+Math.random(),1);U.push(x)}return start(x)}
 case"me":return{user:m?pub(m):null};
 case"logout":return{ok:1};
 case"profile":if(r=need())return r;
  if(d.u&&d.u!=m.u){if(!okUser(d.u))return{err:"user"};if(U.find(y=>y!=m&&y.u.toLowerCase()==d.u.toLowerCase()))return{err:"exists"};m.u=d.u}
  if(d.bio!=null)m.bio=String(d.bio).slice(0,200);
  if(d.pic&&/^(data:image\/|https?:)/.test(d.pic)&&d.pic.length<80000)m.pic=d.pic;
  if(d.np){if(d.np.length<6)return{err:"pass"};if(m.p!=await h(d.op||""))return{err:"bad"};m.p=await h(d.np)}
  save();return{ok:1,user:pub(m)};
 case"dir":return{users:U.filter(y=>!ban.includes(y.e)).map(y=>({u:y.u,pic:y.pic,bio:y.bio,admin:y.admin}))};
 case"use":{if(r=need())return r;if(m.limit!=null&&m.used>=m.limit)return{err:"limit"};
  m.used++;m.total++;m.last=Date.now();const L=ls("logs",[]);L.push({t:Date.now(),e:m.e,u:m.u,ad:m.admin?1:0,k:d.k,f:d.f,to:d.to,x:String(d.x||"").slice(0,500)});sv("logs",L.slice(-500));save();
  return{ok:1,used:m.used,limit:m.limit}}
 }
 if(!["users","banlist","del","ban","unban","setadmin","limit","reset","logs","clearlogs"].includes(a))return{err:"bad"};
 if(r=adm())return r;
 switch(a){
 case"users":return{users:U.map(pub)};
 case"banlist":return{ban};
 case"del":case"ban":x=U.find(y=>y.e==d.e);if(!x||x.admin)return{err:"bad"};
  sv("users",U.filter(y=>y!=x));if(a=="ban"&&!ban.includes(x.e)){ban.push(x.e);sv("ban",ban)}return{ok:1};
 case"unban":sv("ban",ban.filter(e=>e!=d.e));return{ok:1};
 case"setadmin":x=U.find(y=>y.e==d.e);if(!own||!x||x.e==OWNER_E)return{err:"bad"};
  if(d.v){x.admin=1;x.limit=null;x.used=0}else delete x.admin;save();return{ok:1};
 case"limit":x=U.find(y=>y.e==d.e);if(!x||(x.admin&&!own))return{err:"bad"};{const n=parseInt(d.limit);x.limit=isNaN(n)?null:Math.max(0,n)}x.used=0;save();return{ok:1};
 case"reset":x=U.find(y=>y.e==d.e);if(!x||(x.admin&&!own))return{err:"bad"};x.used=0;save();return{ok:1};
 case"logs":return{logs:ls("logs",[]).filter(l=>!hid(l)&&(!d.e||l.e==d.e)).slice(-300).reverse()};
 case"clearlogs":sv("logs",ls("logs",[]).filter(l=>hid(l)||(d.e&&l.e!=d.e)));return{ok:1};
 }}
