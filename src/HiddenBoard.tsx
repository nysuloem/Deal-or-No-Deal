import {useEffect,useRef,useState} from 'react';
export function TargetIcon({name}:{name:string}){const shapes:any={
 key:<><circle cx="10" cy="11" r="6" fill="none" strokeWidth="4"/><path d="M14 15 27 28M22 23l4-4M25 26l4-4" fill="none" strokeWidth="4"/></>,
 diamond:<path d="m16 3 13 12-13 15L3 15Z M3 15h26M10 4l6 26 6-26" fill="none" strokeWidth="2"/>,
 star:<path d="m16 2 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Z"/>,
 coin:<><circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="10" fill="none" stroke="#63430e" strokeWidth="2"/><path d="M18 9c-9-2-10 7-2 7s6 9-3 7M16 6v20" fill="none" stroke="#63430e" strokeWidth="2"/></>,
 heart:<path d="M16 28 4 17C-4 8 9-3 16 8c7-11 20 0 12 9Z"/>,
 lightning:<path d="M19 1 5 18h10l-2 13 15-19H18Z"/>,
 clover:<><circle cx="10" cy="11" r="7"/><circle cx="22" cy="11" r="7"/><circle cx="16" cy="21" r="7"/><path d="M16 23v9" fill="none" strokeWidth="3"/></>,
 fish:<><path d="M2 16c8-13 16-13 25 0-9 13-17 13-25 0Zm23 0 7-9v18Z"/><circle cx="10" cy="13" r="2" fill="#191104" stroke="none"/></>
 };return <svg viewBox="0 0 32 32" fill="#ffcf63" stroke="#ffcf63" aria-hidden="true">{shapes[name]||shapes.star}</svg>}
export default function HiddenBoard({state,now,onTap,reveal=false}:{state:any,now:number,onTap?:(x:number,y:number)=>Promise<boolean>,reveal?:boolean}){
 const [local,Local]=useState<any>(null),locked=useRef(false);const t=state.target;
 useEffect(()=>{Local(null);locked.current=false},[t?.id]);
 const me=state.players.find((p:any)=>p.isMe),serverTap=state.myTap,point=serverTap||local;
 const open=!!onTap&&now>=state.challengeStartsAt&&now<=state.deadline&&!point&&!locked.current&&!reveal;
 async function submit(x:number,y:number){if(!open||locked.current)return;locked.current=true;Local({x,y});const ok=await onTap!(Math.max(0,Math.min(1000,x)),Math.max(0,Math.min(1000,y)));if(!ok){locked.current=false;Local(null)}}
 return <div className="hiddenBoardWrap"><button type="button" className={'hiddenBoard '+(open?'armed ':'')+(reveal?'revealed':'')} aria-label={reveal?'The hidden image and tap results':'Tap once inside the box to guess the hidden image location'} aria-disabled={!open} onPointerDown={e=>{e.preventDefault();if(!open)return;const r=e.currentTarget.getBoundingClientRect();submit((e.clientX-r.left)/r.width*1000,(e.clientY-r.top)/r.height*1000)}} onKeyDown={e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();submit(500,500)}}}>
 {!reveal&&<span className="boardVeil"/>}
 {reveal&&t?.x!=null&&<span className="hiddenObject" style={{left:t.x/10+'%',top:t.y/10+'%',width:(t.objectSize||32)/10+'%'}}><TargetIcon name={t.object}/></span>}
 {reveal&&state.ranking.map((id:string,i:number)=>{const a=state.answers[id],p=state.players.find((p:any)=>p.id===id);return a?.x!=null?<span key={id} className={'tapMarker resultMarker '+(a.perfect?'directHit':'')} style={{left:a.x/10+'%',top:a.y/10+'%'}} title={p?.name}><b>{i+1}</b></span>:null})}
 {!reveal&&point&&<span className="tapMarker myMarker" style={{left:point.x/10+'%',top:point.y/10+'%'}}/>}
 </button><div className="boardStatus">{reveal?<><TargetIcon name={t?.object}/><span>{t?.object?.toUpperCase()} · SMALL IMAGE, BIG LUCK</span></>:point?'✓ FIRST TAP LOCKED':open?'ONE TAP · TRUST YOUR LUCK':now<state.challengeStartsAt?'GET READY…':'TAPS CLOSED'}</div></div>
}
