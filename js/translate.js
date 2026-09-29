// Traduccion: texto, documentos, fotos, audio y vocabulario
const MM=c=>({zh:"zh-CN",nb:"no",nn:"no",fil:"tl"}[c]||c);
async function tr(text,f,to){const parts=text.match(/[\s\S]{1,450}(?:[.!?。\n]|$)|[\s\S]+/g)||[];let o="";
 for(const p of parts){if(!p.trim()){o+=p;continue}
  const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(p)}&langpair=${f=="auto"?"Autodetect":MM(f)}|${MM(to)}`);
  const j=await r.json(),x=j.responseData?.translatedText||"";
  if(/MYMEMORY WARNING/i.test(x))throw new Error("Limite diario de traducciones gratis alcanzado. Intenta mañana.");
  o+=(!x||/PLEASE SELECT TWO DISTINCT|INVALID LANGUAGE/i.test(x)?p:x)+" "}return o.trim()}
async function run(k,out,getText){const o=$(out);try{const x=await getText();if(!x)return;const[f,to]=lg("s-"+k),g=await use(k,f,to,x);if(g){o.textContent=g;return}o.textContent="Traduciendo...";o.textContent=await tr(x,f,to)}catch(e){o.textContent="Error: "+e.message}}
const doText=()=>run("text","t-out",()=>$("t-in").value.trim());
const doDoc=()=>run("doc","d-out",async()=>{const f=$("d-in").files[0];return f?(await f.text()).trim():""});
const doImg=()=>run("img","i-out",async()=>{const f=$("i-in").files[0];if(!f)return"";$("i-out").textContent="Leyendo imagen...";const r=await Tesseract.recognize(f,"eng+spa+fra+por+deu+ita");return r.data.text.trim()});
function doAud(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("a-out").textContent="Usa Chrome o Edge";return}
 const[f,to]=lg("s-aud"),r=new SR();r.lang=f=="auto"?"es-ES":f;$("mic").style.opacity=.6;
 r.onresult=async e=>{const s=e.results[0][0].transcript;const g=await use("aud",f,to,s);if(g){$("a-out").textContent=g;return}$("a-out").textContent=s+"\n→ "+await tr(s,f=="auto"?"es":f,to)};
 r.onerror=e=>$("a-out").textContent="Error: "+e.error;r.onend=()=>$("mic").style.opacity=1;r.start()}
function dl(){const b=new Blob([$("d-out").textContent],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="trastale.txt";a.click()}
// Vocabulario: varias fuentes de diccionario gratuitas (el usuario elige cual usar o todas)
const NAMES={wen:"Wiktionary (English)",wes:"Wikcionario (Español)",wfr:"Wiktionnaire (Français)",wde:"Wiktionary (Deutsch)",wpt:"Wikcionário (Português)",wit:"Wikizionario (Italiano)",fd:"Free Dictionary API (English)",wp:"Wikipedia"};
const own=el=>{const c=el.cloneNode(true);c.querySelectorAll("ul,ol,dl,style,script,sup,.mw-editsection").forEach(x=>x.remove());return c.textContent.replace(/\s+/g," ").trim()};
async function wik(ed,w){for(const q of new Set([w,w.toLowerCase(),w.charAt(0).toUpperCase()+w.slice(1)])){try{
 const j=await(await fetch(`https://${ed}.wiktionary.org/w/api.php?action=parse&prop=text&redirects=1&format=json&formatversion=2&origin=*&page=${encodeURIComponent(q)}`)).json();
 if(!j.parse)continue;const root=new DOMParser().parseFromString(j.parse.text,"text/html").querySelector(".mw-parser-output"),out=[];let lang="",pos="";
 for(const el of root?root.children:[]){const h=/^H[2-5]$/.test(el.tagName)?el:el.querySelector(":scope > h2,:scope > h3,:scope > h4,:scope > h5");
  if(h){const x=h.textContent.replace(/\[.*?\]/g,"").trim();if(h.tagName=="H2"){lang=x;pos=""}else pos=x;continue}
  const it=el.tagName=="OL"?[...el.children].filter(x=>x.tagName=="LI"):el.tagName=="DL"?[...el.querySelectorAll(":scope > dd")]:[];
  const items=it.map(own).filter(Boolean).slice(0,4);if(items.length)out.push({lang,pos,items})}
 if(out.length)return out.slice(0,6)}catch{}}return[]}
async function fdict(w){try{const r=await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+encodeURIComponent(w));if(!r.ok)return[];return(await r.json()).slice(0,1).flatMap(e=>e.meanings.slice(0,4).map(m=>({lang:e.word,pos:m.partOfSpeech,items:m.definitions.slice(0,3).map(d=>d.definition)})))}catch{return[]}}
async function wpedia(w){const o=[];for(const l of["es","en"]){try{const r=await fetch(`https://${l}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(w)}`);if(!r.ok)continue;const j=await r.json();if(j.type=="standard"&&j.extract)o.push({lang:"Wikipedia "+l.toUpperCase()+" - "+j.title,pos:"",items:[j.extract]})}catch{}}return o}
const grp=g=>g.map(e=>`<div class="def"><b>${esc(e.lang)}</b>${e.pos?` &middot; <i>${esc(e.pos)}</i>`:""}${e.items.map(x=>`<div>- ${esc(x)}</div>`).join("")}</div>`).join("");
async function doVoc(){const w=$("v-in").value.trim();if(!w)return;const o=$("v-out"),s=$("v-src").value;o.textContent="...";
 const jobs={wen:()=>wik("en",w),wes:()=>wik("es",w),wfr:()=>wik("fr",w),wde:()=>wik("de",w),wpt:()=>wik("pt",w),wit:()=>wik("it",w),wp:()=>wpedia(w),
  fd:async()=>fdict((await tr(w,"auto","en").catch(()=>w)).split(/\s+/)[0].toLowerCase())};
 const keys=s=="all"?Object.keys(NAMES):[s],L=[...new Set(["es","en","fr","pt","de","it",$("v-to").value])];
 const [tl,...res]=await Promise.all([Promise.all(L.map(l=>tr(w,"auto",l).catch(()=>"-"))),...keys.map(k=>jobs[k]())]);
 let html=`<h3 class="wd">${esc(w)}</h3><div class="chips">${L.map((l,i)=>`<span><b>${esc(LANGS[l]||l)}</b>${esc(tl[i])}</span>`).join("")}</div>`;const none=[];
 keys.forEach((k,i)=>res[i].length?html+=`<h4>${NAMES[k]}</h4>`+grp(res[i]):none.push(NAMES[k]));
 if(none.length)html+=`<div class="cnt" style="margin-top:12px">${esc(t("nores"))}: ${none.map(esc).join(", ")}</div>`;
 o.innerHTML=html+`<div class="src">Wiktionary / Wikipedia - CC BY-SA</div>`}
