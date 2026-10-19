export const DEFAULT_RULES=[
 {key:'canthalTilt',label:'Negative eye-tilt gate',operator:'lt',threshold:-4,cap:62},
 {key:'midLower',label:'Midface-ratio gate',operator:'gt',threshold:1.05,cap:65},
 {key:'jawRatio',label:'Jaw-width gate',operator:'lt',threshold:.65,cap:60}
];
export function applyCeilings(score,features,rules=[],enabled=false){
 if(score===null||!enabled)return {score,uncappedScore:score,applied:[],deduction:0};
 const valid=rules.filter(r=>Number.isFinite(features[r.key])&&Number.isFinite(r.threshold)&&Number.isFinite(r.cap)&&r.cap>=0&&r.cap<=100&&['lt','gt'].includes(r.operator));
 const triggered=valid.filter(r=>r.operator==='lt'?features[r.key]<r.threshold:features[r.key]>r.threshold);
 const ceiling=triggered.length?Math.min(...triggered.map(r=>r.cap)):100;
 const final=Math.min(score,ceiling);
 return {score:final,uncappedScore:score,deduction:Math.round((score-final)*10)/10,applied:triggered.map(r=>({...r,value:features[r.key],binding:score>r.cap&&r.cap===ceiling})),enabled:true};
}
export function gameTier(score){
 if(score===null||!Number.isFinite(score))return {rating:null,label:'Unrated'};
 const rating=Math.round(Math.max(0,Math.min(100,score)))/10;
 const label=rating<5?'Sub-five':rating<5.5?'LTN / Normie':rating<6?'MTN / Normie':rating<6.5?'HTN / Normie':rating<7.5?'Chadlite':rating<8.5?'Chad':'Gigachad';
 return {rating,label,basis:'Configurable game tiers, not human population ranks.'};
}
