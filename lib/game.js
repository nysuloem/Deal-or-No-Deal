export const MONEY=[.01,1,5,10,25,50,75,100,200,300,400,500,750,1000,5000,10000,25000,50000,75000,100000,200000,300000,400000,500000,750000,1000000];
export const QUESTIONS=[
 ['How many squares are on a standard chessboard?',64,'FIDE standard chessboard: 8 × 8.'],
 ['How many bones are usually in an adult human skeleton?',206,'Standard adult anatomical count; individual variation exists.'],
 ['How many dots are on a standard six-sided die in total?',21,'1 + 2 + 3 + 4 + 5 + 6.'],
 ['How many keys are on a standard full-size piano?',88,'Standard modern piano: 52 white and 36 black keys.'],
 ['How many hearts does an octopus have?',3,'Two branchial hearts and one systemic heart.'],
 ['How many minutes are in a week?',10080,'7 × 24 × 60.'],
 ['How many edges does a cube have?',12,'Four on top, four on the bottom, four vertical.'],
 ['How many possible opening moves does White have in chess?',20,'Sixteen pawn moves and four knight moves.'],
 ['How many milliseconds are in one minute?',60000,'60 × 1,000.'],
 ['How many legs do five spiders have altogether?',40,'Five × eight.'],
 ['How many degrees are in the interior angles of a pentagon?',540,'(5 − 2) × 180.'],
 ['How many individual small cubes make a 4 × 4 × 4 cube?',64,'4 cubed.']
];
const fail=m=>{throw Error(m)};
export function createRoom(code,host){let values=[...MONEY];for(let i=values.length-1;i>0;i--){let j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[values[i],values[j]]=[values[j],values[i]];}return {code,host,phase:'lobby',players:[],cases:values.map((value,i)=>({n:i+1,value,open:false})),round:0,used:[],log:[],revision:0};}
export const active=s=>s.players.filter(p=>p.deal==null);
export const free=s=>s.cases.filter(c=>!c.open&&!s.players.some(p=>p.case===c.n));
export function challenge(s,kind,q,now){s.kind=kind;s.question=q;s.answers={};s.ranking=[];s.deadline=now+30000;s.phase='challenge';s.used.push(q[0]);}
function bank(s){s.phase='banker';s.passes=[];s.accepted=null;s.final=free(s).length<=2;let left=s.cases.filter(c=>!c.open);let factor=Math.min(.95,.38+s.round*.065);s.offer=Math.max(.01,Math.round(left.reduce((a,c)=>a+c.value,0)/left.length*factor/10)*10);s.log.unshift(`Banker offers $${s.offer.toLocaleString()}`);}
export function mutate(s,a,token,now=Date.now()){
 let p=s.players.find(p=>p.token===token),host=token===s.host;
 if(a.type==='join'){if(s.phase!=='lobby')fail('This game has started.');if(s.players.length>=12)fail('This room is full.');let name=String(a.name||'').trim().slice(0,30);if(!name)fail('Enter your name.');if(s.players.some(p=>p.token===token))return s; if(!token||token.length<20)fail('Invalid player session.'); if(a.photo&&(!/^data:image\/(jpeg|png|webp);base64,/.test(a.photo)||a.photo.length>180000))fail('Please use a smaller photo.');s.players.push({id:crypto.randomUUID(),token,name,photo:a.photo||'',case:null,deal:null,revealed:false});}
 else if(a.type==='guess'){if(!p||p.deal!=null||s.phase!=='challenge'||now>s.deadline)fail('Answers are closed.');if(s.answers[p.id])fail('Your answer is already locked.');let n=Number(a.value);if(a.value===''||!Number.isFinite(n)||Math.abs(n)>1e15)fail('Enter a valid number.');s.answers[p.id]={value:n,time:now,sequence:Object.keys(s.answers).length};}
 else if(a.type==='rank'){if(!host||s.phase!=='challenge')fail('Only the host can reveal answers.');if(now<s.deadline&&active(s).some(p=>!s.answers[p.id]))fail('Wait for answers or the timer.');s.ranking=active(s).map(p=>{let v=s.answers[p.id];return {id:p.id,distance:v?Math.abs(v.value-s.question[1]):null,time:v?.time??Infinity,sequence:v?.sequence??Infinity};}).sort((a,b)=>(a.distance??Infinity)-(b.distance??Infinity)||a.time-b.time||a.sequence-b.sequence||a.id.localeCompare(b.id)).map(x=>x.id);s.phase='ranking';}
 else if(a.type==='begin'){if(!host||s.phase!=='ranking')fail('Not ready.');s.queue=s.kind==='eliminate'?s.ranking.slice(0,Math.min(2,s.ranking.length)):s.ranking.slice();s.turn=0;s.phase=s.kind==='initial'?'choose':s.kind==='swap'?'swap':'eliminate';s.picks=0;}
 else if(a.type==='case'){if(!p||s.queue?.[s.turn]!==p.id)fail('It is not your turn.');let c=s.cases.find(c=>c.n===Number(a.n));if(!c||c.open||!free(s).some(x=>x.n===c.n))fail('That case is unavailable.');if(s.phase==='choose'){p.case=c.n;s.turn++;if(s.turn>=s.queue.length)s.phase='ready';}
 else if(s.phase==='eliminate'){c.open=true;s.last={n:c.n,value:c.value,by:p.name};s.log.unshift(`${p.name} opened case ${c.n}: $${c.value.toLocaleString()}`);s.picks++;s.turn++;s.phase='case_reveal';}
 else if(s.phase==='swap'){p.case=c.n;s.turn++;if(s.turn>=s.queue.length){s.phase='final_reveal';s.revealIndex=0;}}else fail('Cases cannot be chosen now.');}
 else if(a.type==='keep'){if(!p||s.phase!=='swap'||s.queue[s.turn]!==p.id)fail('It is not your turn.');s.turn++;if(s.turn>=s.queue.length){s.phase='final_reveal';s.revealIndex=0;}}
 else if(a.type==='deal'){if(!p||p.deal!=null||s.phase!=='banker'||s.passes.includes(p.id))fail('This offer is no longer available.');p.deal=s.offer;s.accepted=p.id;s.phase='banker_closed';s.log.unshift(`${p.name} accepted $${s.offer.toLocaleString()}`);}
 else if(a.type==='pass'){if(!p||p.deal!=null||s.phase!=='banker')fail('This offer is closed.');if(!s.passes.includes(p.id))s.passes.push(p.id);if(active(s).every(p=>s.passes.includes(p.id)))s.phase='banker_closed';}
 else if(a.type==='next'){if(!host)fail('Host only.');if(s.phase==='case_reveal'){if(s.turn<s.queue.length&&free(s).length>2)s.phase='eliminate';else bank(s);}else if(s.phase==='final_reveal'){let p=s.players[s.revealIndex++];if(!p)fail('All cases are revealed.');p.revealed=true;s.last={n:p.case,value:s.cases.find(c=>c.n===p.case).value,by:p.name};if(s.revealIndex>=s.players.length){s.phase='finished';let best=Math.max(...s.players.map(p=>p.deal??s.cases.find(c=>c.n===p.case).value));s.winners=s.players.filter(p=>(p.deal??s.cases.find(c=>c.n===p.case).value)===best).map(p=>p.id);}}else fail('No reveal to continue.');}
 else fail('Unknown action.');
 s.revision++;return s;
}
export function publicState(s,token){let host=token===s.host;return {...s,host:undefined,isHost:host,players:s.players.map(({token,...p})=>({...p,isMe:token===arguments[1],value:p.revealed?s.cases.find(c=>c.n===p.case)?.value:undefined})),cases:s.cases.map(c=>({...c,value:c.open?c.value:undefined})),question:s.question?[s.question[0],...(['challenge'].includes(s.phase)?[]:s.question.slice(1))]:undefined,answers:s.phase==='challenge'?Object.fromEntries(Object.keys(s.answers).map(k=>[k,{submitted:true}])):s.answers};}
