import {MONEY} from '../lib/game.js';
// Masks follow the photographed board's four corners; original lettering stays visible.
export default function StagePrizeBoard({cases}:{cases:any[]}){
 const corners=[[[1341,239],[1495,227],[1343,570],[1497,570]],[[1505,227],[1666,214],[1505,570],[1667,570]]];
 const point=(a:number[],b:number[],f:number)=>a.map((v,i)=>v+(b[i]-v)*f).join(',');
 return <svg className="stagePrizeMasks" viewBox="0 0 1761 891" preserveAspectRatio="none" aria-label="Prize board; eliminated amounts darkened">{MONEY.map((v:number,i:number)=>{const [lt,rt,lb,rb]=corners[i<13?0:1],row=i%13,top=(row+.06)/13,bottom=(row+.94)/13;return <polygon key={v} points={[point(lt,lb,top),point(rt,rb,top),point(rt,rb,bottom),point(lt,lb,bottom)].join(' ')} fill="black" opacity={cases.some(c=>c.open&&c.value===v)?.84:0}><title>{v===.01?'$0.01':'$'+v.toLocaleString('en-CA')}{cases.some(c=>c.open&&c.value===v)?' eliminated':''}</title></polygon>})}</svg>
}
