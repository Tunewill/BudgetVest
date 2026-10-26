
const KEY='budgetvest_'+(window.__uid||'guest');
const P={
 home:'M3 11l9-8 9 8v10H3z',
 rent:'M3 11l9-8 9 8v10H3zM10 21v-6h4v6',
 feeding:'M6 3v8M10 3v8M6 7h4M8 11v10M17 3c-2 2-2 6 0 8v10',
 transport:'M5 16V10l2-5h10l2 5v6M3 16h18M7 19v-3M17 19v-3',
 finance:'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-3v3M17 14h2',
 emergency:'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z',
 investment:'M3 17l6-6 4 4 8-8M15 7h6v6',
 data:'M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01',
 health:'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z',
 utilities:'M13 2L4 14h7l-1 8 9-12h-7z',
 tithe:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
 personal:'M12 3a9 9 0 100 18 9 9 0 000-18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
 misc:'M5 12h.01M12 12h.01M19 12h.01',
 plus:'M12 5v14M5 12h14',edit:'M4 20h4L19 9l-4-4L4 16zM13 7l4 4',
 sun:'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5',
 moon:'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
 list:'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
 chart:'M4 20V10M10 20V4M16 20v-8M22 20H2',
 target:'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z',
 close:'M6 6l12 12M18 6L6 18',out:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',down:'M12 4v12M6 11l6 6 6-6M4 21h16',
 spark:'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2'
};
const ic=n=>`<svg class="i" viewBox="0 0 24 24"><path d="${P[n]||P.misc}"/></svg>`;
const DEF=[['rent','Rent',33400],['feeding','Feeding',70000],['transport','Transport',25000],['finance','Finance Savings',50000],['emergency','Emergency Fund',30000],['investment','Investment',25000],['data','Data / Airtime',10000],['health','Health Fund',10000],['utilities','Utilities',15000],['tithe','Tithe (10%)',33500],['personal','Personal Care',15000],['misc','Miscellaneous',18100]];
const SAVE=new Set(['finance','emergency','investment','health']);
const KW={transport:/bolt|uber|okada|keke|bus|fuel|petrol|taxi|brt|ride|transport|fare/,data:/mtn|airtel|glo\b|9mobile|data|airtime|recharge|bundle/,utilities:/nepa|phcn|electric|light|prepaid|token|dstv|gotv|startimes|water|wifi|internet|gas/,feeding:/rice|jollof|suya|food|market|shoprite|lunch|dinner|breakfast|groceries|chicken|bread|restaurant|eat|drink|snack|mama put/,rent:/rent|landlord|agent/,tithe:/tithe|church|offering|mosque|donation/,health:/pharmacy|hospital|clinic|drug|doctor|medic|hmo|lab test/,personal:/salon|barber|hair|skincare|cosmetic|makeup|laundry|perfume|nails/,finance:/ajo|cowrywise|piggyvest|savings|esusu|thrift/,investment:/invest|stock|bamboo|risevest|treasury|mutual fund/,emergency:/emergency/};
const $=id=>document.getElementById(id);
const N=n=>'₦'+Math.round(n).toLocaleString('en-NG');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mk=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
const lab=k=>{const[y,m]=k.split('-');return new Date(y,m-1,1).toLocaleDateString('en-NG',{month:'long',year:'numeric'})};
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);

let data=(()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.months)return s}catch(e){}return{income:335000,months:{}}})();
const store=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}};
const cur=mk();let view=cur,tab='budget',manual=false;
const defCats=()=>DEF.map(([id,name,allocated])=>({id,name,allocated,spent:0,icon:id}));
function ensure(k){if(data.months[k])return;const prev=Object.keys(data.months).filter(x=>x<k).sort().pop();
 data.months[k]={categories:prev?data.months[prev].categories.map(c=>({...c,spent:0})):defCats(),transactions:[],committed:false}}
ensure(cur);
const M=()=>data.months[view],isCur=()=>view===cur;
const cat=(m,id)=>m.categories.find(c=>c.id===id);
const day=()=>new Date().getDate(),dim=()=>new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
function proj(c){if(!isCur())return c.spent;const w=day()/dim(),run=c.spent/day()*dim();return Math.max(c.spent,w*run+(1-w)*Math.max(c.allocated,c.spent))}
function guess(t){t=t.toLowerCase().trim();if(!t)return null;const first=t.split(/\s+/)[0];
 for(const x of [...data.months[cur].transactions].reverse())if(x.note&&x.note.toLowerCase().split(/\s+/)[0]===first)return x.categoryId;
 for(const id in KW)if(KW[id].test(t))return id;return null}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
