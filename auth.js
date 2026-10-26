(()=>{
const $=id=>document.getElementById(id);
window.BADGER='<svg class="bg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="17" cy="19" r="5.5" fill="currentColor"/><circle cx="47" cy="19" r="5.5" fill="currentColor"/><path d="M10 35c0-13 9-20 22-20s22 7 22 20c0 12-9 21-22 21S10 47 10 35z" fill="currentColor"/><path d="M12 31c3-10 10-14 20-14s17 4 20 14c-7-5-13-6-20-6s-13 1-20 6z" fill="var(--bg)"/><circle cx="24" cy="38" r="2.2" fill="var(--bg)"/><circle cx="40" cy="38" r="2.2" fill="var(--bg)"/><path d="M28 46h8l-4 4z" fill="var(--bg)"/></svg>';
const api=async(p,body)=>{let r,d={};try{r=await fetch('/api/auth/'+p,body?{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}:{credentials:'same-origin'});d=await r.json()}catch(e){}return{ok:!!r&&r.ok,d}};
let email='',timer;
const step=s=>{$('stEmail').hidden=s!=='e';$('stCode').hidden=s!=='c';err()};
const err=m=>{$('lerr').textContent=m||'';$('lerr').hidden=!m};
function start(em){window.__uid=em.toLowerCase().replace(/[^a-z0-9]/g,'_');$('login').hidden=true;$('appRoot').hidden=false;const s=document.createElement('script');s.src='/app.js';document.body.appendChild(s)}
window.bvSignOut=async()=>{await api('logout',{});location.reload()};
function cool(){let n=60;const b=$('resend');b.disabled=true;clearInterval(timer);timer=setInterval(()=>{b.textContent=--n>0?`Resend code in ${n}s`:'Resend code';if(n<=0){b.disabled=false;clearInterval(timer)}},1000);b.textContent='Resend code in 60s'}
async function send(){const r=await api('request-otp',{email});if(!r.ok){err(r.d.error||'We couldn’t send the code. Try again in a moment.');return false}$('sentTo').textContent=email;step('c');$('lcode').value='';$('lcode').focus();cool();return true}
$('fEmail').onsubmit=async e=>{e.preventDefault();email=$('lemail').value.trim().toLowerCase();$('sendBtn').disabled=true;await send();$('sendBtn').disabled=false};
$('resend').onclick=send;$('back').onclick=()=>step('e');
$('fCode').onsubmit=async e=>{e.preventDefault();err();const r=await api('verify-otp',{email,code:$('lcode').value.trim()});r.ok?start(r.d.email):err(r.d.error||'That code didn’t work.')};
async function gInit(){const c=await api('config'),id=c.d.googleClientId;if(!id){$('gWrap').hidden=true;return}
const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
s.onload=()=>{google.accounts.id.initialize({client_id:id,callback:async x=>{const r=await api('google',{credential:x.credential});r.ok?start(r.d.email):err(r.d.error||'Google sign-in failed. Try again or use your email.')}});google.accounts.id.renderButton($('gBtn'),{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:300})};document.head.appendChild(s)}
(async()=>{$('lbadge').innerHTML=window.BADGER;const s=await api('session');if(s.ok&&s.d.email)return start(s.d.email);$('login').hidden=false;gInit()})();
})();
