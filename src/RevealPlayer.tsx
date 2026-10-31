import {useEffect,useRef,useState} from 'react';
import {REVEALS} from '../lib/reveals.js';
const clips=new Map<string,string>();
const requests=new Map<string,Promise<string>>();
function preload(src:string){if(!requests.has(src))requests.set(src,fetch(src).then(r=>{if(!r.ok)throw Error('Clip unavailable');return r.blob()}).then(blob=>{const url=URL.createObjectURL(blob);clips.set(src,url);return url}).catch(()=>src));return requests.get(src)!}
export function warmRevealClips(){for(const clip of REVEALS)void preload(clip.src)}
const cash=(n:number)=>n===.01?'$0.01':'$'+n.toLocaleString('en-CA');
export default function RevealPlayer({state,controller}:{state:any,controller:boolean}){
 const clip=state.revealClip,video=useRef<HTMLVideoElement|null>(null),[source,Source]=useState(clips.get(clip.src)||clip.src),[ready,Ready]=useState(false),[time,Time]=useState(0);
 const live=useRef(true),callback=useRef<number|undefined>(undefined);
 useEffect(()=>{live.current=true;void preload(clip.src).then(url=>{if(live.current&&video.current?.readyState===0)Source(url)});return()=>{live.current=false;const v=video.current;if(v&&callback.current!=null&&v.cancelVideoFrameCallback)v.cancelVideoFrameCallback(callback.current)}},[clip.src]);
 function frame(){const v=video.current;if(!v||v.seeking||v.readyState<2)return;
  const display=()=>{if(live.current){Ready(true);Time(v.currentTime);if(v.requestVideoFrameCallback&&!v.paused&&!v.ended)callback.current=v.requestVideoFrameCallback(display)}};
  if(v.requestVideoFrameCallback){if(callback.current!=null)v.cancelVideoFrameCallback(callback.current);callback.current=v.requestVideoFrameCallback(display);}else requestAnimationFrame(display);
 }
 const revealed=time*1000>=clip.revealMs,rect=revealed?clip.plate:clip.closed;
 return <div className="closeup realReveal" style={{opacity:ready?1:0,pointerEvents:ready?'auto':'none'}} data-video-ready={ready}>
 <div className="shotHeader"><span>{state.last.by}</span><strong>CASE {state.last.n}</strong></div>
 <div className="revealPicture"><video ref={video} src={source} preload="auto" autoPlay muted playsInline onLoadedMetadata={e=>{const v=e.currentTarget;const elapsed=Math.max(0,(Date.now()-state.sceneStartedAt)/1000);if(elapsed>.45)v.currentTime=Math.min(elapsed,Math.max(0,v.duration-.05));}} onLoadedData={frame} onSeeked={frame} onPlaying={frame} onTimeUpdate={e=>Time(e.currentTarget.currentTime)} onEnded={e=>{Ready(true);Time(e.currentTarget.duration)}}/>
 {ready&&<div className={'realLabel '+(revealed?'moneyLabel':'numberLabel')} style={{left:rect[0]+'%',top:rect[1]+'%',width:rect[2]+'%',height:rect[3]+'%'}}><span>{revealed?cash(state.last.value):state.last.n}</span></div>}
 </div>
 {state.phase==='finished'&&ready&&revealed&&<div className="winnerBanner">{state.players.filter((p:any)=>state.winners.includes(p.id)).map((p:any)=>p.name).join(' & ')} WINS · {cash(Math.max(...state.players.map((p:any)=>p.deal??p.value)))}</div>}
 </div>
}