const pct=(a,b)=>b>0?Math.min(100,a/b*100):0;
const barCls=(a,b)=>a>=b*.85&&b>0?'warn':'';

function row(c,sub,right,p,w){return `<div class="glass row" data-q="${c.id}"><span class="tile">${ic(c.id)}</span><div class="m"><div class="t"><span>${esc(c.name)}</span><span>${right}</span></div><div class="s">${sub}</div><div class="bar"><b class="${w}" style="width:${p}%"></b></div></div></div>`}

function render(){
 const m=M(),inc=data.income,sp=sum(m.categories,c=>c.spent),al=sum(m.categories,c=>c.allocated),left=inc-sp;
 $('left').textContent=N(left);$('hSpent').textContent=N(sp);$('hInc').textContent=N(inc);
 $('heroBar').style.width=pct(sp,inc)+'%';$('heroBar').className=barCls(sp,inc);$('ro').classList.toggle('hidden',isCur());
 const keys=Object.keys(data.months).sort().reverse();
 $('monthSel').innerHTML=keys.map(k=>`<option value="${k}" ${k===view?'selected':''}>${lab(k)}${k===cur?' (current)':''}</option>`).join('');
 const diff=inc-al;
 $('planNote').innerHTML=`<div class="glass note">${diff===0?'Every naira has a job. Your plan matches your income.':diff>0?`<strong>${N(diff)}</strong> of your income isn’t assigned yet. Add it to a category or a savings goal.`:`Your plan is <strong>${N(-diff)}</strong> over your income. Trim a category to balance it.`}</div>`;
 const rows=(save)=>m.categories.filter(c=>SAVE.has(c.id)===save).map(c=>{const over=c.spent>c.allocated;
  return row(c,over?`${N(c.spent-c.allocated)} over budget`:`${N(c.allocated-c.spent)} ${save?'to go':'left'}`,`${N(c.spent)} <span style="color:var(--mute);font-weight:400">/ ${N(c.allocated)}</span>`,pct(c.spent,c.allocated),over?'warn':barCls(c.spent,c.allocated))}).join('');
 $('spendList').innerHTML=rows(false);$('saveList').innerHTML=rows(true);
 const tx=[...m.transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.id-a.id);
 $('actCount').textContent=tx.length?tx.length+' this month':'';
 $('txList').innerHTML=tx.length?tx.map(t=>{const c=cat(m,t.categoryId)||{id:'misc',name:'Other'};
  return `<div class="glass row" style="cursor:default"><span class="tile">${ic(c.id)}</span><div class="m"><div class="t"><span>${esc(t.note||c.name)}</span><span class="neg">-${N(t.amount)}</span></div><div class="s">${esc(c.name)} · ${new Date(t.date+'T00:00').toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</div></div>${isCur()?`<button class="x" data-del="${t.id}" aria-label="Delete expense">${ic('close')}</button>`:''}</div>`}).join('')
  :`<div class="glass empty"><span class="tile">${ic('list')}</span>No expenses yet. Add your first one and it will be sorted for you.</div>`;
 forecast(m,sp,inc,al);goals(m,inc);
}

