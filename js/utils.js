// Utilidades y almacenamiento
let ui=localStorage.ui||"es",mode="login",TABS=["text","doc","img","aud","voc","usr"],CU=null; // CU = usuario actual
const $=id=>document.getElementById(id),t=k=>(I[ui]||I.en)[k]||I.en[k]||I.es[k]||"";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ls=(k,d)=>{try{return JSON.parse(localStorage[k])??d}catch{return d}},sv=(k,v)=>localStorage[k]=JSON.stringify(v);
const me=()=>CU;
function sha256(s){
 const x=[...new TextEncoder().encode(s)],l=x.length*8;x.push(128);while(x.length%64!=56)x.push(0);
 for(let i=7;i>=0;i--)x.push(i>3?0:(l>>>(i*8))&255);
 const K=[],H=[];for(let p=2,c=0;c<64;p++){let q=1;for(let i=2;i*i<=p;i++)if(p%i==0)q=0;if(q){if(c<8)H[c]=Math.floor(Math.pow(p,.5)%1*4294967296);K[c++]=Math.floor(Math.pow(p,1/3)%1*4294967296)}}
 const R=(v,n)=>(v>>>n)|(v<<(32-n));
 for(let o=0;o<x.length;o+=64){const w=[];for(let i=0;i<16;i++)w[i]=(x[o+4*i]<<24|x[o+4*i+1]<<16|x[o+4*i+2]<<8|x[o+4*i+3])>>>0;
  for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2];w[i]=(w[i-16]+(R(a,7)^R(a,18)^(a>>>3))+w[i-7]+(R(b,17)^R(b,19)^(b>>>10)))>>>0}
  let[a,b,c,d,e,f,g,h]=H;
  for(let i=0;i<64;i++){const t1=(h+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[i]+w[i])>>>0,t2=((R(a,2)^R(a,13)^R(a,22))+((a&b)^(a&c)^(b&c)))>>>0;h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0}
  [a,b,c,d,e,f,g,h].forEach((v,i)=>H[i]=(H[i]+v)>>>0)}
 return H.map(v=>v.toString(16).padStart(8,"0")).join("")}
const h=async s=>sha256(s);
