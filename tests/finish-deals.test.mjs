import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoom,mutate,publicState} from '../lib/game.js';
import {automaticAction,hostLine,transitionSchedule} from '../lib/show.js';
for(const [deals,offer,expected] of [[[90000,null],50000,[0]],[[50000,null],90000,[1]],[[90000,null],90000,[0,1]],[[null],10000,[0]]])test(`last deal locks winner, reveals all cases then closes: ${deals} / ${offer}`,()=>{
 const h='host-session-123456789012345',s=createRoom('END123',h);
 for(let i=0;i<deals.length;i++)mutate(s,{type:'join',name:'Player '+i},'player-session-123456789012345-'+i);
 s.players.forEach((p,i)=>{p.deal=deals[i];p.case=i+1});const p=s.players.at(-1);s.phase='banker';s.offer=offer;s.offerEligible=[p.id];s.passes=[];s.automatic=true;s.offerOpensAt=0;
 mutate(s,{type:'deal'},p.token,1000);assert.equal(s.phase,'final_reveal');assert.equal(s.endReason,'all_deals');assert.equal(s.revealIndex,0);const winners=expected.map(i=>s.players[i].id);assert.deepEqual(s.winners,winners);assert.ok(s.players.every(p=>!p.revealed));assert.ok(publicState(s,'spectator').players.every(p=>p.value===undefined));assert.match(hostLine(s),/deals are locked/);assert.throws(()=>mutate(s,{type:'deal'},p.token,1001));
 let now=2000;for(let i=0;i<s.players.length;i++){transitionSchedule(s,now,0);const a=automaticAction(s,s.autoAt+1);assert.equal(a.type,'next');mutate(s,a,h,s.autoAt+1);assert.equal(s.players[i].revealed,true);assert.ok(Number.isFinite(publicState(s,'spectator').players[i].value));assert.deepEqual(s.winners,winners);now+=20000;}
 assert.equal(s.phase,'final_case_reveal');assert.match(hostLine(s),/your case held/);transitionSchedule(s,now,0);assert.equal(automaticAction(s,s.autoAt+1).type,'finish');mutate(s,{type:'finish'},h);assert.equal(s.phase,'finished');assert.equal(hostLine(s),'');assert.deepEqual(s.winners,winners);assert.equal(automaticAction(s,1e12),null);
});
