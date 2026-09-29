// Punto unico de datos: con API_URL habla con el servidor (api/api.php); sin el, usa el modo local (local.js)
async function api(a,d={}){if(!API_URL)return localApi(a,d);
 try{const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...d,a,t:localStorage.tok||""})});return await r.json()}catch{return{err:"net"}}}
const emsg=r=>t("e_"+r.err)||r.err;
