import {active,free,mutate} from './game.js';
const dollars=n=>n===.01?'one cent':`${n.toLocaleString('en-US')} dollars`;
export const sceneKey=s=>[s.phase,s.round,s.kind,s.turn,s.revealIndex,s.pending?.n,s.last?.n,s.last?.by].join(':');
export function hostLine(s){let turn=s.players.find(p=>p.id===s.queue?.[s.turn]);switch(s.phase){
case 'challenge':return `It's time for ${s.kind==='swap'?'the final swap challenge':'a challenge round'}! ${s.kind==='initial'?'Closest guess chooses their case first.':s.kind==='swap'?'Closest guess gets the first chance to swap.':'The two closest contestants will each eliminate one case.'} Here is your question. ${s.question[0]} You have thirty seconds. Lock in your answer!`;
case 'ranking':return `Time's up! The correct answer is ${s.question[1]}. ${s.players.find(p=>p.id===s.ranking[0])?.name||'Our first contestant'} is first in line. ${s.question[2]}`;
case 'choose':return `${turn?.name}, choose your case. One of these cases holds a million dollars. Trust your instinct!`;
case 'ready':return 'Your cases are locked. Now, who gets to open the first cases? Let’s find out.';
case 'eliminate':return `${turn?.name}, it's your turn. Choose one unclaimed case to eliminate. Keep the big money on the board!`;
case 'case_selected':return `${s.pending.by} chooses case ${s.pending.n}. Let's see what's inside. Open the case!`;
case 'case_reveal':return `Case ${s.last.n}: ${dollars(s.last.value)}. ${s.last.value>=100000?'Oh! A big amount is off the board.':s.last.value<=1000?'That is the kind of number we want to see!':'The stakes keep changing.'}`;
case 'banker_call':return `The banker is calling. ${s.final?'This is the final offer.':'Let’s hear what the banker has to say.'}`;
case 'banker':return `The banker is offering ${dollars(s.offer)}. Only one contestant can take this deal. First to accept gets it.`;
case 'banker_closed':return s.accepted?`${s.players.find(p=>p.id===s.accepted)?.name} takes the deal for ${dollars(s.offer)}! ${active(s).length?'Everyone else plays on. Can you beat it?':'Now let’s reveal those cases.'}`:'No deal! You’re keeping your nerve. Let’s play on.';
case 'swap':return `${turn?.name}, one last decision. Keep case ${turn?.case}, or swap it for an unclaimed case. The choice is yours.`;
case 'final_reveal':return s.revealIndex===0?'Every decision has led to this. It is time to open your cases, one by one.':`${s.last.by}, your case holds ${dollars(s.last.value)}. ${s.players[s.revealIndex]?.name}, you’re next.`;
case 'finished':return `${s.last.by}, your case holds ${dollars(s.last.value)}. And our winner${s.winners.length>1?'s are':' is'} ${s.players.filter(p=>s.winners.includes(p.id)).map(p=>p.name).join(' and ')}! The winning score is ${dollars(Math.max(...s.players.map(p=>p.deal??s.cases.find(c=>c.n===p.case).value)))}. What a game!`;
default:return '';
}}
export function automaticAction(s,now){if(!s.automatic||s.phase==='lobby'||s.phase==='finished')return null;
if(s.phase==='challenge'){if(now<s.deadline&&(now<s.challengeStartsAt||active(s).some(p=>!s.answers[p.id])))return null;return {type:'rank'};}
if(!s.autoAt||now<s.autoAt)return null;
switch(s.phase){case 'opening':case 'ready':case 'banker_closed':return {type:'challenge'};case 'ranking':return {type:'begin'};case 'case_selected':return {type:'open'};case 'case_reveal':case 'final_reveal':return {type:'next'};case 'banker_call':return {type:'offer'};case 'banker':return {type:'close_offer'};case 'choose':case 'eliminate':return {type:'case',n:free(s)[Math.floor(Math.random()*free(s).length)]?.n,asPlayer:s.queue[s.turn]};case 'swap':return {type:'keep',asPlayer:s.queue[s.turn]};default:return null;}}
export function transitionSchedule(s,now,speechMs=0){const min={opening:35200,ranking:8000,ready:4500,case_selected:4500,case_reveal:6500,banker_call:7000,banker_closed:6000,final_reveal:9000,finished:0};let duration=Math.max(min[s.phase]||3000,speechMs+1500);
if(s.phase==='challenge'){s.challengeStartsAt=now+speechMs+700;s.deadline=s.challengeStartsAt+30000;s.autoAt=s.deadline;}
else if(['choose','eliminate','swap'].includes(s.phase)){s.autoAt=now+speechMs+45000;}
else if(s.phase==='banker'){s.offerOpensAt=now+speechMs+4000;s.autoAt=s.offerOpensAt+25000;}
else s.autoAt=s.phase==='finished'?null:now+duration;
s.sceneStartedAt=now;return s;}
