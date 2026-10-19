// Seeded synthetic feature vectors. No real population or beauty ratings.
import {scoreFeatures} from './profile.js';
import {applyCeilings} from './rules.js';
export const SAMPLE_COUNT=10000;
export const FEATURE_DOMAINS={faceRatio:[1.1,2.1],midLower:[.55,1.6],eyeSpacing:[.30,.60],canthalTilt:[-12,18],eyeAspect:[1.6,5.5],browGap:[0,.20],jawRatio:[.55,1.05],chinRatio:[.12,.48],cheekTemple:[.85,1.2],noseEye:[.6,1.7],mouthNose:[.9,2.5],lipRatio:[.5,2.8],philtrumChin:[.08,.9],asymmetry:[0,.15],thirdsSpread:[0,.40]};
FEATURE_DOMAINS.lowerCheek=[.7,1.1];FEATURE_DOMAINS.fWHR=[1,2.7];FEATURE_DOMAINS.mentoPhiltrum=[.15,1];
let state=1618033;
function random(){state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296}
const samples=Array.from({length:SAMPLE_COUNT},()=>Object.fromEntries(Object.entries(FEATURE_DOMAINS).map(([key,[lo,hi]])=>[key,lo+random()*(hi-lo)])));
const cache=new Map();
export function benchmarkPercentile(score,preset='angular',weights,includeThirds=false,availableKeys,mode='standard',overrides={},policy={}){
  if(!Number.isFinite(score)||score<0||score>100)throw new Error('Score outside benchmark range.');
  const keys=availableKeys??Object.keys(FEATURE_DOMAINS).filter(k=>includeThirds||k!=='thirdsSpread');
  const key=JSON.stringify([preset,weights,[...keys].sort(),mode,overrides,policy]);
  if(!cache.has(key)){const values=samples.map(f=>{const features=Object.fromEntries(keys.map(k=>[k,f[k]])),score=scoreFeatures(features,preset,weights,mode,overrides).score;return applyCeilings(score,features,policy.rules,policy.enabled).score});if(cache.size>=6)cache.delete(cache.keys().next().value);cache.set(key,values)}
  const values=cache.get(key);return Math.round(100*(values.filter(v=>v<score).length+values.filter(v=>v===score).length*.5)/SAMPLE_COUNT);
}
export function ordinal(n){const t=n%100;return n+(t>=11&&t<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th')}
