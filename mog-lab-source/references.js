import {CRITERIA,scoreFeatures} from './profile.js';
import {combineScores} from './combined.js';
import {applyCeilings} from './rules.js';
const KEYS=new Set(CRITERIA.map(c=>c.key));
export function normalizePool(input){
 if(!input||typeof input!=='object')throw new Error('Use a JSON report or reference-pool object.');
 const source=Array.isArray(input)?input:input.records??[input];
 if(!Array.isArray(source)||source.length>5000)throw new Error('Use a pool of at most 5,000 reports.');
 const records=[],seen=new Set();let skipped=0;
 for(const item of source){
  if(!item||typeof item!=='object'||item.syntheticDemo||item.photoChecks?.passed===false){skipped++;continue}
  const raw=item.features&&typeof item.features==='object'&&!Array.isArray(item.features)?item.features:Object.fromEntries((Array.isArray(item.measurements)?item.measurements:[]).map(m=>[m.key,m.value]));
  const features=Object.fromEntries(Object.entries(raw).filter(([k,v])=>KEYS.has(k)&&Number.isFinite(v)));
  if(Object.keys(features).length<8){skipped++;continue}
  const supplied=item.lateralProfile??item.lateral;
  const lateral=supplied&&Array.isArray(supplied.metrics)?{...supplied,metrics:supplied.metrics.filter(m=>m&&typeof m.key==='string'&&Number.isFinite(m.value))}:null;
  const fingerprint=JSON.stringify([Object.entries(features).sort(([a],[b])=>a.localeCompare(b)),lateral?.metrics?.map(m=>[m.key,m.value]).sort(([a],[b])=>a.localeCompare(b))??[]]);
  if(seen.has(fingerprint)){skipped++;continue}seen.add(fingerprint);
  records.push({label:String(item.label??item.name??'Reference '+(records.length+1)).slice(0,80),features,lateral});
 }
 if(!records.length)throw new Error('No usable numeric reports found. Import actual app reports; synthetic demos are excluded.');
 return {name:String(input.name??'Imported reference pool').slice(0,100),source:String(input.source??'User-provided numeric reports').slice(0,200),records,skipped};
}
export function comparePool(subjectScore,featureKeys,pool,settings={}){
 if(!Number.isFinite(subjectScore))return {percentile:null,count:0,rows:[],reason:'Complete the current score first.'};
 if(!pool?.records?.length)return {percentile:null,count:0,rows:[],reason:'Import a reference pool to compare measured reports.'};
 const rows=[];
 for(const record of pool.records){
  if(featureKeys.some(k=>!Number.isFinite(record.features[k])))continue;
  const features=Object.fromEntries(featureKeys.map(k=>[k,record.features[k]]));
  const front=scoreFeatures(features,settings.preset,settings.weights,settings.mode,settings.targets);
  const combined=combineScores(front.score,record.lateral,{...settings.combined,mode:settings.mode});
  if(!combined.eligible)continue;
  const gatedFeatures={...features,...(combined.enabled&&combined.weight>0?Object.fromEntries(Object.entries(combined.lateral.values).map(([k,v])=>['lateral.'+k,v])):{})};
  const final=applyCeilings(combined.score,gatedFeatures,settings.policy?.rules,settings.policy?.enabled).score;
  rows.push({label:record.label,score:final});
 }
 rows.sort((a,b)=>b.score-a.score);
 if(rows.length<5)return {percentile:null,count:rows.length,rows,reason:'Need at least 5 compatible reports with the same available traits and views.'};
 const below=rows.filter(r=>r.score<subjectScore).length,ties=rows.filter(r=>r.score===subjectScore).length;
 return {percentile:Math.round(100*(below+ties*.5)/rows.length),count:rows.length,rows,reason:'Rank within the imported pool only.'};
}
