import test from 'node:test';
import assert from 'node:assert/strict';
import {REVEALS,selectReveal,reactionTier} from '../lib/reveals.js';
test('known prize amounts get their original video',()=>{for(const c of REVEALS){const s={last:{value:c.originalAmount}};assert.equal(selectReveal(s).src,c.src);}});
test('other prize values stay in the correct reaction group and vary within it',()=>{for(const value of [1,5,100,750,1000,5000,25000,75000,100000,400000,750000,1000000]){let s={last:{value}},seen=new Set();for(let i=0;i<8;i++){const c=selectReveal(s);assert.equal(reactionTier(c.originalAmount),reactionTier(value));seen.add(c.src);}assert.ok(seen.size>=2);}});
