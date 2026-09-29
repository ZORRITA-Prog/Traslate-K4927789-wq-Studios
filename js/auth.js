// Inicio de sesion, registro y Google
function openAuth(msg){$("modal").style.display="flex";$("mtxt").textContent=msg||"";render()}
function closeM(){$("modal").style.display="none"}
function switchMode(){mode=mode=="login"?"reg":"login";render()}
function render(){$("mt").textContent=mode=="login"?t("login"):t("sw").split(" / ")[0];$("m-e").style.display=mode=="reg"?"":"none";$("merr").textContent="";
 $("m-u").placeholder=mode=="login"?t("user")+" / "+t("email"):t("user")}
async function afterAuth(r){if(r.err){$("merr").textContent=emsg(r);return}localStorage.tok=r.token;CU=r.user;closeM();await setUI(ui)}
async function submitAuth(){const u=$("m-u").value.trim(),p=$("m-p").value;if(!u||!p)return $("merr").textContent=t("e_bad");
 afterAuth(await(mode=="reg"?api("register",{u,e:$("m-e").value,p}):api("login",{id:u,p})))}
function googleLogin(){
 if(!API_URL){const e=(prompt("Gmail:")||"").trim();if(e)api("google",{e}).then(afterAuth);return}
 const go=()=>{google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:r=>api("google",{cred:r.credential}).then(afterAuth)});google.accounts.id.prompt()};
 if(window.google?.accounts)return go();const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.onload=go;document.head.appendChild(s)}
function logout(){api("logout").finally(()=>{localStorage.removeItem("tok");CU=null;show("text");setUI(ui)})}
function authUI(){const m=CU;$("who").innerHTML=m?`<a onclick="show('prof')" style="cursor:pointer"><img src="${esc(m.pic||"")}">${esc(m.u)}</a> ${m.admin?'<span class="badge">Admin</span>':""}`:"";
 $("bin").style.display=m?"none":"";$("bout").style.display=m?"":"none";$("gbtn").style.display=(!API_URL||GOOGLE_CLIENT_ID)?"":"none"}
