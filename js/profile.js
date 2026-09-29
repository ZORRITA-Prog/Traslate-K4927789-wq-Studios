// Perfil: foto, nombre de usuario, descripcion y contraseña
let PIC="";
function pickPic(inp){const f=inp.files[0];if(!f)return;const i=new Image();i.onload=()=>{const c=document.createElement("canvas");c.width=c.height=160;const s=Math.min(i.width,i.height);
 c.getContext("2d").drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,160,160);PIC=c.toDataURL("image/jpeg",.8);$("p-img").src=PIC};i.src=URL.createObjectURL(f)}
function renderProfile(){const m=CU;if(!m){show("text");return}PIC="";
 $("prof").innerHTML=`<div class="u"><img id="p-img" class="big" src="${esc(m.pic||"")}"><div class="g"><b>${esc(m.u)}</b> ${m.admin?'<span class="badge">Admin</span>':""}<div class="cnt">${esc(m.e)}</div>${m.limit!=null?`<div class="cnt">${m.used} ${t("of")} ${m.limit} ${t("used")}</div>`:""}</div></div>
 <label>${t("photo")}</label><input type="file" id="p-file" accept="image/*" onchange="pickPic(this)">
 <label>${t("user")}</label><input id="p-u" style="width:100%" value="${esc(m.u)}" maxlength="20">
 <label>${t("bio")}</label><textarea id="p-bio" maxlength="200" style="min-height:90px">${esc(m.bio||"")}</textarea>
 <label>${t("oldp")} / ${t("newp")}</label><div class="row"><input type="password" id="p-op" placeholder="${esc(t("oldp"))}"><input type="password" id="p-np" placeholder="${esc(t("newp"))}"></div>
 <div class="row"><button onclick="saveProfile()">${esc(t("save"))}</button><span id="p-msg" class="cnt"></span></div>`}
async function saveProfile(){const r=await api("profile",{u:$("p-u").value.trim(),bio:$("p-bio").value,pic:PIC||undefined,op:$("p-op").value,np:$("p-np").value}),el=$("p-msg");
 if(r.err){el.style.color="#ff7a8f";el.textContent=emsg(r);return}
 CU=r.user;authUI();el.style.color="#7be0a5";el.textContent=t("saved");$("p-op").value=$("p-np").value="";$("prof").querySelector("b").textContent=CU.u}
