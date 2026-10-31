export const BOARD_SIZE=1000;
export const HIT_RADIUS=100;
export const OBJECTS=['key','diamond','star','coin','heart','lightning','clover','fish'];
const random=n=>crypto.getRandomValues(new Uint32Array(1))[0]%n;
export function startHiddenChallenge(s,kind,now=Date.now()){
 const pool=OBJECTS.filter(x=>x!==s.hiddenChallenge?.object);
 s.kind=kind;s.mechanic='hidden';s.hiddenChallenge={id:crypto.randomUUID(),x:80+random(841),y:80+random(841),object:pool[random(pool.length)],size:BOARD_SIZE,hitRadius:HIT_RADIUS,objectSize:32};
 delete s.question;delete s.questionSource;s.answers={};s.ranking=[];s.phase='challenge';s.challengeStartsAt=now;s.deadline=now+10000;s.warningGiven=false;
 return s;
}
export function recordTap(s,p,a,now){
 if(!p||s.phase!=='challenge'||!s.hiddenChallenge||a.challengeId!==s.hiddenChallenge.id)throw Error('This tap challenge has closed.');
 if(now<s.challengeStartsAt||now>s.deadline)throw Error('Taps are closed.');
 if(s.answers[p.id])throw Error('Your first tap is already locked.');
 if(typeof a.x!=='number'||typeof a.y!=='number'||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<0||a.y<0||a.x>BOARD_SIZE||a.y>BOARD_SIZE)throw Error('Tap inside the box.');
 const x=Math.round(a.x),y=Math.round(a.y),dx=x-s.hiddenChallenge.x,dy=y-s.hiddenChallenge.y,distanceSquared=dx*dx+dy*dy;
 s.answers[p.id]={x,y,distanceSquared,distance:Math.sqrt(distanceSquared),perfect:distanceSquared<=s.hiddenChallenge.hitRadius**2,time:now,sequence:Object.keys(s.answers).length};
}
export function awardPeeks(s){for(const p of s.players){if(s.answers[p.id]?.perfect){p.peekCredits=(p.peekCredits||0)+1;}}}
export function usePeek(s,p,n,now){
 if(!p||!p.case||['lobby','opening','finished'].includes(s.phase))throw Error('Choose your own case before using a secret peek.');
 if(!(p.peekCredits>0))throw Error('You do not have a secret peek available.');
 const c=s.cases.find(c=>c.n===Number(n));if(!c||c.open||c.n===p.case)throw Error('Choose an unopened case other than your own.');
 if(p.peeks?.some(x=>x.n===c.n))throw Error('You have already peeked inside that case.');
 p.peekCredits--;p.peeks??=[];p.peeks.push({n:c.n,value:c.value,at:now});
}
