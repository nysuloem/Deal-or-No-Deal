import {active,participants,free,mutate,offerPlayers} from './game.js';
const dollars=n=>n===.01?'one cent':`${n.toLocaleString('en-US')} dollars`;
export const sceneKey=s=>[s.phase,s.round,s.kind,s.turn,s.revealIndex,s.pending?.n,s.last?.n,s.last?.by].join(':');
export const procedureKey=s=>s.phase==='challenge'?`challenge-${s.kind}`:['choose','eliminate','banker_call','banker_closed','swap','final_reveal'].includes(s.phase)?s.phase:null;
export function hostLine(s){
 const turn=s.players.find(p=>p.id===s.queue?.[s.turn]),key=procedureKey(s),first=key&&!s.proceduresExplained?.[key];
 const pick=lines=>lines[((s.round||0)+(s.turn||0)+(s.revealIndex||0))%lines.length];
 const left=(s.cases||[]).filter(c=>!c.open),big=left.filter(c=>c.value>=100000).length,top=Math.max(...left.map(c=>c.value));
 const leader=s.players.filter(p=>p.deal!=null).sort((a,b)=>b.deal-a.deal)[0];
 const opener=s.players.find(p=>p.id===(s.phase==='case_selected'?s.pending?.playerId:s.last?.playerId))||s.players.find(p=>p.name===(s.phase==='case_selected'?s.pending?.by:s.last?.by));
 const board=big?`${big} big prizes are still alive!`:`${dollars(top)} is still on the board!`;
 switch(s.phase){
 case 'challenge':
  if(s.mechanic==='hidden'){
   if(first)return s.kind==='initial'?'Phones ready! You have ten seconds to tap once in the box. The image stays hidden until everyone locks in. Closest chooses first; ties go to the faster tap. Hit the tiny centre and win a private peek into any unopened case except your own!':s.kind==='swap'?'One last lucky tap! Closest gets the first chance to keep or swap their case.':'Lucky tap! The two closest players each open one case. Only those openers without a deal can take this round’s offer. Here we GO!';
   return pick(['Phones ready! Let’s see who has the magic touch!','A little luck goes a LONG way! Tap when you’re ready!','Here we GO! Whose luck is about to turn?','Nobody tell the banker where you’re tapping!']);
  }
  return `${first?'Closest answer wins. ':''}${s.question[0]}`;
 case 'ranking':if(s.mechanic==='hidden'){const winner=s.players.find(p=>p.id===s.ranking[0]);return `${winner?.name||'Our first player'} takes the top spot! ${Object.values(s.answers).some(a=>a.perfect)?'A DIRECT HIT! Someone just earned a secret peek!':pick(['That is a lucky touch!','Let’s turn that luck into a great board!','The banker is watching!'])}`;}return `The answer is ${s.question[1]}. ${s.players.find(p=>p.id===s.ranking[0])?.name} goes first!`;
 case 'choose':return first?`${turn?.name}, choose your own case. It stays yours until the final chance to swap. One of these holds a MILLION dollars!`:`${turn?.name}, ${pick(['which case is calling your name?','trust that instinct!','let’s find you a winner!'])}`;
 case 'ready':return 'Your cases are LOCKED! Let’s get this game moving!';
 case 'eliminate':if(turn?.deal!=null)return `${turn.name}, you have ${dollars(turn.deal)} locked! ${pick(['Now you’re hunting BIG prizes to knock out!','Time to take the big money away from your rivals!','A huge number here could protect your deal!'])}`;return first?`${turn?.name}, choose one unclaimed case to open. We want the small prizes out and the big money still in play!`:`${turn?.name}, ${pick(['give us a little number!','the pressure is on. Where are we going?','make the banker nervous!','show us that lucky touch!'])} ${board}`;
 case 'case_selected':if(opener?.deal!=null)return `${s.pending.by} chooses case ${s.pending.n}. ${pick(['They want a BIG number! The other players certainly don’t!','A big prize here would make that locked deal look even better!','Are we about to knock out a rival’s dream?'])} OPEN THE CASE!`;return `${s.pending.by} chooses case ${s.pending.n}. ${pick(['Small money, come on!','Let’s keep that dream alive!','What have we got?','Hold your breath!'])} OPEN THE CASE!`;
 case 'case_reveal':if(opener?.deal!=null)return `Case ${s.last.n}: ${dollars(s.last.value)}! ${s.last.value>=100000?`${opener.name} knocks out a BIG prize! That’s good news for their locked deal, but painful for anyone still playing for more!`:s.last.value<=1000?`Only a small prize! ${opener.name} was hoping for something bigger. The remaining players will love that!`:`That prize is gone! ${opener.name} keeps ${dollars(opener.deal)} locked while the others weigh their chances.`}`;return `Case ${s.last.n}: ${dollars(s.last.value)}! ${s.last.value>=100000?pick(['OUCH! The banker will love that. We do NOT!','That is a big hit! Can we turn this around?','OH! Nobody wanted to see that!']):s.last.value<=1000?pick(['YES! That is how we do it!','Beautiful! The banker is sweating now!','Now THAT deserves some applause!']):pick(['Still plenty to play for!','The tension is building!','This board is keeping us guessing!'])}`;
 case 'banker_call':return first?`It’s the BANKER! ${offerPlayers(s).map(p=>p.name).join(' and ')} can take this offer. First to accept locks the deal; everyone else plays on. ${s.final?'This is the final offer!':''}`:s.final?'One last call. One last offer. This is IT!':leader?`${leader.name} has ${dollars(leader.deal)} locked. Can this offer beat it?`:pick(['The banker has seen enough. Here comes the call!','Let’s find out how nervous the banker is!','That phone can change everything!']);
 case 'banker':return ''; // Original Howie clip plays immediately.
 case 'banker_closed':
  if(s.accepted)return `${s.players.find(p=>p.id===s.accepted)?.name} takes ${dollars(s.offer)}! ${first?'That score is locked, but you still get to tap and open cases!':'What a decision!'} ${active(s).length?'Can anyone beat it?':'Now let’s see what was hiding in those cases!'}`;
  if(!offerPlayers(s).length)return 'No eligible deal-takers this round. Let’s see what these cases have in store!';
  return pick(['NO DEAL! You came to play!','NO DEAL! Those nerves of steel are getting a workout!','The offer stays with the banker! Let’s see if that courage pays off!']);
 case 'swap':return first?`${turn?.name}, keep case ${turn?.case}, or swap for an unclaimed case. This is your final decision.`:`${turn?.name}, case ${turn?.case}. ${pick(['Stay loyal, or follow your instinct?','Any last-minute second thoughts?','What is your gut telling you?'])}`;
 case 'final_reveal':return s.revealIndex===0?'Every decision has led to this. Let’s find out what you’ve been holding!':`${s.last.by}, your case holds ${dollars(s.last.value)}! ${s.players[s.revealIndex]?.name}, you’re next. The suspense is killing me!`;
 case 'finished':if(s.endReason==='all_deals')return `${s.players.find(p=>p.id===s.accepted)?.name} takes ${dollars(s.offer)}! Everyone has a deal. GAME OVER! ${s.players.filter(p=>s.winners.includes(p.id)).map(p=>p.name).join(' and ')} ${s.winners.length>1?'share the win':'wins'} with ${dollars(Math.max(...s.players.map(p=>p.deal)))}! WHAT A GAME!`;return `${s.last.by}, your case holds ${dollars(s.last.value)}! And our winner${s.winners.length>1?'s are':' is'} ${s.players.filter(p=>s.winners.includes(p.id)).map(p=>p.name).join(' and ')}! The winning score is ${dollars(Math.max(...s.players.map(p=>p.deal??s.cases.find(c=>c.n===p.case).value)))}. WHAT A GAME!`;
 default:return '';
 }
}
export function automaticAction(s,now){if(!s.automatic||s.phase==='lobby'||s.phase==='finished')return null;
if(s.phase==='challenge'){if(now<s.deadline&&(now<s.challengeStartsAt||participants(s).some(p=>!s.answers[p.id])))return null;return {type:'rank'};}
if(!s.autoAt||now<s.autoAt)return null;
switch(s.phase){case 'question_wait':case 'opening':case 'ready':case 'banker_closed':return {type:'challenge'};case 'ranking':return {type:'begin'};case 'case_selected':return {type:'open'};case 'case_reveal':case 'final_reveal':return {type:'next'};case 'banker_call':return {type:'offer'};case 'banker':return {type:'close_offer'};case 'choose':case 'eliminate':return {type:'case',n:free(s)[Math.floor(Math.random()*free(s).length)]?.n,asPlayer:s.queue[s.turn]};case 'swap':return {type:'keep',asPlayer:s.queue[s.turn]};default:return null;}}
export function transitionSchedule(s,now,speechMs=0){const min={opening:35200,ranking:8000,ready:4500,case_selected:4500,case_reveal:7500,banker_call:7000,banker_closed:6000,final_reveal:9000,finished:0};let duration=Math.max(min[s.phase]||3000,speechMs+1500);
if(s.phase==='challenge'){s.challengeStartsAt=now+speechMs+700;s.deadline=s.challengeStartsAt+(s.mechanic==='hidden'?10000:30000);s.autoAt=s.deadline;}
else if(['choose','eliminate','swap'].includes(s.phase)){s.autoAt=now+speechMs+45000;}
else if(s.phase==='banker'){s.offerOpensAt=now;s.autoAt=s.offerOpensAt+25000;}
else s.autoAt=s.phase==='finished'?null:now+duration;
if(s.phase==='ranking'&&s.mechanic==='hidden')s.autoAt=now+Math.max(2500,speechMs+800);s.sceneStartedAt=now;return s;}
