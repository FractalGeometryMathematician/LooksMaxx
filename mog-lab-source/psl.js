// Guide-based vocabulary; numeric conversion and weights are authored by this app.
export const PSL_SOURCE='https://looksmaxxers.com/pages/psl-scale-explained-the-looksmaxxing-rating-system';
export const PSL_BANDS=[
 {range:'Below 3.5',label:'Below LTN'},
 {range:'3.5–<4.5',label:'LTN'},
 {range:'4.5–<5.5',label:'MTN'},
 {range:'5.5–<6.5',label:'HTN'},
 {range:'6.5–<7.0',label:'HTN–Chadlite transition'},
 {range:'7.0–7.5',label:'Chadlite'},
 {range:'>7.5–<8.0',label:'Chadlite–Chad transition'},
 {range:'8.0–<9.0',label:'Chad'},
 {range:'9.0',label:'Gigachad'}
];
export function pslTier(rating){
 if(!Number.isFinite(rating))return 'Unrated';
 return rating<3.5?'Below LTN':rating<4.5?'LTN':rating<5.5?'MTN':rating<6.5?'HTN':rating<7?'HTN–Chadlite transition':rating<=7.5?'Chadlite':rating<8?'Chadlite–Chad transition':rating<9?'Chad':'Gigachad';
}
// Acklam inverse-normal approximation. Used only for optional pool-relative scaling.
export function normalQuantile(p){
 if(!(p>0&&p<1))throw new Error('Probability must be between zero and one.');
 const a=[-39.6968302866538,220.946098424521,-275.928510446969,138.357751867269,-30.6647980661472,2.50662827745924],b=[-54.4760987982241,161.585836858041,-155.698979859887,66.8013118877197,-13.2806815528857],c=[-.00778489400243029,-.322396458041136,-2.40075827716184,-2.54973253934373,4.37466414146497,2.93816398269878],d=[.00778469570904146,.32246712907004,2.445134137143,3.75440866190742];
 const tail=q=>(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
 if(p<.02425)return tail(Math.sqrt(-2*Math.log(p)));
 if(p>1-.02425)return -tail(Math.sqrt(-2*Math.log(1-p)));
 const q=p-.5,r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
export function pslRating(score,{mode='heuristic',comparison,ceilings=[]}={}){
 const base={rating:null,label:'Unrated',mode,source:PSL_SOURCE,formula:mode==='pool'?'5 + inverseNormal(smoothed within-pool rank)':'1 + 0.08 × capped target fit',populationCalibrated:false};
 if(!Number.isFinite(score))return {...base,reason:'Complete a valid scan first.'};
 let raw,rank=null,count=0;
 if(mode==='pool'){
  const rows=(comparison?.rows??[]).filter(r=>Number.isFinite(r.score));count=rows.length;
  if(count<5)return {...base,count,reason:'Import at least 5 compatible measured reports for pool-normalized PSL.'};
  const below=rows.filter(r=>r.score<score).length,ties=rows.filter(r=>r.score===score).length;
  rank=(below+.5*ties+.5)/(count+1);raw=5+normalQuantile(rank);
 }else raw=1+.08*Math.max(0,Math.min(100,score));
 const caps=ceilings.filter(c=>Number.isFinite(c.cap)&&c.cap>=0&&c.cap<=100).map(c=>1+.08*c.cap),ceiling=caps.length?Math.min(...caps):9;
 const final=Math.min(9,Math.max(1,raw),ceiling),rating=Math.round(final*10)/10;
 return {...base,rating,label:pslTier(rating),rawRating:raw,ceiling,count,smoothedPoolRank:rank,deduction:Math.round(Math.max(0,raw-final)*10)/10,reason:mode==='pool'?'Relative to this imported pool; no global population calibration.':'Heuristic target-fit conversion; no population calibration.'};
}
