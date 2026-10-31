import {useState} from 'react';
export default function OfferControls({state,player,act,busy}:{state:any,player:any,act:(type:string,data?:any)=>Promise<boolean>,busy:boolean}){
 const [editing,Editing]=useState(false),[amount,Amount]=useState('');
 return <><div className="dealButtons"><button className="deal" disabled={busy} onClick={()=>act('deal')}>DEAL</button><button className="noDeal" disabled={busy} onClick={()=>act('pass')}>NO DEAL</button><button className="counterButton" disabled={busy||player.counterUsed} onClick={()=>Editing(!editing)}>{player.counterUsed?'COUNTER USED':'COUNTEROFFER'}</button></div>
 {editing&&!player.counterUsed&&<form className="counterForm" onSubmit={e=>{e.preventDefault();act('counteroffer',{amount:Number(amount)})}}><label>Your counteroffer ($)<input aria-label="Your counteroffer" type="number" min={state.offer+.01} max="1000000" step="0.01" inputMode="decimal" value={amount} onChange={e=>Amount(e.target.value)} required autoFocus/></label><button className="gold" disabled={busy}>Send to banker</button><small>One attempt per game. A rejection leaves the original offer available.</small></form>}</>
}