function forecast(m,sp,inc,al){
 const ps=m.categories.map(c=>({c,p:proj(c)})),tp=sum(ps,x=>x.p),rem=inc-tp;
 const dl=Math.max(1,dim()-day()+1),safe=Math.max(0,(inc-sp)/dl);
 $('fcCard').innerHTML=`<div class="lbl" style="margin-top:0">${isCur()?'Projected spend by month-end':'Total spent'}</div><div class="big num">${N(tp)}</div>
 <div class="stats" style="display:block;margin-top:8px">${rem>=0?`You’re on track to finish with <strong>${N(rem)}</strong> left.`:`At this pace you’ll overspend by <strong>${N(-rem)}</strong>.`}${isCur()?`<br>Safe to spend about <strong>${N(safe)}</strong> a day for the rest of the month.`:''}</div>`;
 const w=ps.filter(x=>!SAVE.has(x.c.id)&&x.p>x.c.allocated*1.02).sort((a,b)=>(b.p-b.c.allocated)-(a.p-a.c.allocated));
 $('watch').innerHTML=w.length?w.map(x=>row(x.c,`Likely ${N(x.p)} vs ${N(x.c.allocated)} budget`,'+'+N(x.p-x.c.allocated),pct(x.c.spent,x.p),'warn')).join(''):`<div class="glass empty"><span class="tile">${ic('spark')}</span>Nothing is trending over budget. Keep it up.</div>`;
 const top=[...m.categories].filter(c=>c.spent>0&&!SAVE.has(c.id)).sort((a,b)=>b.spent-a.spent).slice(0,5),ts=sum(top,c=>c.spent);
 const all=sum(m.categories.filter(c=>!SAVE.has(c.id)),c=>c.spent);
 $('share').innerHTML=top.length?top.map(c=>row(c,N(c.spent),Math.round(c.spent/all*100)+'%',c.spent/all*100,'')).join(''):`<div class="glass empty">Log a few expenses to see your spending split.</div>`;
 const pk=Object.keys(data.months).filter(k=>k!==cur).sort().reverse();
 $('past').innerHTML=pk.length?pk.map(k=>{const x=data.months[k];return `<div class="glass row" data-m="${k}"><div class="m"><div class="t"><span>${lab(k)}</span><span>${N(sum(x.categories,c=>c.spent))}</span></div><div class="s">Budgeted ${N(sum(x.categories,c=>c.allocated))} · Saved ${N(sum(x.categories.filter(c=>SAVE.has(c.id)),c=>c.spent))}</div></div></div>`}).join(''):`<div class="glass empty">Past months show up here as each month rolls over.</div>`;
}

function goals(m,inc){
 const g=m.categories.filter(c=>SAVE.has(c.id)),plan=sum(g,c=>c.allocated),rate=inc?plan/inc*100:0;
 $('goalNote').innerHTML=`<div class="glass note">You’re planning to save <strong>${Math.round(rate)}%</strong> of your income. ${rate>=20?'That’s a strong habit. Keep it automatic.':`Aim for 20%. That’s about <strong>${N(inc*.2-plan)}</strong> more each month.`}</div>`;
 $('goalList').innerHTML=g.map(c=>row(c,c.spent>=c.allocated?'Goal reached this month':`${N(c.allocated-c.spent)} to go`,Math.round(pct(c.spent,c.allocated))+'%',pct(c.spent,c.allocated),c.spent>=c.allocated?'':'')).join('');
}

function setTab(t){tab=t;['budget','activity','forecast','goals'].forEach(x=>$('v-'+x).classList.toggle('hidden',x!==t));
 document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));window.scrollTo(0,0)}
$('nav').innerHTML=[['budget','home','Budget'],['activity','list','Activity'],['forecast','chart','Forecast'],['goals','target','Goals']].map(([t,i,l])=>`<button data-t="${t}" class="${t==='budget'?'on':''}">${ic(i)}<span>${l}</span></button>`).join('');
$('nav').onclick=e=>{const b=e.target.closest('button');if(b)setTab(b.dataset.t)};
$('logoMark').innerHTML=window.BADGER;$('addBtn').innerHTML=ic('plus')+'Add expense';$('editBtn').innerHTML=ic('edit')+'Edit budget';
$('expBtn').innerHTML=ic('down')+'Export CSV';$('autoBtn').innerHTML=ic('spark')+'Auto-plan from my spending';$('setBtn').innerHTML=ic('edit');$('outBtn').innerHTML=ic('out');$('outBtn').onclick=()=>window.bvSignOut();

