import {bandFit,harshFit} from './profile.js';
export const LATERAL_CRITERIA=[
 {key:'jawAngle',name:'Jaw-outline angle',band:[115,130,35],unit:'degrees'},
 {key:'ramusBody',name:'Upper/lower outline ratio',band:[.55,.95,.70],unit:'ratio'},
 {key:'eline-upperLip',name:'Upper lip / nose–chin line',band:[-5,0,10],unit:'percent'},
 {key:'eline-lowerLip',name:'Lower lip / nose–chin line',band:[-3,2,10],unit:'percent'},
 {key:'noseChinAngle',name:'Nose-base / chin angle',band:[80,100,35],unit:'degrees'},
 {key:'chinOffset',name:'Chin-outline offset',band:[-.02,.16,.35],unit:'ratio'}
];
export const LATERAL_RULES=[{key:'lateral.chinOffset',label:'Chin-outline offset gate',operator:'lt',threshold:-.20,cap:55},{key:'lateral.jawAngle',label:'Jaw-outline angle gate',operator:'gt',threshold:145,cap:60}];
export function scoreLateral(result,mode='harsh',overrides={}){
 const values=Object.fromEntries((result?.metrics??[]).filter(m=>Number.isFinite(m.value)).map(m=>[m.key,m.value]));
 const criteria=LATERAL_CRITERIA.map(c=>{const candidate=overrides[c.key],band=Array.isArray(candidate)&&candidate.length===3&&candidate.every(Number.isFinite)&&candidate[0]<=candidate[1]&&candidate[2]>0?candidate:c.band;return {...c,band,value:values[c.key]??null,fit:mode==='harsh'?harshFit(values[c.key],band,c.key):bandFit(values[c.key],band)}});
 const usable=criteria.filter(c=>c.fit!==null),issues=[];
 if(!result)issues.push('Add a profile photo and mark its surface references.');
 else{if(!result.viewConfirmedByUser)issues.push('Confirm the approximately 90° side view.');if(!result.complete)issues.push('Complete all profile reference marks.');if(result.referenceAligned!==true)issues.push('Review the ear/under-eye reference alignment.');if(usable.length!==LATERAL_CRITERIA.length)issues.push('Some profile measurements are missing or degenerate.')}
 const raw=usable.length?usable.reduce((s,c)=>s+c.fit,0)/usable.length:null;
 return {score:raw===null?null:Math.round(raw*10)/10,rawScore:raw,criteria,available:usable.length,issues,eligible:issues.length===0,values};
}
export function combineScores(frontalScore,lateralResult,settings={}){
 const enabled=!!settings.enabled,weight=Math.max(0,Math.min(100,Number(settings.weight) || 0)),lateral=scoreLateral(lateralResult,settings.mode,settings.targets);
 const issues=enabled&&weight>0?lateral.issues:[];
 const eligible=Number.isFinite(frontalScore)&&issues.length===0;
 const raw=eligible?(enabled&&weight>0?frontalScore*(1-weight/100)+lateral.rawScore*weight/100:frontalScore):null;
 return {score:raw===null?null:Math.round(raw*10)/10,rawScore:raw,enabled,weight:enabled?weight:0,frontalShare:enabled?100-weight:100,lateral,issues,eligible};
}
