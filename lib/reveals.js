// The original amount determines the reaction: low eliminations are good, high ones are bad.
export const reactionTier=value=>value<=1000?'small':value>=100000?'large':'medium';
export const REVEALS=[
 {src:'/media/reveal-blue-300000.mp4',originalAmount:300000,revealMs:100,closed:[23,33,38,61],plate:[26.5,60.5,31,18]},
 {src:'/media/reveal-blue-25.mp4',originalAmount:25,revealMs:1100,closed:[27,54,34,42],plate:[30,69,28,16]},
 {src:'/media/reveal-blue-50.mp4',originalAmount:50,revealMs:1050,closed:[25,49,35,47],plate:[28.5,62.5,28,17]},
 {src:'/media/reveal-20.mp4',originalAmount:10000,revealMs:1150,closed:[29,60,29,34],plate:[29,66,26,18]},
 {src:'/media/reveal-15.mp4',originalAmount:500000,revealMs:1050,closed:[28,62,27,30],plate:[26,59,30,18]},
 {src:'/media/reveal-5.mp4',originalAmount:200000,revealMs:1450,closed:[32,62,22,38],plate:[29,69,27,17]},
 {src:'/media/reveal-21.mp4',originalAmount:50000,revealMs:600,closed:[27,70,34,30],plate:[30,64,31,17]},
 {src:'/media/reveal-penny.mp4',originalAmount:.01,revealMs:2600,closed:[26,58,29,35],plate:[28.5,69.5,26,17]},
 {src:'/media/reveal-300.mp4',originalAmount:300,revealMs:400,closed:[5,65,47,35],plate:[4.4,78.2,51.6,21.8]}
];
export function selectReveal(s){const value=s.last?.value;const exact=REVEALS.filter(c=>c.originalAmount===value);const candidates=exact.length?exact:Number.isFinite(value)?REVEALS.filter(c=>reactionTier(c.originalAmount)===reactionTier(value)):REVEALS;
 const usage=s.revealUsage??={};const least=Math.min(...candidates.map(c=>usage[c.src]||0));let choices=candidates.filter(c=>(usage[c.src]||0)===least);if(choices.length>1)choices=choices.filter(c=>c.src!==s.revealClip?.src);const selected=choices[Math.floor(Math.random()*choices.length)];usage[selected.src]=(usage[selected.src]||0)+1;s.revealUsage=usage;s.revealClip=selected;return selected;}