function theme(){const d=document.documentElement,t=d.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');$('themeBtn').innerHTML=ic(t==='dark'?'sun':'moon')}
$('themeBtn').onclick=()=>{const d=document.documentElement,now=d.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');d.dataset.theme=now==='dark'?'light':'dark';theme()};
theme();

$('monthSel').onchange=e=>{view=e.target.value;render()};
document.body.addEventListener('click',e=>{
 const q=e.target.closest('[data-q]');if(q&&q.closest('#v-budget'))return openAdd(q.dataset.q);
 const mm=e.target.closest('[data-m]');if(mm){view=mm.dataset.m;setTab('budget');render();return}
 const d=e.target.closest('[data-del]');if(d)return del(+d.dataset.del);
 if(e.target.matches('[data-close]')||e.target.classList.contains('ov'))document.querySelectorAll('.ov').forEach(o=>o.classList.remove('on'));
});
function del(id){const m=M(),i=m.transactions.findIndex(t=>t.id===id);if(i<0)return;const t=m.transactions.splice(i,1)[0],c=cat(m,t.categoryId);if(c)c.spent=Math.max(0,c.spent-t.amount);store();render();toast('Expense deleted')}

function openAdd(id){
 if(!isCur())return toast('Switch to the current month to add expenses');
 manual=false;$('cat').innerHTML=M().categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 if(id)$('cat').value=id;$('amt').value='';$('note').value='';$('hint').textContent='';
 const n=new Date();$('date').value=`${mk(n)}-${String(n.getDate()).padStart(2,'0')}`;$('expOv').classList.add('on');setTimeout(()=>$('amt').focus(),50)}
$('addBtn').onclick=()=>openAdd();
$('note').oninput=e=>{if(manual)return;const g=guess(e.target.value);if(g){$('cat').value=g;$('hint').textContent='Sorted to '+cat(M(),g).name}else $('hint').textContent=''};
$('cat').onchange=()=>{manual=true;$('hint').textContent=''};
$('expForm').onsubmit=e=>{e.preventDefault();const a=parseFloat($('amt').value);if(!a||a<=0)return;
 const m=M(),id=$('cat').value,c=cat(m,id);if(c)c.spent=(c.spent||0)+a;
 m.transactions.push({id:Date.now(),categoryId:id,amount:a,note:$('note').value.trim(),date:$('date').value});
 store();render();$('expOv').classList.remove('on');toast('Expense added')};

function openSet(){
 if(!isCur())return toast('Switch to the current month to edit your budget');
 $('inc').value=data.income;$('allocs').innerHTML=M().categories.map(c=>`<div class="f"><label>${esc(c.name)}</label><input type="number" min="0" class="al" data-id="${c.id}" value="${c.allocated}"></div>`).join('');$('setOv').classList.add('on')}
$('editBtn').onclick=openSet;$('setBtn').onclick=openSet;
$('autoBtn').onclick=()=>{
 const inc=parseFloat($('inc').value)||data.income,past=Object.keys(data.months).filter(k=>k!==cur).map(k=>data.months[k]);
 const w=M().categories.map(c=>{const d=DEF.find(x=>x[0]===c.id),base=d?d[2]/335000*inc:c.allocated;
  if(SAVE.has(c.id)||!past.length)return base;
  const avg=sum(past,p=>(cat(p,c.id)||{spent:0}).spent)/past.length;return avg>0?avg:base});
 const t=sum(w,x=>x)||1,out=w.map(x=>Math.round(x/t*inc/100)*100);
 out[out.length-1]+=inc-sum(out,x=>x);
 document.querySelectorAll('.al').forEach((el,i)=>el.value=Math.max(0,out[i]));
 toast(past.length?'Planned from your past spending':'Planned from a balanced split')};
$('setForm').onsubmit=e=>{e.preventDefault();data.income=parseFloat($('inc').value)||0;
 document.querySelectorAll('.al').forEach(i=>{const c=cat(M(),i.dataset.id);if(c)c.allocated=parseFloat(i.value)||0});
 store();render();$('setOv').classList.remove('on');toast('Budget saved')};
$('resetBtn').onclick=()=>{if(!confirm('Reset this month’s budget and expenses to the original plan?'))return;
 data.months[cur]={categories:defCats(),transactions:[],committed:false};data.income=335000;view=cur;store();render();$('setOv').classList.remove('on');toast('Month reset')};

$('expBtn').onclick=()=>{const m=M(),r=[['Category','Budgeted','Spent','Left'],...m.categories.map(c=>[c.name,c.allocated,c.spent,c.allocated-c.spent]),[],['Date','Category','Note','Amount'],...m.transactions.map(t=>[t.date,(cat(m,t.categoryId)||{name:'Other'}).name,t.note||'',t.amount])];
 const csv=r.map(x=>x.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`budgetvest-${view}.csv`;a.click();toast('CSV downloaded')};

render();
