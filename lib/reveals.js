// Percent coordinates on each real 1280×720 clip: overlays replace its original label.
export const REVEALS=[
 {src:'/media/reveal-20.mp4',revealMs:1150,closed:[29,60,29,34],plate:[29,66,26,18]},
 {src:'/media/reveal-15.mp4',revealMs:1050,closed:[28,62,27,30],plate:[26,59,30,18]},
 {src:'/media/reveal-5.mp4',revealMs:1450,closed:[32,62,22,38],plate:[29,69,27,17]},
 {src:'/media/reveal-21.mp4',revealMs:600,closed:[27,70,34,30],plate:[30,64,31,17]}
];
export function selectReveal(s){if(!s.clipOrder||s.clipCursor>=s.clipOrder.length){s.clipOrder=REVEALS.map((_,i)=>i);for(let i=s.clipOrder.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[s.clipOrder[i],s.clipOrder[j]]=[s.clipOrder[j],s.clipOrder[i]];}if(s.revealClip?.src===REVEALS[s.clipOrder[0]].src)s.clipOrder.reverse();s.clipCursor=0;}s.revealClip=REVEALS[s.clipOrder[s.clipCursor++]];return s.revealClip;}
