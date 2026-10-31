import {useState} from 'react';
const cash=(v:number)=>v===.01?'$0.01':'$'+Number(v).toLocaleString('en-CA');
export default function SecretPeek({state,act,busy}:{state:any,act:(type:string,data?:any)=>Promise<boolean>,busy:boolean}){
 const [open,Open]=useState(false);const info=state.myPeek,me=state.players.find((p:any)=>p.isMe);if(!me||!info||(!info.credits&&!info.history.length))return null;
 const last=info.history.at(-1);
 return <><button className="peekBadge" onClick={()=>Open(true)}>◈ Secret peek {info.credits?`(${info.credits})`:''}</button>{open&&<div className="modal peekModal"><section className="panel peekPanel"><button className="close" onClick={()=>Open(false)} aria-label="Hide secret peek">×</button><div className="eyebrow">FOR YOUR EYES ONLY</div><h2>Your secret peek.</h2><p>{info.credits?`${info.credits} peek${info.credits===1?'':'s'} available. Choose any unopened case except your own.`:'Your private case notes.'}</p>{!info.ready&&<p>Choose your own case first. Your reward is saved.</p>}
 {info.credits>0&&info.ready&&state.phase!=='finished'&&<div className="peekCases">{state.cases.filter((c:any)=>!c.open&&c.n!==me.case).map((c:any)=>{const seen=info.history.some((p:any)=>p.n===c.n);return <button key={c.n} disabled={busy||seen} onClick={()=>act('peek',{n:c.n})}>Case {c.n}{seen?' · seen':''}</button>})}</div>}
 {last&&<div className="peekValue"><span>CASE {last.n}</span><strong>{cash(last.value)}</strong></div>}
 {info.history.length>1&&<div className="peekHistory">{info.history.slice(0,-1).map((p:any)=><div key={p.n}>Case {p.n}<b>{cash(p.value)}</b></div>)}</div>}
 <p className="fine">Only your phone receives these values. The case stays closed for everyone else.</p><button className="gold" onClick={()=>Open(false)}>Hide & return to the game</button></section></div>}</>
}
